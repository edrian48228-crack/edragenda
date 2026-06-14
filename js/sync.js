// =============================================================
// Sincronización GitHub — v18
// - Logger en vivo: cada operación (conexión, listar, subir, bajar,
//   actualizar, eliminar) queda registrada con timestamp y nivel.
// - Almacenamiento POR REPARACIÓN: cada reparación se guarda en su
//   propio archivo `<base>/repairs/<id>.json` con sus fotos, audio y
//   datos. Así nada se mezcla con otras reparaciones.
// - Un archivo `<base>/index.json` guarda ajustes, transacciones,
//   contadores y la lista de IDs.
// - Mantiene compatibilidad: si encuentra un archivo único legado
//   (con `repairs:[...]`) lo importa y a partir de ahí trabaja con el
//   formato nuevo.
// =============================================================

const GitLog = (() => {
  const MAX = 300;
  const entries = [];
  const subs = new Set();
  function emit(){ subs.forEach(fn => { try{ fn(entries); }catch(e){} }); }
  function add(level, tag, msg){
    const e = { t: Date.now(), level, tag, msg: String(msg||'') };
    entries.push(e);
    if(entries.length > MAX) entries.splice(0, entries.length - MAX);
    // eslint-disable-next-line no-console
    try{ console[level==='err'?'error':level==='warn'?'warn':'log'](`[gh:${tag}]`, e.msg); }catch(_){}
    emit();
    return e;
  }
  return {
    info: (tag,msg)=>add('info',tag,msg),
    ok:   (tag,msg)=>add('ok',tag,msg),
    warn: (tag,msg)=>add('warn',tag,msg),
    err:  (tag,msg)=>add('err',tag,msg),
    net:  (tag,msg)=>add('net',tag,msg),
    all:  ()=> entries.slice(),
    clear(){ entries.length = 0; emit(); },
    subscribe(fn){ subs.add(fn); fn(entries); return ()=>subs.delete(fn); }
  };
})();
window.GitLog = GitLog;

