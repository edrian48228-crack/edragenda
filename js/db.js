// Almacén con localStorage + migración compatible hacia adelante.
const DB = (() => {
  const KEY = 'taller_db_v1';
  const SCHEMA_VERSION = 9;
  const DEFAULT_DEVICES = [
    'Televisor','Smart TV','Monitor','Laptop','PC de escritorio','Tablet',
    'Teléfono móvil','Impresora','Microondas','Lavadora','Refrigerador',
    'Aire acondicionado','Cocina eléctrica','Equipo de sonido','Cámara',
    'Consola de videojuegos','Router / Módem','Cargador','Batería','Otro'
  ];
  const DEFAULT_PRODUCTS = [
    'Cargador','Cable USB','Cable Tipo C','Cable Lightning','Cable HDMI',
    'Mica protectora','Protector de pantalla','Funda / Estuche','MicroSD','Memoria USB',
    'Adaptador OTG','Adaptador','Teléfono','Pantalla','Batería','Pila',
    'Micrófono','Botones','Auriculares','Audífonos','Bocina / Parlante',
    'Tarjeta SIM','Soporte','Control remoto','Mouse','Teclado',
    'Webcam','Lector de tarjetas','Hub USB','Fuente de poder','Herramientas',
    'Pegamento','Cinta','Tornillos','Conectores','Otro'
  ];
  const defaults = {
    schemaVersion: SCHEMA_VERSION,
    settings: {
      appName: 'Taller',
      logo: null,
      logoPreset: 'tools',
      requirePassword: true,
      passwordHash: null,
      securityQuestions: [], // [{q, aHash}]
      deviceTypes: DEFAULT_DEVICES.slice(),
      productTypes: DEFAULT_PRODUCTS.slice(),
      defaultWarrantyDays: 30,
      productMinStock: {},
      creator: { phone: '', whatsapp: '' },
      github: {
        enabled: false, user: '', repo: '', branch: 'main',
        path: 'taller-data.json', token: '',
        autoSync: true, lastSyncAt: null, lastSha: null
      }
    },
    repairs: [],
    transactions: [],
    counter: 1,
    txCounter: 1
  };
  let data = load();
  migrate();

  function load(){
    try{
      const raw = localStorage.getItem(KEY);
      if(!raw) return structuredClone(defaults);
      const p = JSON.parse(raw);
      return deepMerge(structuredClone(defaults), p);
    }catch(e){ return structuredClone(defaults); }
  }
  function deepMerge(target, src){
    for(const k in src){
      if(src[k] && typeof src[k]==='object' && !Array.isArray(src[k])){
        target[k] = deepMerge(target[k]||{}, src[k]);
      } else if(src[k] !== undefined){
        target[k] = src[k];
      }
    }
    return target;
  }
  function migrate(){
    let changed = false;
    for(const r of data.repairs){
      if(r.devicePhoto && !r.devicePhotos){ r.devicePhotos = [r.devicePhoto]; changed = true; }
      if(!r.devicePhotos) r.devicePhotos = [];
      if(!r.naFields) r.naFields = [];
      if(!Array.isArray(r.clientPhones)){
        r.clientPhones = r.clientPhone ? [r.clientPhone] : [];
        changed = true;
      }
      if(r.clientAddress === undefined) r.clientAddress = null;
      if(r.clientIdNumber === undefined) r.clientIdNumber = null;
      if(r.status === 'awaiting'){ r.status = 'in_progress'; changed = true; }
      if(r.warrantyDays === undefined){ r.warrantyDays = null; changed = true; }
      if(r.deliveredAt === undefined){
        r.deliveredAt = r.status === 'delivered' ? (r.updatedAt || r.createdAt || null) : null;
        changed = true;
      }
      if(!Array.isArray(r.parts)){ r.parts = []; changed = true; }
    }
    if(!Array.isArray(data.transactions)){ data.transactions = []; changed = true; }
    if(typeof data.txCounter !== 'number'){ data.txCounter = 1; changed = true; }
    for(const t of data.transactions){
      // Migración: campos de coste para sacar ganancia/inversión
      if(t.unitCost === undefined){ t.unitCost = null; changed = true; }
      if(t.costTotal === undefined){ t.costTotal = null; changed = true; }
    }
    if(!Array.isArray(data.settings.deviceTypes) || !data.settings.deviceTypes.length){
      data.settings.deviceTypes = DEFAULT_DEVICES.slice(); changed = true;
    }
    if(!Array.isArray(data.settings.productTypes) || !data.settings.productTypes.length){
      data.settings.productTypes = DEFAULT_PRODUCTS.slice(); changed = true;
    }
    if(data.settings.defaultWarrantyDays == null){ data.settings.defaultWarrantyDays = 30; changed = true; }
    if(!data.settings.productMinStock || typeof data.settings.productMinStock!=='object'){
      data.settings.productMinStock = {}; changed = true;
    }
    if(!data.settings.creator){ data.settings.creator = { phone:'', whatsapp:'' }; changed = true; }
    if(data.settings.logo === undefined){ data.settings.logo = null; changed = true; }
    if(!data.settings.logoPreset){ data.settings.logoPreset = 'tools'; changed = true; }
    if(!Array.isArray(data.settings.securityQuestions)){ data.settings.securityQuestions = []; changed = true; }
    data.schemaVersion = SCHEMA_VERSION;
    if(changed) save(false);
  }
  function save(triggerSync=true){
    try{ localStorage.setItem(KEY, JSON.stringify(data)); }catch(e){
      console.warn('localStorage lleno', e);
    }
    if(triggerSync && window.GitSync && DB.settings.github.enabled && DB.settings.github.autoSync){
      window.GitSync.schedulePush();
    }
    if(window.LocalFile && window.LocalFile.hasHandle()){
      window.LocalFile.scheduleWrite();
    }
  }

  async function sha256(text){
    const buf = new TextEncoder().encode(text);
    const hash = await crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,'0')).join('');
  }
  // Normaliza: minúsculas + sin acentos + colapsa espacios. Para búsquedas robustas.
  function norm(s){
    if(s==null) return '';
    return String(s).toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .replace(/\s+/g,' ').trim();
  }
  async function normAns(s){ return DB._normAnsImpl ? DB._normAnsImpl(s) : sha256(norm(s)); }

  return {
    DEFAULT_DEVICES, DEFAULT_PRODUCTS,
    get all(){ return data; },
    get settings(){ return data.settings; },
    get repairs(){ return data.repairs; },
    get transactions(){ return data.transactions; },
    save, sha256, norm,
    async hashAnswer(ans){ return sha256(norm(ans)); },
    setSecurityQuestions(list){
      data.settings.securityQuestions = Array.isArray(list)?list:[];
      save();
    },
    replaceAll(newData){
      data = deepMerge(structuredClone(defaults), newData);
      migrate();
      save(false);
    },
    updateSettings(patch){
      Object.assign(data.settings, patch);
      save();
    },
    updateCreator(patch){
      data.settings.creator = { ...data.settings.creator, ...patch };
      save(false);
    },
    updateGithub(patch){
      data.settings.github = { ...data.settings.github, ...patch };
      save(false);
    },
    addDeviceType(name){
      name = (name||'').trim();
      if(!name) return false;
      if(data.settings.deviceTypes.some(d=>d.toLowerCase()===name.toLowerCase())) return false;
      data.settings.deviceTypes.push(name);
      data.settings.deviceTypes.sort((a,b)=>a.localeCompare(b,'es'));
      save();
      return true;
    },
    removeDeviceType(name){
      data.settings.deviceTypes = data.settings.deviceTypes.filter(d=>d!==name);
      save();
    },
    addProductType(name){
      name = (name||'').trim();
      if(!name) return false;
      if(data.settings.productTypes.some(d=>d.toLowerCase()===name.toLowerCase())) return false;
      data.settings.productTypes.push(name);
      data.settings.productTypes.sort((a,b)=>a.localeCompare(b,'es'));
      save();
      return true;
    },
    removeProductType(name){
      data.settings.productTypes = data.settings.productTypes.filter(d=>d!==name);
      save();
    },
    addRepair(r){
      r.id = 'R' + String(data.counter++).padStart(4,'0');
      r.createdAt = Date.now();
      r.updatedAt = Date.now();
      if(r.status === 'delivered' && !r.deliveredAt) r.deliveredAt = Date.now();
      data.repairs.unshift(r);
      save();
      return r;
    },
    updateRepair(id, patch){
      const r = data.repairs.find(x=>x.id===id);
      if(!r) return null;
      const prevStatus = r.status;
      Object.assign(r, patch, { updatedAt: Date.now() });
      if(r.status === 'delivered' && !r.deliveredAt) r.deliveredAt = Date.now();
      if(prevStatus === 'delivered' && r.status !== 'delivered') r.deliveredAt = null;
      save();
      return r;
    },
    deleteRepair(id){
      data.repairs = data.repairs.filter(r=>r.id!==id);
      try{ window.GitSync && window.GitSync.markDeleted && window.GitSync.markDeleted(id); }catch(e){}
      save();
    },
    findRepair(id){ return data.repairs.find(r=>r.id===id); },
    // === Transacciones (ventas y compras) ===
    addTransaction(t){
      t.id = 'T' + String(data.txCounter++).padStart(4,'0');
      t.createdAt = Date.now();
      t.updatedAt = Date.now();
      if(!t.date) t.date = t.createdAt;
      data.transactions.unshift(t);
      save();
      return t;
    },
    updateTransaction(id, patch){
      const t = data.transactions.find(x=>x.id===id);
      if(!t) return null;
      Object.assign(t, patch, { updatedAt: Date.now() });
      save();
      return t;
    },
    deleteTransaction(id){
      data.transactions = data.transactions.filter(t=>t.id!==id);
      save();
    },
    findTransaction(id){ return data.transactions.find(t=>t.id===id); },
    searchTransactions(q){
      const nq = norm(q);
      if(!nq) return data.transactions;
      return data.transactions.filter(t => {
        const hay = [
          t.id, t.product, t.counterparty, t.notes, t.type,
          t.type==='sale'?'venta ingreso':'compra gasto',
          t.quantity, t.unitPrice, t.unitCost, t.costTotal, t.total,
          t.date?new Date(t.date).toLocaleDateString('es-ES'):''
        ].map(x=>norm(x)).join(' ');
        return hay.includes(nq);
      });
    },
    search(q){
      const nq = norm(q);
      if(!nq) return data.repairs;
      const statusMap = {pending:'pendiente',in_progress:'en proceso proceso',completed:'completada',delivered:'entregada',cancelled:'cancelada'};
      return data.repairs.filter(r => {
        const phones = (r.clientPhones||[]).join(' ');
        const partsTxt = (r.parts||[]).map(p=>`${p.name||''} ${p.qty||''} ${p.unitCost||''}`).join(' ');
        const hay = [
          r.id, r.clientName, phones, r.clientPhone, r.clientAddress, r.clientIdNumber,
          r.device, r.brand, r.model, r.serial, r.issue, r.notes,
          statusMap[r.status]||r.status, partsTxt,
          r.price, r.deposit, r.warrantyDays,
          r.dueDate?new Date(r.dueDate).toLocaleDateString('es-ES'):'',
          r.createdAt?new Date(r.createdAt).toLocaleDateString('es-ES'):'',
          r.deliveredAt?new Date(r.deliveredAt).toLocaleDateString('es-ES'):''
        ].map(x=>norm(x)).join(' ');
        return hay.includes(nq);
      });
    },
    byStatus(s){ return data.repairs.filter(r=>r.status===s); },
    todayPending(){
      const t = new Date(); t.setHours(0,0,0,0);
      const end = t.getTime() + 86400000;
      return data.repairs.filter(r =>
        (r.status==='pending'||r.status==='in_progress') &&
        r.dueDate && new Date(r.dueDate).getTime() < end
      );
    },
    // === Stock ===
    setProductMinStock(name, qty){
      const n = String(name||'').trim(); if(!n) return;
      data.settings.productMinStock = data.settings.productMinStock || {};
      const v = parseInt(qty,10);
      if(isNaN(v) || v<=0) delete data.settings.productMinStock[n];
      else data.settings.productMinStock[n] = v;
      save();
    },
    // Devuelve mapa { nombre: { purchased, sold, usedInRepairs, stock, min, invested, earned } }
    productStats(){
      const map = {};
      function key(n){ return String(n||'').trim(); }
      function ensure(n){
        if(!map[n]) map[n] = { name:n, purchased:0, sold:0, usedInRepairs:0, invested:0, earned:0, stock:0, min:0 };
        return map[n];
      }
      for(const t of data.transactions){
        const n = key(t.product); if(!n) continue;
        const q = Number(t.quantity||0);
        const total = Number(t.total||0);
        if(t.type==='purchase'){
          const m = ensure(n);
          m.purchased += q;
          m.invested += total;
        } else if(t.type==='sale'){
          const m = ensure(n);
          m.sold += q;
          const cost = t.costTotal!=null ? Number(t.costTotal) : 0;
          m.earned += (total - cost);
          m.invested += cost; // inversión asociada a esa venta
        }
      }
      for(const r of data.repairs){
        for(const p of (r.parts||[])){
          const n = key(p.name); if(!n) continue;
          const q = Number(p.qty||0);
          const c = Number(p.unitCost||0);
          const m = ensure(n);
          m.usedInRepairs += q;
          m.invested += c*q;
        }
      }
      const mins = data.settings.productMinStock||{};
      for(const n in map){
        map[n].stock = map[n].purchased - map[n].sold - map[n].usedInRepairs;
        map[n].min = mins[n]||0;
      }
      // incluir productos con min configurado aunque no tengan movimientos
      for(const n in mins){ ensure(n).min = mins[n]; }
      return map;
    },
    exportBlob(){
      return new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
    },
    exportJson(){
      const url = URL.createObjectURL(this.exportBlob());
      const a = document.createElement('a');
      a.href = url;
      a.download = `taller-backup-${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    },
    importJson(json){
      try{
        const p = typeof json==='string' ? JSON.parse(json) : json;
        if(!p.repairs) throw new Error('Formato inválido');
        this.replaceAll(p);
        return true;
      }catch(e){ console.warn(e); return false; }
    }
  };
})();