const GitSync = (() => {
  let pushTimer = null;
  let busy = false;
  let lastHashes = {}; // id -> hash de su JSON (para detectar cambios)
  let knownDeleted = new Set();

  // ---------- Configuración ----------
  function g(){ return DB.settings.github; }
  function cfgOk(){
    const c = g();
    return !!(c.enabled && c.token && c.user && c.repo);
  }
  function basePath(){
    // Acepta tanto rutas tipo "carpeta" como rutas con .json (legado).
    const raw = (g().path || 'taller-data').trim().replace(/^\/+|\/+$/g,'');
    if(/\.json$/i.test(raw)){
      // Legado: usamos la carpeta padre + nombre sin extensión como base
      const noExt = raw.replace(/\.json$/i,'');
      return noExt || 'taller-data';
    }
    return raw || 'taller-data';
  }
  function indexFile(){ return basePath() + '/index.json'; }
  function repairFile(id){ return basePath() + '/repairs/' + id + '.json'; }
  function repairsDir(){ return basePath() + '/repairs'; }

  // ---------- Util base64 unicode-safe ----------
  function b64encode(str){
    const bytes = new TextEncoder().encode(str);
    let bin = '';
    for(const b of bytes) bin += String.fromCharCode(b);
    return btoa(bin);
  }
  function b64decode(b64){
    const bin = atob((b64||'').replace(/\n/g,''));
    const bytes = new Uint8Array(bin.length);
    for(let i=0;i<bin.length;i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }

  async function sha256(str){
    const buf = new TextEncoder().encode(str);
    const h = await crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(h)).map(b=>b.toString(16).padStart(2,'0')).join('');
  }

  // ---------- HTTP base ----------
  async function api(path, init={}){
    const c = g();
    const url = `https://api.github.com${path}`;
    const method = (init.method || 'GET').toUpperCase();
    GitLog.net(method, path);
    let resp;
    try{
      resp = await fetch(url, {
        ...init,
        headers: {
          'Accept':'application/vnd.github+json',
          'Authorization': `token ${c.token}`,
          'Content-Type':'application/json',
          'X-GitHub-Api-Version':'2022-11-28',
          ...(init.headers||{})
        }
      });
    }catch(netErr){
      GitLog.err('red', 'Sin conexión: '+netErr.message);
      throw netErr;
    }
    if(!resp.ok && resp.status !== 404){
      let txt = ''; try{ txt = (await resp.text()).slice(0,200); }catch(_){}
      GitLog.err(String(resp.status), `${method} ${path} → ${resp.status} ${txt}`);
    }
    return resp;
  }

  // ---------- Operaciones primitivas ----------
  async function getFile(path){
    const c = g();
    const r = await api(`/repos/${c.user}/${c.repo}/contents/${encodeURI(path)}?ref=${encodeURIComponent(c.branch||'main')}`);
    if(r.status === 404) return { sha:null, content:null };
    if(!r.ok) throw new Error('GET '+path+' '+r.status);
    const j = await r.json();
    return { sha:j.sha, content: b64decode(j.content||'') };
  }
  async function putFile(path, content, sha, msg){
    const c = g();
    const body = {
      message: msg || `taller: ${path}`,
      content: b64encode(content),
      branch: c.branch || 'main'
    };
    if(sha) body.sha = sha;
    const r = await api(`/repos/${c.user}/${c.repo}/contents/${encodeURI(path)}`, {
      method:'PUT', body: JSON.stringify(body)
    });
    if(!r.ok){
      const t = await r.text();
      throw new Error('PUT '+path+' '+r.status+' '+t.slice(0,160));
    }
    const j = await r.json();
    return j.content.sha;
  }
  async function deleteFile(path, sha){
    const c = g();
    const body = {
      message: `taller: borrar ${path}`,
      sha, branch: c.branch || 'main'
    };
    const r = await api(`/repos/${c.user}/${c.repo}/contents/${encodeURI(path)}`, {
      method:'DELETE', body: JSON.stringify(body)
    });
    if(!r.ok && r.status !== 404){
      const t = await r.text();
      throw new Error('DELETE '+path+' '+r.status+' '+t.slice(0,160));
    }
  }
  async function listDir(path){
    const c = g();
    const r = await api(`/repos/${c.user}/${c.repo}/contents/${encodeURI(path)}?ref=${encodeURIComponent(c.branch||'main')}`);
    if(r.status === 404) return [];
    if(!r.ok) throw new Error('LIST '+path+' '+r.status);
    const j = await r.json();
    return Array.isArray(j) ? j : [];
  }
  async function getRepo(){
    const c = g();
    const r = await api(`/repos/${c.user}/${c.repo}`);
    if(!r.ok) throw new Error('Repo '+r.status);
    return r.json();
  }
  async function getUser(){
    const r = await api(`/user`);
    if(!r.ok) throw new Error('Usuario '+r.status);
    return r.json();
  }

  // ---------- Hashes y deltas ----------
  function repairHashKey(id){ return 'taller_gh_hash_'+id; }
  function loadHashCache(){
    try{ lastHashes = JSON.parse(localStorage.getItem('taller_gh_hashes')||'{}'); }
    catch(_){ lastHashes = {}; }
  }
  function saveHashCache(){
    try{ localStorage.setItem('taller_gh_hashes', JSON.stringify(lastHashes)); }catch(_){}
  }
  function loadDeleted(){
    try{ knownDeleted = new Set(JSON.parse(localStorage.getItem('taller_gh_deleted')||'[]')); }
    catch(_){ knownDeleted = new Set(); }
  }
  function saveDeleted(){
    try{ localStorage.setItem('taller_gh_deleted', JSON.stringify([...knownDeleted])); }catch(_){}
  }
  function markDeleted(id){
    knownDeleted.add(id);
    saveDeleted();
    GitLog.info('marca', `Reparación ${id} pendiente de eliminar en GitHub`);
    schedulePush();
  }

  loadHashCache();
  loadDeleted();

  // ---------- Payloads ----------
  function buildRepairPayload(r){
    return JSON.stringify({
      kind:'repair', schema: 1, savedAt: Date.now(),
      repair: r
    }, null, 2);
  }
  function buildIndexPayload(){
    const d = DB.all;
    const ids = (d.repairs||[]).map(r=>r.id);
    return JSON.stringify({
      kind:'index', schema: 1, savedAt: Date.now(),
      schemaVersion: d.schemaVersion,
      counter: d.counter, txCounter: d.txCounter,
      settings: {
        // Excluimos token por seguridad: nunca subimos el token al repo.
        ...d.settings,
        github: { ...d.settings.github, token: '' }
      },
      transactions: d.transactions || [],
      repairIds: ids
    }, null, 2);
  }

  // ---------- Operaciones de alto nivel ----------
  async function testConnection(){
    if(!cfgOk()) throw new Error('Completa usuario, repositorio y token');
    GitLog.info('test', 'Probando conexión…');
    const u = await getUser();
    GitLog.ok('user', `Autenticado como ${u.login}`);
    const r = await getRepo();
    GitLog.ok('repo', `Repo accesible: ${r.full_name} · rama por defecto: ${r.default_branch}`);
    GitLog.info('ruta', `Base de datos: ${basePath()}/  (index.json + repairs/Rxxxx.json)`);
    return true;
  }

  async function pushAll(opts={}){
    if(!cfgOk()) throw new Error('Configuración incompleta');
    if(busy) { GitLog.warn('cola','Operación en curso, omitida'); return; }
    busy = true;
    const onProgress = opts.onProgress || (()=>{});
    try{
      const repairs = DB.repairs.slice();
      let pending = [];
      for(const r of repairs){
        const txt = buildRepairPayload(r);
        const h = await sha256(txt);
        if(lastHashes['r:'+r.id] !== h) pending.push({ r, txt, h });
      }
      const deletes = [...knownDeleted];
      const total = pending.length + deletes.length + 1; // +1 index
      let done = 0;
      const tick = (msg)=>{ done++; onProgress(done,total,msg); };

      GitLog.info('plan', `${pending.length} reparación(es) modificadas · ${deletes.length} a eliminar`);

      // 1) Subir cada reparación cambiada
      for(const it of pending){
        const path = repairFile(it.r.id);
        const remote = await getFile(path);
        const newSha = await putFile(path, it.txt, remote.sha,
          remote.sha ? `taller: actualizar ${it.r.id}` : `taller: crear ${it.r.id}`);
        lastHashes['r:'+it.r.id] = it.h;
        lastHashes['sha:'+it.r.id] = newSha;
        saveHashCache();
        GitLog.ok(remote.sha?'update':'create', `${it.r.id} → ${path}`);
        tick(it.r.id);
      }

      // 2) Borrar los marcados como eliminados
      for(const id of deletes){
        try{
          const path = repairFile(id);
          const remote = await getFile(path);
          if(remote.sha){
            await deleteFile(path, remote.sha);
            GitLog.ok('delete', `${id} eliminado en GitHub`);
          }else{
            GitLog.info('skip', `${id} ya no existía en GitHub`);
          }
          delete lastHashes['r:'+id];
          delete lastHashes['sha:'+id];
          saveHashCache();
          knownDeleted.delete(id);
          saveDeleted();
        }catch(e){
          GitLog.err('delete', `${id}: ${e.message}`);
        }
        tick(id);
      }

      // 3) Subir el índice
      const idxTxt = buildIndexPayload();
      const idxPath = indexFile();
      const idxRemote = await getFile(idxPath);
      const idxSha = await putFile(idxPath, idxTxt, idxRemote.sha, 'taller: actualizar index.json');
      DB.updateGithub({ lastSha: idxSha, lastSyncAt: Date.now() });
      GitLog.ok('index', 'index.json subido');
      tick('index');

      GitLog.ok('done', `Sincronización completa: ${pending.length} subida(s), ${deletes.length} eliminada(s)`);
      return { pushed: pending.length, deleted: deletes.length };
    } finally {
      busy = false;
    }
  }

  async function pullAll(opts={}){
    if(!cfgOk()) throw new Error('Configuración incompleta');
    if(busy) { GitLog.warn('cola','Operación en curso, omitida'); return; }
    busy = true;
    const onProgress = opts.onProgress || (()=>{});
    try{
      GitLog.info('pull', 'Descargando datos desde GitHub…');

      // 1) Intentar índice
      let idxData = null;
      const idxRemote = await getFile(indexFile());
      if(idxRemote.content){
        try{ idxData = JSON.parse(idxRemote.content); }
        catch(e){ GitLog.warn('index','index.json corrupto, se reconstruirá'); }
      } else {
        GitLog.info('index', 'No hay index.json todavía');
      }

      // 1b) Compatibilidad: si la ruta antigua era un archivo .json único
      if(!idxData){
        const legacyPath = (g().path||'').trim();
        if(legacyPath && /\.json$/i.test(legacyPath)){
          const legacy = await getFile(legacyPath);
          if(legacy.content){
            try{
              const parsed = JSON.parse(legacy.content);
              if(parsed && Array.isArray(parsed.repairs)){
                GitLog.warn('legado','Archivo único detectado, migrando a formato por reparación');
                // Importar todo y luego forzar pushAll
                DB.replaceAll(parsed);
                lastHashes = {}; saveHashCache();
                knownDeleted.clear(); saveDeleted();
                DB.updateGithub({ lastSyncAt: Date.now() });
                GitLog.ok('migrar','Datos legados cargados. Pulsa "Subir todo" para reorganizar.');
                return { pulled: parsed.repairs.length, migrated:true };
              }
            }catch(e){ GitLog.err('legado', e.message); }
          }
        }
      }

      // 2) Listar repairs/
      const files = await listDir(repairsDir());
      const jsonFiles = files.filter(f => f.type==='file' && /\.json$/i.test(f.name));
      GitLog.info('lista', `${jsonFiles.length} reparación(es) en el repositorio`);

      const total = jsonFiles.length + 1;
      let done = 0;
      const tick = (msg)=>{ done++; onProgress(done,total,msg); };

      const remoteRepairs = [];
      for(const f of jsonFiles){
        const remote = await getFile(basePath()+'/repairs/'+f.name);
        if(!remote.content){ tick(f.name); continue; }
        try{
          const parsed = JSON.parse(remote.content);
          if(parsed && parsed.repair){
            remoteRepairs.push({ raw: parsed.repair, sha: f.sha, body: remote.content });
            GitLog.ok('get', `${parsed.repair.id}  (${(remote.content.length/1024).toFixed(1)} KB)`);
          }
        }catch(e){ GitLog.err('parse', f.name+': '+e.message); }
        tick(f.name);
      }

      // 3) Componer dataset final
      const base = idxData ? {
        schemaVersion: idxData.schemaVersion,
        settings: idxData.settings || {},
        transactions: idxData.transactions || [],
        counter: idxData.counter || 1,
        txCounter: idxData.txCounter || 1,
        repairs: remoteRepairs.map(x=>x.raw)
      } : {
        repairs: remoteRepairs.map(x=>x.raw)
      };
      // Preservar token local (nunca viene del repo)
      const localToken = DB.settings.github.token;
      DB.replaceAll(base);
      DB.updateGithub({ token: localToken, lastSyncAt: Date.now(), lastSha: idxRemote.sha });

      // Recalcular hashes
      lastHashes = {};
      for(const it of remoteRepairs){
        const txt = buildRepairPayload(it.raw);
        lastHashes['r:'+it.raw.id] = await sha256(txt);
        lastHashes['sha:'+it.raw.id] = it.sha;
      }
      saveHashCache();
      knownDeleted.clear(); saveDeleted();
      tick('index');

      GitLog.ok('done', `Descargadas ${remoteRepairs.length} reparación(es)`);
      return { pulled: remoteRepairs.length };
    } finally {
      busy = false;
    }
  }

  // ---------- Auto-sync ----------
  function schedulePush(){
    if(!cfgOk() || !g().autoSync) return;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(()=>{
      pushAll().catch(e => GitLog.err('auto', e.message));
    }, 1800);
  }

  return {
    cfgOk, basePath, isBusy: ()=>busy,
    test: testConnection,
    push: pushAll, pull: pullAll, schedulePush,
    markDeleted,
    // Compatibilidad con código viejo:
    pushLegacy: pushAll
  };
})();
window.GitSync = GitSync;

// =============================================================
// File System Access — guardar JSON en una ubicación local
// =============================================================
const LocalFile = (() => {
  const DB_NAME = 'taller_handles';
  const STORE = 'kv';
  let cachedHandle = null;
  let writeTimer = null;

  function idb(){
    return new Promise((res, rej)=>{
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = ()=> req.result.createObjectStore(STORE);
      req.onsuccess = ()=> res(req.result);
      req.onerror = ()=> rej(req.error);
    });
  }
  async function setHandle(h){
    cachedHandle = h;
    const db = await idb();
    await new Promise((r,j)=>{
      const tx = db.transaction(STORE,'readwrite');
      tx.objectStore(STORE).put(h, 'fileHandle');
      tx.oncomplete = r; tx.onerror = ()=>j(tx.error);
    });
  }
  async function loadHandle(){
    if(cachedHandle) return cachedHandle;
    try{
      const db = await idb();
      cachedHandle = await new Promise((r,j)=>{
        const tx = db.transaction(STORE,'readonly');
        const req = tx.objectStore(STORE).get('fileHandle');
        req.onsuccess = ()=> r(req.result||null);
        req.onerror = ()=> j(req.error);
      });
    }catch(e){ cachedHandle = null; }
    return cachedHandle;
  }
  async function clearHandle(){
    cachedHandle = null;
    try{
      const db = await idb();
      await new Promise((r,j)=>{
        const tx = db.transaction(STORE,'readwrite');
        tx.objectStore(STORE).delete('fileHandle');
        tx.oncomplete = r; tx.onerror = ()=>j(tx.error);
      });
    }catch(e){}
  }
  function isSupported(){ return 'showSaveFilePicker' in window; }
  function hasHandle(){ return !!cachedHandle; }
  async function pickLocation(){
    if(!isSupported()) throw new Error('Tu navegador no soporta elegir ubicación. Usa exportar manual.');
    const h = await window.showSaveFilePicker({
      suggestedName: 'taller-data.json',
      types: [{ description:'JSON', accept:{ 'application/json':['.json'] } }]
    });
    await setHandle(h);
    await write();
    return h;
  }
  async function ensurePermission(h){
    const opts = { mode:'readwrite' };
    if((await h.queryPermission(opts)) === 'granted') return true;
    return (await h.requestPermission(opts)) === 'granted';
  }
  async function write(){
    if(!cachedHandle) return false;
    try{
      if(!(await ensurePermission(cachedHandle))) return false;
      const w = await cachedHandle.createWritable();
      await w.write(new Blob([JSON.stringify(DB.all,null,2)],{type:'application/json'}));
      await w.close();
      return true;
    }catch(e){ console.warn('LocalFile write', e); return false; }
  }
  function scheduleWrite(){
    clearTimeout(writeTimer);
    writeTimer = setTimeout(()=>{ write(); }, 800);
  }
  async function loadFromFile(){
    if(!cachedHandle) return false;
    if(!(await ensurePermission(cachedHandle))) return false;
    const f = await cachedHandle.getFile();
    const text = await f.text();
    return DB.importJson(text);
  }
  loadHandle();
  return { isSupported, hasHandle, pickLocation, clearHandle, write, scheduleWrite, loadFromFile, loadHandle };
})();
window.LocalFile = LocalFile;
