const Views = (() => {
  const { escape, fmtDate, fmtDateTime, fmtDateInput, statusLabel } = UI;
  const view = () => document.getElementById('view');

  const ICONS = {
    device: '<svg viewBox="0 0 24 24" class="ico"><path d="M17 1H7a2 2 0 0 0-2 2v18a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2zm-5 21a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5-4H7V4h10v14z"/></svg>',
    person: '<svg viewBox="0 0 24 24" class="ico"><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-4.4 0-8 2.7-8 6v2h16v-2c0-3.3-3.6-6-8-6z"/></svg>',
    clock: '<svg viewBox="0 0 24 24" class="ico"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 11h5v-2h-4V6h-2v7z"/></svg>',
    check: '<svg viewBox="0 0 24 24" class="ico"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>',
    box: '<svg viewBox="0 0 24 24" class="ico"><path d="M21 8l-9-5-9 5v8l9 5 9-5V8zm-9 12l-7-4V9.5l7 3.9 7-3.9V16l-7 4z"/></svg>',
    search: '<svg viewBox="0 0 24 24" class="ico"><path d="M21 20l-5.6-5.6a8 8 0 1 0-1.4 1.4L19.6 21.4 21 20zM4 10a6 6 0 1 1 12 0 6 6 0 0 1-12 0z"/></svg>',
    camera: '<svg viewBox="0 0 24 24" class="ico"><path d="M9 3l-2 2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3l-2-2H9zm3 14a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"/></svg>',
    edit: '<svg viewBox="0 0 24 24" class="ico"><path d="M3 17.2V21h3.8L17.8 9.9l-3.8-3.8L3 17.2zM20.7 7.3a1 1 0 0 0 0-1.4l-2.6-2.6a1 1 0 0 0-1.4 0L15 4.9l3.8 3.8 1.9-1.4z"/></svg>',
    trash: '<svg viewBox="0 0 24 24" class="ico"><path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>',
    mic: '<svg viewBox="0 0 24 24" class="ico"><path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2z"/></svg>',
    stop: '<svg viewBox="0 0 24 24" class="ico"><path d="M6 6h12v12H6z"/></svg>',
    plus: '<svg viewBox="0 0 24 24" class="ico"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>',
    cloud: '<svg viewBox="0 0 24 24" class="ico"><path d="M19 18H6a4 4 0 0 1-.5-7.97A6 6 0 0 1 17 9a4 4 0 0 1 2 9z"/></svg>',
    save: '<svg viewBox="0 0 24 24" class="ico"><path d="M17 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7l-4-4zm-5 16a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm3-10H5V5h10v4z"/></svg>',
    phone: '<svg viewBox="0 0 24 24" class="ico"><path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.58 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.4 11.4 0 0 0 .58 3.6 1 1 0 0 1-.25 1l-2.23 2.2z"/></svg>',
    wa: '<svg viewBox="0 0 32 32" class="ico"><path d="M16 3C9 3 3.5 8.5 3.5 15.5c0 2.4.7 4.7 1.9 6.7L3 29l7-1.8a12.5 12.5 0 0 0 6 1.5c7 0 12.5-5.5 12.5-12.5S23 3 16 3zm6.9 17.5c-.3.8-1.7 1.6-2.4 1.6-.6.1-1.4.1-2.3-.1-.5-.2-1.2-.4-2.1-.8-3.7-1.6-6.2-5.3-6.4-5.6-.2-.2-1.5-2-1.5-3.9 0-1.8.9-2.7 1.3-3.1.3-.3.7-.4 1-.4h.7c.2 0 .5 0 .8.6.3.7 1 2.5 1.1 2.6.1.2.2.4 0 .6-.1.2-.2.4-.4.6-.2.2-.4.5-.5.6-.2.2-.4.4-.2.7.2.3 1 1.6 2.1 2.6 1.5 1.3 2.7 1.7 3 1.9.3.1.5.1.7-.1.2-.2.8-.9 1-1.2.2-.3.4-.3.7-.2.3.1 2 1 2.4 1.2.4.2.6.3.7.4 0 .1 0 .8-.3 1.6z"/></svg>',
    sms: '<svg viewBox="0 0 24 24" class="ico"><path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM7 11h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z"/></svg>',
    upload: '<svg viewBox="0 0 24 24" class="ico"><path d="M9 16V10H5l7-7 7 7h-4v6H9zm-4 4v-2h14v2H5z"/></svg>',
    close: '<svg viewBox="0 0 24 24" class="ico"><path d="M19 6.4L17.6 5 12 10.6 6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12z"/></svg>',
    cancel: '<svg viewBox="0 0 24 24" class="ico"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm5 14.6L16.6 18 12 13.4 7.4 18 6 16.6 10.6 12 6 7.4 7.4 6 12 10.6 16.6 6 18 7.4 13.4 12 18 16.6z"/></svg>',
    print: '<svg viewBox="0 0 24 24" class="ico"><path d="M19 8H5a3 3 0 0 0-3 3v6h4v4h12v-4h4v-6a3 3 0 0 0-3-3zm-3 11H8v-5h8v5zm3-7a1 1 0 1 1 0-2 1 1 0 0 1 0 2zM18 3H6v4h12V3z"/></svg>'
  };

  const STATUS_KEYS = ['pending','in_progress','completed','delivered'];
  const FILTERS = [
    {k:'all',label:'Todas'},
    {k:'pending',label:'Pendientes'},
    {k:'in_progress',label:'En proceso'},
    {k:'completed',label:'Completadas'},
    {k:'delivered',label:'Entregadas'},
    {k:'cancelled',label:'Canceladas'}
  ];

  function emptyState(t,s){
    return `<div class="empty">${ICONS.box.replace('class="ico"','class="ico lg"')}<h3>${escape(t)}</h3><p>${escape(s)}</p></div>`;
  }

  // Cabecera con líneas (reutilizable para listas y formulario)
  function sectionDivider(label, count){
    const c = count!=null ? `<span class="dg-count">${count}</span>` : '';
    return `<div class="group-divider">
      <span class="dg-line"></span>
      <span class="dg-label">${escape(label)}</span>
      ${c}
      <span class="dg-line right"></span>
    </div>`;
  }

  function repairCard(r){
    // Foto del cliente como thumb (no la del equipo)
    const cover = r.clientPhoto;
    const thumb = cover ? `<img src="${cover}" alt="">` : ICONS.person;
    const phones = (r.clientPhones && r.clientPhones.length)
      ? r.clientPhones.filter(Boolean)
      : (r.clientPhone ? [r.clientPhone] : []);
    let phoneHtml = '';
    if(phones.length){
      if(phones.length === 1){
        const tel = UI.phoneClean(phones[0]);
        const sms = UI.phoneSms(phones[0]);
        phoneHtml = `<div class="card-phones">
          <a class="mini-action call" href="tel:${escape(tel)}" data-stop="1">${ICONS.phone}<span>${escape(phones[0])}</span></a>
          <a class="mini-action sms" href="sms:${escape(sms)}" data-stop="1">${ICONS.sms}<span>SMS</span></a>
        </div>`;
      } else {
        phoneHtml = `<div class="card-phones">
          <button class="mini-action call" data-pick-phone="${escape(r.id)}" data-stop="1">${ICONS.phone}<span>${phones.length} teléfonos</span></button>
        </div>`;
      }
    }
    const delBtn = `<button class="mini-action delete" data-del-id="${escape(r.id)}" data-stop="1" title="Eliminar reparación" aria-label="Eliminar">${ICONS.trash}</button>`;
    const inner = phoneHtml ? phoneHtml.replace(/^<div class="card-phones">/,'').replace(/<\/div>\s*$/,'') : '';
    const actionsRow = `<div class="card-phones bottom-row">${inner}${delBtn}</div>`;
    return `
      <div class="repair-card" data-id="${r.id}">
        <div class="thumb">${thumb}</div>
        <div class="repair-info">
          <h3>${escape(r.clientName||'Cliente')}</h3>
          <p>${escape(r.device||'Equipo')}${r.brand?' · '+escape(r.brand):''} · ${escape(r.id)}</p>
          <span class="status ${r.status}">${statusLabel(r.status)}</span>
          ${actionsRow}
        </div>
      </div>`;
  }
  function bindRepairCards(){
    view().querySelectorAll('.repair-card').forEach(c=>{
      c.addEventListener('click', e=>{
        // No abrir detalle si se pulsó un botón de teléfono o eliminar
        if(e.target.closest('[data-stop]')) return;
        showRepair(c.dataset.id);
      });
    });
    view().querySelectorAll('[data-pick-phone]').forEach(b=>{
      b.addEventListener('click', e=>{
        e.preventDefault(); e.stopPropagation();
        openPhonePicker(b.dataset.pickPhone);
      });
    });
    view().querySelectorAll('[data-del-id]').forEach(b=>{
      b.addEventListener('click', async e=>{
        e.preventDefault(); e.stopPropagation();
        const id = b.dataset.delId;
        const r = DB.findRepair(id);
        const ok = await UI.confirmDialog({
          title:'Eliminar reparación',
          message:`¿Eliminar definitivamente la reparación ${id}${r&&r.clientName?' de '+r.clientName:''}? Esta acción no se puede deshacer.`,
          okText:'Eliminar', cancelText:'Cancelar', danger:true
        });
        if(!ok) return;
        DB.deleteRepair(id);
        UI.toast('Reparación eliminada');
        App.refresh();
      });
    });
  }

  function openPhonePicker(id){
    const r = DB.findRepair(id); if(!r) return;
    const phones = (r.clientPhones||[]).filter(Boolean);
    const rows = phones.map(p=>{
      const tel = UI.phoneClean(p); const sms = UI.phoneSms(p);
      return `<div class="pp-row">
        <span class="pp-num">${escape(p)}</span>
        <div class="pp-actions">
          <a class="call" href="tel:${escape(tel)}" title="Llamar">${ICONS.phone}</a>
          <a class="sms" href="sms:${escape(sms)}" title="SMS">${ICONS.sms}</a>
        </div>
      </div>`;
    }).join('');
    UI.openModal(`<h2 style="margin:0 0 4px;font-size:18px">${escape(r.clientName||'Cliente')}</h2>
      <p class="muted small" style="margin:0 0 8px">Elige un número para llamar o enviar SMS.</p>
      <div class="phone-picker">${rows}</div>`);
  }

  function groupByDate(list){
    const now = new Date();
    const today0 = new Date(now); today0.setHours(0,0,0,0);
    const yest0 = new Date(today0); yest0.setDate(yest0.getDate()-1);
    const wd = (today0.getDay()+6)%7;
    const week0 = new Date(today0); week0.setDate(week0.getDate()-wd);
    const month0 = new Date(today0.getFullYear(), today0.getMonth(), 1);
    const lastMonth0 = new Date(today0.getFullYear(), today0.getMonth()-1, 1);
    const year0 = new Date(today0.getFullYear(), 0, 1);

    const groups = [
      {key:'today', label:'Hoy', items:[]},
      {key:'yest', label:'Ayer', items:[]},
      {key:'week', label:'Esta semana', items:[]},
      {key:'month', label:'Este mes', items:[]},
      {key:'lmonth', label:'Mes pasado', items:[]},
      {key:'year', label:'Este año', items:[]},
      {key:'old', label:'Años anteriores', items:[]}
    ];
    for(const r of list){
      const t = r.createdAt || 0;
      if(t >= today0.getTime()) groups[0].items.push(r);
      else if(t >= yest0.getTime()) groups[1].items.push(r);
      else if(t >= week0.getTime()) groups[2].items.push(r);
      else if(t >= month0.getTime()) groups[3].items.push(r);
      else if(t >= lastMonth0.getTime()) groups[4].items.push(r);
      else if(t >= year0.getTime()) groups[5].items.push(r);
      else groups[6].items.push(r);
    }
    return groups.filter(g=>g.items.length);
  }

  // ============= DASHBOARD =============
  // Opciones de ordenación reutilizables (dashboard, lista y búsqueda)
  const SORT_OPTIONS = [
    {k:'recent',     label:'Más recientes',     fn:(a,b)=>(b.createdAt||0)-(a.createdAt||0)},
    {k:'oldest',     label:'Más antiguas',      fn:(a,b)=>(a.createdAt||0)-(b.createdAt||0)},
    {k:'dueSoon',    label:'Entrega próxima',   fn:(a,b)=>(a.dueDate||Infinity)-(b.dueDate||Infinity)},
    {k:'id',         label:'Identificación (ID)', fn:(a,b)=>String(a.id).localeCompare(String(b.id),'es')},
    {k:'client',     label:'Cliente (A‑Z)',     fn:(a,b)=>String(a.clientName||'').localeCompare(String(b.clientName||''),'es')},
    {k:'device',     label:'Equipo (A‑Z)',      fn:(a,b)=>String(a.device||'').localeCompare(String(b.device||''),'es')},
    {k:'identity',   label:'Nº de identidad',   fn:(a,b)=>String(a.clientIdNumber||'').localeCompare(String(b.clientIdNumber||''),'es')}
  ];
  function applySort(list, sortKey){
    const opt = SORT_OPTIONS.find(o=>o.k===sortKey) || SORT_OPTIONS[0];
    return list.slice().sort(opt.fn);
  }
  function sortSelectHtml(id, current){
    const opts = SORT_OPTIONS.map(o=>`<option value="${o.k}" ${o.k===current?'selected':''}>Ordenar: ${escape(o.label)}</option>`).join('');
    return `<div class="select-elegant"><select id="${id}" aria-label="Ordenar">${opts}</select></div>`;
  }

  function dashboard(){
    const repairs = DB.repairs;
    const pending = DB.byStatus('pending').length;
    const inProgress = DB.byStatus('in_progress').length;
    const completed = DB.byStatus('completed').length;
    const delivered = DB.byStatus('delivered').length;
    const cancelled = DB.byStatus('cancelled').length;
    const todayPending = DB.todayPending().length;
    const sortKey = Views._dashSort || 'recent';
    const recent = applySort(repairs, sortKey).slice(0,5);

    view().innerHTML = `
      <div class="greeting">Bienvenido a <span>${escape(DB.settings.appName)}</span></div>
      ${todayPending>0 ? `
        <div class="admin-card" style="border-left:3px solid #ff7b6b;background:linear-gradient(90deg,rgba(255,123,107,.1),var(--surface))">
          <div class="row-between"><div>
            <h3>Reparaciones para hoy</h3>
            <p>Tienes <b>${todayPending}</b> reparación(es) con entrega para hoy o vencidas</p>
          </div>${ICONS.clock}</div>
        </div>` : ''}
      <div class="stats-grid three">
        <div class="stat-card pending" data-go="repairs:pending" title="Sin empezar">${ICONS.clock}<div class="stat-num">${pending}</div><div class="stat-lbl">Pendientes</div></div>
        <div class="stat-card inprogress" data-go="repairs:in_progress" title="En proceso de reparación">${ICONS.edit}<div class="stat-num">${inProgress}</div><div class="stat-lbl">En proceso</div></div>
        <div class="stat-card success" data-go="repairs:completed" title="Listas para entregar">${ICONS.check}<div class="stat-num">${completed}</div><div class="stat-lbl">Completadas</div></div>
        <div class="stat-card delivered" data-go="repairs:delivered" title="Entregadas al cliente">${ICONS.box}<div class="stat-num">${delivered}</div><div class="stat-lbl">Entregadas</div></div>
        <div class="stat-card cancelled" data-go="repairs:cancelled" title="Reparaciones canceladas">${ICONS.cancel}<div class="stat-num">${cancelled}</div><div class="stat-lbl">Canceladas</div></div>
      </div>
      ${sectionDivider('Recientes', recent.length||0)}
      ${sortSelectHtml('dashSort', sortKey)}
      ${recent.length ? recent.map(repairCard).join('') : emptyState('Aún no hay reparaciones','Pulsa el botón + para registrar la primera')}
    `;
    view().querySelectorAll('[data-go]').forEach(el=>{
      el.addEventListener('click', ()=>{
        const [v, f] = el.dataset.go.split(':'); App.go(v, f);
      });
    });
    const ds = document.getElementById('dashSort');
    if(ds) ds.addEventListener('change', e=>{ Views._dashSort = e.target.value; dashboard(); });
    bindRepairCards();
  }

  // ============= LISTA =============
  function repairsList(filter){
    let list = DB.repairs;
    const active = filter || 'all';
    if(active!=='all') list = list.filter(r=>r.status===active);

    const sortKey = Views._listSort || 'recent';
    list = applySort(list, sortKey);

    const groups = groupByDate(list);
    const grouped = groups.map(g=>`
      ${sectionDivider(g.label, g.items.length)}
      ${g.items.map(repairCard).join('')}
    `).join('');

    const opts = FILTERS.map(f=>`<option value="${f.k}" ${f.k===active?'selected':''}>${f.label}</option>`).join('');

    view().innerHTML = `
      <div class="filter-bar">
        <div class="select-elegant">
          <select id="repairsFilter" aria-label="Filtrar reparaciones">${opts}</select>
        </div>
        ${sortSelectHtml('repairsSort', sortKey)}
      </div>
      ${list.length ? grouped : emptyState('Sin reparaciones','No hay registros en esta categoría')}
    `;
    document.getElementById('repairsFilter').addEventListener('change', e=> repairsList(e.target.value));
    document.getElementById('repairsSort').addEventListener('change', e=>{
      Views._listSort = e.target.value; repairsList(active);
    });
    bindRepairCards();
  }


  // ============= NUEVA / EDITAR =============
  function naWrap(fieldKey, label, inputHtml, naFields){
    const isNa = naFields.includes(fieldKey);
    return `<div class="form-group na-group ${isNa?'is-na':''}" data-na-group="${fieldKey}">
      <div class="label-row">
        <label>${label}</label>
        <button type="button" class="na-pill" data-na="${fieldKey}" aria-pressed="${isNa?'true':'false'}">
          <span class="dot"></span><span class="txt">${isNa?'Sin datos':'Marcar sin datos'}</span>
        </button>
      </div>
      <div class="na-input">${inputHtml}</div>
      <div class="na-placeholder">Sin datos asignados</div>
    </div>`;
  }

  function newRepair(existing){
    const r = existing || {};
    const photos = { device: (r.devicePhotos||[]).slice(), client: r.clientPhoto || null };
    let acceptAudio = r.acceptAudio || null;
    const naFields = (r.naFields||[]).slice();
    const parts = (r.parts||[]).map(p=>({ name:p.name||'', qty:p.qty||1, unitCost:p.unitCost!=null?p.unitCost:'' }));
    const phones = (r.clientPhones && r.clientPhones.length)
      ? r.clientPhones.slice()
      : (r.clientPhone ? [r.clientPhone] : ['']);
    if(!phones.length) phones.push('');

    const deviceOptions = DB.settings.deviceTypes.map(d=>`<option value="${escape(d)}">`).join('');

    view().innerHTML = `
      <button type="button" class="form-close" id="formCloseTop" title="Cerrar">${ICONS.close}</button>

      <h2 style="margin:0 0 16px;font-size:20px;padding-right:50px">${existing?'Editar reparación':'Nueva reparación'}</h2>
      <form id="repairForm" novalidate>

        ${sectionDivider('Cliente')}
        <div class="form-group">
          <label>Nombre del cliente *</label>
          <input name="clientName" id="clientNameInput" required autocapitalize="words" value="${escape(r.clientName||'')}">
        </div>
        <div class="form-group">
          <label>Foto del cliente</label>
          <div id="clientPhotoWrap" class="client-photo-wrap"></div>
          <div class="photo-add-row" id="clientPhotoAdd">
            <label class="photo-add-btn cam">
              ${ICONS.camera}<span>Tomar foto</span>
              <input type="file" accept="image/*" capture="user" id="clientPhotoCam">
            </label>
            <label class="photo-add-btn gal">
              ${ICONS.upload}<span>Galería</span>
              <input type="file" accept="image/*" id="clientPhotoInput">
            </label>
          </div>
          <div class="client-audio-inline" id="audioBox" style="margin-top:14px"></div>
        </div>

        <div class="form-group na-group ${naFields.includes('clientPhones')?'is-na':''}" data-na-group="clientPhones">
          <div class="label-row">
            <label>Teléfonos</label>
            <button type="button" class="na-pill" data-na="clientPhones" aria-pressed="${naFields.includes('clientPhones')?'true':'false'}">
              <span class="dot"></span><span class="txt">${naFields.includes('clientPhones')?'Sin datos':'Marcar sin datos'}</span>
            </button>
          </div>
          <div class="na-input">
            <div id="phonesList" class="phones-list"></div>
            <button type="button" class="btn-secondary btn-inline" id="addPhoneBtn">${ICONS.plus} Añadir otro número</button>
          </div>
          <div class="na-placeholder">Sin datos asignados</div>
        </div>

        ${naWrap('clientAddress','Dirección',`<textarea name="clientAddress" rows="2">${escape(r.clientAddress||'')}</textarea>`,naFields)}
        ${naWrap('clientIdNumber','Nº de identidad',`<input name="clientIdNumber" value="${escape(r.clientIdNumber||'')}">`,naFields)}

        ${sectionDivider('Equipo')}
        <div class="form-group">
          <label>Equipo *</label>
          <input name="device" list="deviceTypesList" required placeholder="Selecciona o escribe" value="${escape(r.device||'')}">
          <datalist id="deviceTypesList">${deviceOptions}</datalist>
        </div>
        ${naWrap('brand','Marca',`<input name="brand" value="${escape(r.brand||'')}">`,naFields)}
        ${naWrap('model','Modelo',`<input name="model" value="${escape(r.model||'')}">`,naFields)}
        ${naWrap('serial','Nº de serie',`<input name="serial" value="${escape(r.serial||'')}">`,naFields)}

        <div class="form-group">
          <label>Fotos del equipo</label>
          <div id="devicePhotos" class="multi-photo-grid"></div>
          <div class="photo-add-row">
            <label class="photo-add-btn cam">
              ${ICONS.camera}<span>Tomar foto</span>
              <input type="file" accept="image/*" capture="environment" id="addDevicePhotoCam">
            </label>
            <label class="photo-add-btn gal">
              ${ICONS.upload}<span>Galería</span>
              <input type="file" accept="image/*" id="addDevicePhoto" multiple>
            </label>
          </div>
        </div>

        <div class="form-group">
          <label>Falla reportada *</label>
          <textarea name="issue" required>${escape(r.issue||'')}</textarea>
        </div>

        ${sectionDivider('Detalles')}
        <div class="form-row">
          <div class="form-group">
            <label>Estado</label>
            <div class="select-elegant">
              <select name="status">
                ${STATUS_KEYS.map(s=>`<option value="${s}" ${r.status===s?'selected':''}>${statusLabel(s)}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="form-group"><label>Fecha de entrada</label><input name="createdAt" id="createdAtInput" type="date" value="${fmtDateInput(r.createdAt || Date.now())}"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Fecha de entrega</label><input name="dueDate" id="dueDateInput" type="date" value="${fmtDateInput(r.dueDate)}"></div>
          <div class="form-group">
            <label>Garantía (días desde la entrega)</label>
            <input name="warrantyDays" id="warrantyDaysInput" type="number" min="0" step="1" inputmode="numeric"
              placeholder="Ej: 30" value="${r.warrantyDays!=null?r.warrantyDays:(existing?'':(DB.settings.defaultWarrantyDays||''))}">
          </div>
        </div>
        <p class="muted small" id="warrantyHint" style="margin:-4px 2px 10px">La garantía comienza el día que marques el equipo como <b>Entregado</b>.</p>
        ${naWrap('price','Precio',`<input name="price" type="number" step="0.01" inputmode="decimal" value="${r.price!=null?r.price:''}">`,naFields)}
        ${naWrap('deposit','Anticipo',`<input name="deposit" type="number" step="0.01" inputmode="decimal" value="${r.deposit!=null?r.deposit:''}">`,naFields)}
        ${naWrap('notes','Notas',`<textarea name="notes">${escape(r.notes||'')}</textarea>`,naFields)}

        ${sectionDivider('Piezas a sustituir')}
        <p class="muted small" style="margin:-4px 2px 10px">Selecciona la pieza que cambiaste (puerto, mica, batería, etc.). Solo aparecen las piezas que has <b>comprado</b> en <b>Compra/Venta</b>. El costo unitario se toma automáticamente de tus compras. Si no cambiaste ninguna pieza, deja la lista vacía.</p>
        <div id="partsList" class="parts-list"></div>
        <button type="button" class="btn-secondary btn-inline" id="addPartBtn">${ICONS.plus} Añadir pieza</button>
        <div id="partsNoStock" class="muted small" style="margin-top:8px"></div>
        <div id="partsSummary" class="parts-summary hidden"></div>



        <button type="submit" class="btn-primary" style="margin-top:8px">${existing?'Guardar cambios':'Registrar reparación'}</button>
        ${(existing && existing.status==='delivered') ? '' : `<button type="button" class="btn-primary btn-cancel" id="cancelRepairBtn" style="margin-top:10px">
          ${ICONS.cancel} Cancelar reparación
        </button>`}
      </form>
    `;

    // Cerrar (arriba) — confirmar si hay datos sin guardar
    document.getElementById('formCloseTop').onclick = async ()=>{
      const f = document.getElementById('repairForm');
      let hasData = false;
      if(f){
        const fd = new FormData(f);
        for(const [k,v] of fd.entries()){
          if(k==='status' || k==='createdAt' || k==='dueDate' || k==='warrantyDays') continue;
          if(String(v||'').trim()){ hasData = true; break; }
        }
        if(photos.device.length || photos.client || acceptAudio || parts.length) hasData = true;
      }
      if(!existing && hasData){
        const ok = await UI.confirmDialog({
          title:'¿Salir sin guardar?',
          message:'Tienes información sin guardar de esta reparación. Si sales ahora se perderá. ¿Continuar?',
          okText:'Salir sin guardar', cancelText:'Seguir editando', danger:true
        });
        if(!ok) return;
      }
      try{ if(rec) rec.cancel(); }catch(e){}
      App.go(existing ? 'repairs' : 'dashboard');
    };
    // Cancelar reparación (abajo)
    const _cancelBtn = document.getElementById('cancelRepairBtn');
    if(_cancelBtn) _cancelBtn.onclick = async ()=>{
      const ok = await UI.confirmDialog({
        title: existing ? 'Cancelar reparación' : 'Cancelar y salir',
        message: existing
          ? '¿Cancelar esta reparación? Se marcará como cancelada.'
          : '¿Cancelar y salir? Se perderán los datos no guardados.',
        okText:'Sí, cancelar', cancelText:'Volver', danger:true
      });
      if(!ok) return;
      try{ if(rec) rec.cancel(); }catch(e){}
      if(existing){
        DB.updateRepair(existing.id, { status: 'cancelled' });
        UI.toast('Reparación cancelada');
        App.go('repairs');
      } else {
        App.go('dashboard');
      }
    };

    UI.attachAutoCapitalize(document.getElementById('clientNameInput'));

    // Teléfonos
    function renderPhones(){
      const wrap = document.getElementById('phonesList');
      wrap.innerHTML = phones.map((p,i)=>`
        <div class="phone-row">
          <input type="tel" inputmode="tel" placeholder="Número ${i+1}" value="${escape(p||'')}" data-phone-idx="${i}">
          ${phones.length>1?`<button type="button" class="icon-btn-sm" data-rm-phone="${i}" aria-label="Quitar">${ICONS.trash}</button>`:''}
        </div>
      `).join('');
      wrap.querySelectorAll('input[data-phone-idx]').forEach(inp=>{
        inp.addEventListener('input', e=>{ phones[+inp.dataset.phoneIdx] = e.target.value; });
      });
      wrap.querySelectorAll('[data-rm-phone]').forEach(b=>{
        b.onclick = ()=>{ phones.splice(+b.dataset.rmPhone,1); if(!phones.length) phones.push(''); renderPhones(); };
      });
    }
    renderPhones();
    document.getElementById('addPhoneBtn').onclick = ()=>{ phones.push(''); renderPhones(); };

    // N/A toggles
    function applyNaState(group, isNa){
      group.classList.toggle('is-na', isNa);
      const btn = group.querySelector('.na-pill');
      btn.setAttribute('aria-pressed', isNa?'true':'false');
      btn.querySelector('.txt').textContent = isNa ? 'Sin datos' : 'Marcar sin datos';
      group.querySelectorAll('.na-input input, .na-input textarea, .na-input button').forEach(el=>{
        el.disabled = isNa;
      });
    }
    view().querySelectorAll('.na-pill').forEach(btn=>{
      const key = btn.dataset.na;
      const group = btn.closest('[data-na-group]');
      applyNaState(group, naFields.includes(key));
      btn.addEventListener('click', ()=>{
        const idx = naFields.indexOf(key);
        if(idx>=0){ naFields.splice(idx,1); applyNaState(group,false); }
        else { naFields.push(key); applyNaState(group,true); }
      });
    });

    // Fotos equipo
    function renderDevicePhotos(){
      const wrap = document.getElementById('devicePhotos');
      if(!photos.device.length){ wrap.innerHTML = '<p class="muted small">Aún no hay fotos del equipo.</p>'; return; }
      wrap.innerHTML = photos.device.map((src,i)=>`
        <div class="photo-item">
          <img src="${src}" data-view-dev="${i}">
          <button type="button" class="photo-remove" data-rm-dev="${i}">${ICONS.trash}</button>
        </div>
      `).join('');
      wrap.querySelectorAll('[data-rm-dev]').forEach(b=>{
        b.onclick = e=>{ e.preventDefault(); e.stopPropagation(); photos.device.splice(+b.dataset.rmDev,1); renderDevicePhotos(); };
      });
      wrap.querySelectorAll('[data-view-dev]').forEach(img=>{
        img.onclick = ()=> UI.openImageViewer(photos.device, +img.dataset.viewDev);
      });
    }
    renderDevicePhotos();
    async function handleDevicePhotoInput(e){
      for(const f of Array.from(e.target.files||[])){
        try{ photos.device.push(await UI.resizeImage(f)); }catch(err){ UI.toast('Error con imagen'); }
      }
      e.target.value = '';
      renderDevicePhotos();
    }
    document.getElementById('addDevicePhoto').addEventListener('change', handleDevicePhotoInput);
    const _devCam = document.getElementById('addDevicePhotoCam');
    if(_devCam) _devCam.addEventListener('change', handleDevicePhotoInput);

    // Foto cliente — estructura coherente con la foto del equipo
    async function onPickClient(e){
      const f = e.target.files[0]; if(!f) return;
      try{ photos.client = await UI.resizeImage(f); renderClient(); }catch(err){ UI.toast('Error con imagen'); }
      e.target.value = '';
    }
    function renderClient(){
      const wrap = document.getElementById('clientPhotoWrap');
      if(!wrap) return;
      if(photos.client){
        wrap.innerHTML = `
          <div class="client-photo-preview has-img">
            <img src="${photos.client}" id="clientPhotoImg" alt="Foto del cliente">
            <button type="button" class="photo-remove" id="clientPhotoRm" title="Quitar foto">${ICONS.trash}</button>
          </div>`;
        const rm = document.getElementById('clientPhotoRm');
        if(rm) rm.onclick = e=>{ e.preventDefault(); e.stopPropagation(); photos.client = null; renderClient(); };
        const img = document.getElementById('clientPhotoImg');
        if(img) img.onclick = ()=> UI.openImageViewer(photos.client);
      } else {
        wrap.innerHTML = `
          <div class="client-photo-preview empty">
            ${ICONS.person}
            <span class="muted small">Aún no hay foto del cliente</span>
          </div>`;
      }
      // Re-enganchar inputs por si el DOM se reemplazó
      const inp = document.getElementById('clientPhotoInput');
      if(inp) inp.onchange = onPickClient;
      const cam = document.getElementById('clientPhotoCam');
      if(cam) cam.onchange = onPickClient;
    }
    renderClient();

    // AUDIO (bajo la foto del cliente)
    let rec = null;
    function renderAudio(){
      const box = document.getElementById('audioBox');
      if(acceptAudio){
        box.innerHTML = `
          <p class="muted small" style="margin:0">Audio de aceptación</p>
          <audio controls src="${acceptAudio}" style="width:100%"></audio>
          <button type="button" class="btn-secondary btn-inline" id="rmAudio">${ICONS.trash} Eliminar</button>`;
        document.getElementById('rmAudio').onclick = ()=>{ acceptAudio = null; renderAudio(); };
      } else {
        box.innerHTML = `
          <p class="muted small" style="margin:0">Grabar al cliente aceptando</p>
          <div class="audio-controls">
            <button type="button" class="btn-primary btn-inline" id="recStart">${ICONS.mic} Empezar a grabar</button>
            <button type="button" class="btn-secondary btn-inline" id="recStop" style="display:none">${ICONS.stop} Detener</button>
            <span id="recTimer" class="muted small"></span>
            <span id="recDot" class="rec-pulse" style="display:none"></span>
          </div>
          <label class="file-pill" for="audioFile">${ICONS.upload}<span>Subir archivo</span></label>
          <input type="file" accept="audio/*" id="audioFile" hidden>
        `;
        const recStart = document.getElementById('recStart');
        const recStop = document.getElementById('recStop');
        const recDot = document.getElementById('recDot');
        recStart.onclick = async ()=>{
          try{
            rec = UI.createRecorder();
            await rec.start(s=>{ const t = document.getElementById('recTimer'); if(t) t.textContent = `${s}s`; });
            recStart.style.display = 'none';
            recStop.style.display = '';
            recDot.style.display = '';
          }catch(e){ UI.toast('No se pudo acceder al micrófono'); }
        };
        recStop.onclick = async ()=>{
          try{
            acceptAudio = await rec.stop();
            rec = null;
            renderAudio();
          }catch(e){ UI.toast('Error al detener'); }
        };
        document.getElementById('audioFile').onchange = async e=>{
          const f = e.target.files[0]; if(!f) return;
          acceptAudio = await UI.blobToDataUrl(f); renderAudio();
        };
      }
    }
    renderAudio();

    // === PIEZAS (lista de compras, costo fijado por Compra/Venta) ===
    function computePurchasedCatalog(){
      // Recorre transacciones de compra para calcular costo promedio y unidades disponibles
      const map = {};
      for(const t of DB.transactions){
        if(t.type!=='purchase') continue;
        const n = String(t.product||'').trim(); if(!n) continue;
        const q = Number(t.quantity||0);
        const tot = Number(t.total||0);
        if(!map[n]) map[n] = { name:n, qty:0, invested:0 };
        map[n].qty += q; map[n].invested += tot;
      }
      // Resta unidades ya vendidas o usadas en otras reparaciones
      const stats = DB.productStats();
      for(const n in map){
        const s = stats[n];
        const used = s ? (s.sold + s.usedInRepairs) : 0;
        map[n].available = Math.max(0, map[n].qty - used);
        map[n].avgCost = map[n].qty>0 ? (map[n].invested/map[n].qty) : 0;
      }
      return map;
    }

    function partUsedInCurrent(name, idxExcept){
      // Suma cantidades ya añadidas en esta misma reparación (para no contar 2 veces)
      let s = 0;
      parts.forEach((p,i)=>{
        if(i===idxExcept) return;
        if((p.name||'').toLowerCase()===String(name||'').toLowerCase()) s += Number(p.qty||0);
      });
      return s;
    }

    function renderParts(){
      const wrap = document.getElementById('partsList');
      const sum = document.getElementById('partsSummary');
      const noStock = document.getElementById('partsNoStock');
      if(!wrap) return;
      const catalog = computePurchasedCatalog();
      const catalogNames = Object.keys(catalog).sort((a,b)=>a.localeCompare(b,'es'));

      if(!catalogNames.length && !parts.length){
        wrap.innerHTML = '<p class="muted small parts-empty">No tienes piezas compradas todavía. Ve a <b>Compra/Venta</b> y registra una compra antes de añadirlas aquí.</p>';
        sum.classList.add('hidden');
        if(noStock) noStock.textContent = '';
        return;
      }
      if(!parts.length){
        wrap.innerHTML = '<p class="muted small parts-empty">Reparación sin cambio de pieza.</p>';
        sum.classList.add('hidden');
        if(noStock) noStock.textContent = '';
        return;
      }

      wrap.innerHTML = parts.map((p,i)=>{
        // Opciones: catálogo + el nombre actual si no está en catálogo (compatibilidad)
        const currentName = p.name||'';
        const names = catalogNames.slice();
        if(currentName && !names.some(n=>n.toLowerCase()===currentName.toLowerCase())) names.unshift(currentName);
        const opts = ['<option value="">— Selecciona pieza —</option>']
          .concat(names.map(n=>{
            const info = catalog[n];
            const avail = info ? Math.max(0, info.available - partUsedInCurrent(n,i)) : 0;
            const cost = info ? info.avgCost : Number(p.unitCost||0);
            const tag = info ? `  (stock ${avail} · $ ${cost.toFixed(2)})` : '  (no comprada)';
            const sel = currentName.toLowerCase()===n.toLowerCase() ? ' selected' : '';
            return `<option value="${escape(n)}"${sel}>${escape(n)}${escape(tag)}</option>`;
          })).join('');
        const info = catalog[currentName];
        const cost = info ? info.avgCost : Number(p.unitCost||0);
        const avail = info ? Math.max(0, info.available - partUsedInCurrent(currentName,i)) : 0;
        const overWarn = (info && Number(p.qty||0) > avail + Number(p.qty||0)) ? '' : ''; // handled below
        return `
        <div class="part-row stock-row" data-pi="${i}">
          <div class="pr-main">
            <div class="select-elegant">
              <select class="pr-name" data-pf="name" data-pi="${i}">${opts}</select>
            </div>
            <div class="pr-nums">
              <input class="pr-qty" type="number" min="1" step="1" inputmode="numeric" placeholder="Cant." value="${p.qty||1}" data-pf="qty" data-pi="${i}">
              <input class="pr-cost" type="number" step="0.01" value="${cost.toFixed(2)}" data-pf="unitCost" data-pi="${i}" readonly title="Costo unitario tomado de tus compras">
            </div>
            ${currentName && info ? `<p class="muted xsmall" style="margin:4px 2px 0">Disponible tras esta reparación: <b>${Math.max(0, avail - Number(p.qty||0))}</b> · costo unit. $ ${cost.toFixed(2)}</p>` : (currentName ? '<p class="muted xsmall" style="margin:4px 2px 0;color:#ff9b8b">⚠️ Esta pieza no figura en tus compras. Regístrala en Compra/Venta.</p>' : '')}
          </div>
          <button type="button" class="icon-btn-sm pr-rm" data-rm-part="${i}" aria-label="Quitar pieza">${ICONS.trash}</button>
        </div>`;
      }).join('');

      wrap.querySelectorAll('select[data-pi], input[data-pi]').forEach(inp=>{
        inp.addEventListener('input', e=>{
          const i = +inp.dataset.pi; const f = inp.dataset.pf;
          if(f==='qty') parts[i].qty = parseInt(inp.value,10)||0;
          else if(f==='unitCost') parts[i].unitCost = inp.value;
          else {
            parts[i].name = inp.value;
            // refrescar costo desde catálogo
            const info = catalog[parts[i].name];
            parts[i].unitCost = info ? Number(info.avgCost.toFixed(2)) : '';
            renderParts(); return;
          }
          updatePartsSummary();
        });
      });
      wrap.querySelectorAll('[data-rm-part]').forEach(b=>{
        b.onclick = ()=>{ parts.splice(+b.dataset.rmPart,1); renderParts(); };
      });
      // Aviso global si alguna pieza supera el stock
      const issues = [];
      parts.forEach((p,i)=>{
        if(!p.name) return;
        const info = catalog[p.name]; if(!info) return;
        const avail = info.available - partUsedInCurrent(p.name,i);
        if(Number(p.qty||0) > avail) issues.push(`${p.name}: pides ${p.qty}, disponibles ${Math.max(0,avail)}`);
      });
      if(noStock) noStock.innerHTML = issues.length ? `<span style="color:#ff9b8b">⚠️ Stock insuficiente — ${issues.map(escape).join(' · ')}</span>` : '';
      updatePartsSummary();
    }
    function updatePartsSummary(){
      const sum = document.getElementById('partsSummary');
      if(!sum) return;
      const valid = parts.filter(p=>p.name && Number(p.qty)>0);
      if(!valid.length){ sum.classList.add('hidden'); return; }
      const inv = valid.reduce((a,p)=> a + (Number(p.unitCost||0)*Number(p.qty||0)), 0);
      sum.classList.remove('hidden');
      sum.innerHTML = `<span>Piezas: <b>${valid.length}</b></span><span>Costo en piezas: <b>$ ${inv.toFixed(2)}</b></span>`;
    }
    document.getElementById('addPartBtn').onclick = ()=>{
      // Pre-rellenar con la primera pieza disponible si existe
      const cat = computePurchasedCatalog();
      const names = Object.keys(cat).filter(n=> (cat[n].available - partUsedInCurrent(n,-1)) > 0).sort((a,b)=>a.localeCompare(b,'es'));
      const first = names[0];
      const cost = first ? Number(cat[first].avgCost.toFixed(2)) : '';
      parts.push({ name: first||'', qty:1, unitCost: cost });
      renderParts();
    };
    renderParts();

    // Garantía: siempre disponible (ya no se bloquea por fecha de entrega pasada)
    function syncWarrantyAvailability(){
      const wEl = document.getElementById('warrantyDaysInput');
      const hint = document.getElementById('warrantyHint');
      if(!wEl || !hint) return;
      wEl.disabled = false;
      wEl.placeholder = 'Ej: 30';
      hint.innerHTML = 'La garantía comienza el día que marques el equipo como <b>Entregado</b> — los días restantes se irán actualizando solos.';
      hint.style.color = '';
    }
    syncWarrantyAvailability();






    // Submit
    document.getElementById('repairForm').addEventListener('submit', e=>{
      e.preventDefault();
      const doSave = async ()=>{
        let fd_pre = new FormData(e.target);
        if(!existing){
          const idn = (fd_pre.get('clientIdNumber')||'').trim();
          if(idn && !naFields.includes('clientIdNumber')){
            const dup = DB.repairs.find(x => (x.clientIdNumber||'').trim().toLowerCase() === idn.toLowerCase());
            if(dup){
              const ok = await UI.confirmDialog({
                title:'Cliente ya existe',
                message:`Ya existe un cliente con la identidad ${idn} (${dup.clientName||'sin nombre'}). ¿Crear otra reparación para el mismo cliente? Se usarán sus datos para no duplicar información.`,
                okText:'Sí, usar mismo cliente', cancelText:'Cancelar'
              });
              if(!ok) return;
              const cn = document.getElementById('clientNameInput');
              if(cn && !cn.value.trim()) cn.value = dup.clientName||'';
              const addrEl = document.querySelector('[name=clientAddress]');
              if(addrEl && !addrEl.value.trim() && dup.clientAddress) addrEl.value = dup.clientAddress;
              if(!photos.client && dup.clientPhoto) photos.client = dup.clientPhoto;
              if((!phones.length || phones.every(x=>!x)) && (dup.clientPhones||[]).length){
                phones.length = 0; (dup.clientPhones||[]).forEach(x=>phones.push(x));
              }
              fd_pre = new FormData(e.target);
            }
          }
        }
        const fd = fd_pre;
        const data = {};
        ['clientName','clientAddress','clientIdNumber','device','brand','model','serial','issue','status','notes'].forEach(k=>{
          const v = fd.get(k);
          data[k] = naFields.includes(k) ? null : (v != null ? String(v).trim() || null : null);
        });
        data.clientName = (fd.get('clientName')||'').trim();
        data.device = fd.get('device');
        data.issue = fd.get('issue');
        data.status = fd.get('status');
        const cleanPhones = naFields.includes('clientPhones') ? [] : phones.map(p=>String(p||'').trim()).filter(Boolean);
        data.clientPhones = cleanPhones;
        data.clientPhone = cleanPhones[0] || null;
        const due = fd.get('dueDate');
        data.dueDate = due ? new Date(due+'T12:00:00').getTime() : null;
        const cAt = fd.get('createdAt');
        if(cAt){
          // Conservar hora original si existe, si no usar mediodía
          const orig = r.createdAt ? new Date(r.createdAt) : null;
          const nd = new Date(cAt+'T12:00:00');
          if(orig){ nd.setHours(orig.getHours(), orig.getMinutes(), orig.getSeconds(), 0); }
          data.createdAt = nd.getTime();
        }
        const price = fd.get('price'); const dep = fd.get('deposit');
        data.price = naFields.includes('price') ? null : (price ? parseFloat(price) : null);
        data.deposit = naFields.includes('deposit') ? null : (dep ? parseFloat(dep) : null);
        const wd = fd.get('warrantyDays');
        // Garantía: independiente de la fecha de entrega. Cuenta desde el día de entrega.
        data.warrantyDays = (wd!=null && String(wd).trim()!=='') ? Math.max(0, parseInt(wd,10)||0) : null;
        data.devicePhotos = photos.device;
        data.devicePhoto = photos.device[0] || null;
        data.clientPhoto = photos.client;
        data.acceptAudio = acceptAudio;
        data.naFields = naFields;
        data.parts = parts
          .map(p=>({
            name: String(p.name||'').trim(),
            qty: Math.max(0, parseInt(p.qty,10)||0),
            unitCost: (p.unitCost!=='' && p.unitCost!=null) ? Math.max(0, parseFloat(p.unitCost)||0) : 0
          }))
          .filter(p=> p.name && p.qty>0);
        // Auto-añadir piezas nuevas al catálogo de productos
        for(const p of data.parts){
          if(!DB.settings.productTypes.some(x=>x.toLowerCase()===p.name.toLowerCase())){
            DB.addProductType(p.name);
          }
        }

        if(existing){
          DB.updateRepair(existing.id, data);
          UI.toast('Reparación actualizada');
        } else {
          const nr = DB.addRepair(data);
          UI.toast('Reparación registrada: '+nr.id);
        }
        App.go('repairs');
      };
      if(rec && rec.isRecording()){
        rec.stop().then(url=>{ acceptAudio = url; rec = null; doSave(); }).catch(()=> doSave());
      } else {
        doSave();
      }
    });
  }

  // ============= DETALLE =============
  function showRepair(id){
    const r = DB.findRepair(id);
    if(!r) return;
    const photos = (r.devicePhotos && r.devicePhotos.length) ? r.devicePhotos : (r.devicePhoto?[r.devicePhoto]:[]);
    const naFields = r.naFields || [];

    function valHtml(key, transform){
      if(naFields.includes(key)) return '<span class="na-tag">Sin datos</span>';
      let v = r[key];
      if(v == null || v === '') return '<span class="muted">—</span>';
      return transform ? transform(v) : escape(v);
    }

    const phones = (r.clientPhones && r.clientPhones.length) ? r.clientPhones : (r.clientPhone?[r.clientPhone]:[]);
    let phonesHtml;
    if(naFields.includes('clientPhones') || naFields.includes('clientPhone')){
      phonesHtml = '<span class="na-tag">Sin datos</span>';
    } else if(!phones.length){
      phonesHtml = '<span class="muted">—</span>';
    } else {
      phonesHtml = `<div class="phones-display">${phones.map(p=>{
        const tel = UI.phoneClean(p); const sms = UI.phoneSms(p);
        return `<div style="display:flex;gap:6px">
          <a class="phone-link" href="tel:${escape(tel)}">${ICONS.phone}<span>${escape(p)}</span></a>
          <a class="phone-link sms" href="sms:${escape(sms)}">${ICONS.sms}<span>SMS</span></a>
        </div>`;
      }).join('')}</div>`;
    }

    const html = `
      <h2 style="margin:0 0 4px;font-size:20px">${escape(r.clientName||'Cliente')}</h2>
      <p class="muted" style="margin:0 0 14px">${escape(r.id)} · ${escape(r.device||'Equipo')} · <span class="status ${r.status}">${statusLabel(r.status)}</span></p>

      ${r.clientPhoto ? `<div class="client-photo-small"><img src="${r.clientPhoto}" id="detailClientPhoto"></div>` : ''}
      ${photos.length ? `<div class="detail-photo-strip">${photos.map((p,i)=>`<img src="${p}" data-view-idx="${i}">`).join('')}</div>` : ''}

      <div class="detail-row"><span class="lbl">Teléfono</span><span class="val">${phonesHtml}</span></div>
      <div class="detail-row"><span class="lbl">Dirección</span><span class="val">${valHtml('clientAddress')}</span></div>
      <div class="detail-row"><span class="lbl">Nº identidad</span><span class="val">${valHtml('clientIdNumber')}</span></div>
      <div class="detail-row"><span class="lbl">Marca</span><span class="val">${valHtml('brand')}</span></div>
      <div class="detail-row"><span class="lbl">Modelo</span><span class="val">${valHtml('model')}</span></div>
      <div class="detail-row"><span class="lbl">Nº serie</span><span class="val">${valHtml('serial')}</span></div>
      <div class="detail-row"><span class="lbl">Falla</span><span class="val">${escape(r.issue||'—')}</span></div>
      <div class="detail-row"><span class="lbl">Notas</span><span class="val">${valHtml('notes')}</span></div>
      <div class="detail-row"><span class="lbl">Ingreso</span><span class="val">${fmtDate(r.createdAt)}</span></div>
      <div class="detail-row"><span class="lbl">Entrega</span><span class="val">${r.dueDate?fmtDate(r.dueDate):'—'}</span></div>
      <div class="detail-row"><span class="lbl">Precio</span><span class="val">${naFields.includes('price')?'<span class="na-tag">Sin datos</span>':(r.price!=null?Number(r.price).toFixed(2):'<span class="muted">—</span>')}</span></div>
      <div class="detail-row"><span class="lbl">Anticipo</span><span class="val">${naFields.includes('deposit')?'<span class="na-tag">Sin datos</span>':(r.deposit!=null?Number(r.deposit).toFixed(2):'<span class="muted">—</span>')}</span></div>
      ${(()=>{ 
        if(!r.warrantyDays) return '<div class="detail-row"><span class="lbl">Garantía</span><span class="val"><span class="muted">—</span></span></div>';
        if(r.status !== 'delivered' || !r.deliveredAt){
          return `<div class="detail-row"><span class="lbl">Garantía</span><span class="val">${r.warrantyDays} días (empieza al entregar)</span></div>`;
        }
        const endTs = r.deliveredAt + r.warrantyDays*86400000;
        const remaining = Math.ceil((endTs - Date.now())/86400000);
        const status = remaining>0
          ? `<span class="warranty-tag active">Vigente · ${remaining} día(s)</span>`
          : `<span class="warranty-tag expired">Vencida</span>`;
        return `<div class="detail-row"><span class="lbl">Garantía</span><span class="val">${r.warrantyDays} días · hasta ${fmtDate(endTs)} ${status}</span></div>`;
      })()}

      ${(()=>{
        const ps = r.parts||[];
        if(!ps.length) return `<div class="detail-row"><span class="lbl">Piezas</span><span class="val"><span class="muted">Sin cambio de pieza</span></span></div>`;
        const inv = ps.reduce((a,p)=> a + Number(p.unitCost||0)*Number(p.qty||0), 0);
        const price = Number(r.price||0);
        const profit = price - inv;
        const pcls = profit>=0 ? 'pos' : 'neg';
        const rows = ps.map(p=>`<div class="part-show"><span class="ps-name">${escape(p.name)}</span><span class="ps-meta">${p.qty} × $ ${Number(p.unitCost||0).toFixed(2)}</span><span class="ps-total">$ ${(Number(p.unitCost||0)*Number(p.qty||0)).toFixed(2)}</span></div>`).join('');
        return `<div class="section-title">Piezas cambiadas</div>
          <div class="parts-show">${rows}</div>
          <div class="parts-show-foot">
            <span>Inversión en piezas <b>$ ${inv.toFixed(2)}</b></span>
            ${r.price!=null?`<span class="tx-profit ${pcls}">Ganancia rep.: $ ${profit.toFixed(2)}</span>`:''}
          </div>`;
      })()}

      ${r.acceptAudio ? `<div class="section-title">Aceptación del cliente</div><audio controls src="${r.acceptAudio}" style="width:100%"></audio>` : ''}



      <div class="section-title">Cambiar estado</div>
      <div class="select-elegant">
        <select id="quickStatus">
          ${['pending','in_progress','completed','delivered'].map(s=>`<option value="${s}" ${r.status===s?'selected':''}>${statusLabel(s)||s}</option>`).join('')}
        </select>
      </div>
      <div class="btn-row three">
        <button class="btn-secondary" id="editBtn">${ICONS.edit} Editar</button>
        <button class="btn-secondary" id="ticketBtn">${ICONS.print} Etiqueta</button>
        <button class="btn-primary btn-cancel" id="delBtn">${ICONS.trash} Eliminar</button>
      </div>
    `;
    UI.openModal(html);

    document.querySelectorAll('[data-view-idx]').forEach(img=>{
      img.onclick = ()=> UI.openImageViewer(photos, +img.dataset.viewIdx);
    });
    const cp = document.getElementById('detailClientPhoto');
    if(cp) cp.onclick = ()=> UI.openImageViewer(r.clientPhoto);

    document.getElementById('quickStatus').addEventListener('change', async e=>{
      const newSt = e.target.value;
      if(newSt==='cancelled' && r.status==='delivered'){
        const ok = await UI.confirmDialog({
          title:'Atención',
          message:'Esta reparación ya está ENTREGADA. ¿Seguro que quieres marcarla como CANCELADA?',
          okText:'Sí, cancelar', cancelText:'No, volver', danger:true
        });
        if(!ok){ e.target.value = r.status; return; }
      }
      DB.updateRepair(id, { status: newSt });
      UI.toast('Estado actualizado'); UI.closeModal(); App.refresh();
    });
    document.getElementById('editBtn').onclick = ()=>{ UI.closeModal(); App.go('new', null, r); };
    document.getElementById('ticketBtn').onclick = ()=>{ showLabel(r); };
    document.getElementById('delBtn').onclick = async ()=>{
      const ok = await UI.confirmDialog({
        title:'Eliminar reparación',
        message:`¿Eliminar definitivamente la reparación ${r.id}? Esta acción no se puede deshacer.`,
        okText:'Eliminar', cancelText:'Cancelar', danger:true
      });
      if(!ok) return;
      DB.deleteRepair(id); UI.toast('Eliminada'); UI.closeModal(); App.refresh();
    };
  }

  // ============= ETIQUETA INTERNA (rápida, sin imprimir) =============
  function showLabel(r){
    const phones = (r.clientPhones && r.clientPhones.length) ? r.clientPhones : (r.clientPhone?[r.clientPhone]:[]);
    const pieces = [
      ['ID', r.id],
      ['Cliente', r.clientName||'—'],
      ['Tel', phones.join(' / ') || '—'],
      ['Equipo', [r.device, r.brand, r.model].filter(Boolean).join(' ') || '—'],
      ['Serie', r.serial || '—'],
      ['Falla', r.issue || '—'],
      ['Entrega', r.dueDate ? fmtDate(r.dueDate) : '—']
    ];
    const rows = pieces.map(([k,vv])=>`<div class="lbl-row"><span class="k">${escape(k)}</span><span class="v">${escape(vv)}</span></div>`).join('');
    const plain = pieces.map(([k,vv])=> `${k}: ${vv}`).join('\n');
    UI.openModal(`
      <h2 style="margin:0 0 4px;font-size:18px">Etiqueta del equipo</h2>
      <p class="muted small" style="margin:0 0 12px">Datos rápidos para pegar detrás del aparato.</p>
      <div class="label-card" id="labelCard">
        <div class="lbl-id">${escape(r.id)}</div>
        ${rows}
      </div>
      <div class="btn-row" style="margin-top:14px">
        <button class="btn-secondary" id="copyLbl">Copiar texto</button>
        <button class="btn-secondary" id="closeLbl">Cerrar</button>
      </div>
    `);
    document.getElementById('closeLbl').onclick = ()=> UI.closeModal();
    document.getElementById('copyLbl').onclick = async ()=>{
      try{ await navigator.clipboard.writeText(plain); UI.toast('Copiado al portapapeles'); }
      catch(e){ UI.toast('No se pudo copiar'); }
    };
  }

  // ============= TICKET DE SALIDA (legacy) =============
  function printTicket(r){
    const s = DB.settings;
    const logo = s.logo
      ? `<img src="${s.logo}" style="width:60px;height:60px;border-radius:12px;object-fit:cover">`
      : `<div style="width:60px;height:60px;border-radius:12px;background:#7a1f1f;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:22px">${escape((s.appName||'T').charAt(0))}</div>`;
    const phones = (r.clientPhones && r.clientPhones.length) ? r.clientPhones : (r.clientPhone?[r.clientPhone]:[]);
    const total = r.price!=null ? Number(r.price) : null;
    const dep = r.deposit!=null ? Number(r.deposit) : 0;
    const saldo = total!=null ? (total - dep) : null;
    const photosHtml = (r.devicePhotos||[]).slice(0,3).map(p=>
      `<img src="${p}" style="width:80px;height:80px;object-fit:cover;border-radius:6px;border:1px solid #ddd">`
    ).join('');
    const html = `
<!doctype html><html><head><meta charset="utf-8"><title>Ticket ${escape(r.id)}</title>
<style>
  *{box-sizing:border-box}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;margin:0;padding:24px;color:#111;background:#fff}
  .ticket{max-width:560px;margin:0 auto;border:1px solid #ddd;border-radius:14px;padding:22px;background:#fff}
  .head{display:flex;justify-content:space-between;align-items:center;gap:12px;border-bottom:2px dashed #ccc;padding-bottom:14px;margin-bottom:14px}
  .brand{display:flex;align-items:center;gap:10px}
  .brand h1{margin:0;font-size:20px;letter-spacing:.5px}
  .brand p{margin:0;font-size:11px;color:#666;text-transform:uppercase;letter-spacing:1px}
  .id-box{text-align:right}
  .id-box .id{font-family:'Courier New',monospace;font-weight:800;font-size:22px;color:#7a1f1f;letter-spacing:1px}
  .id-box .id-lbl{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#888}
  h2{font-size:13px;text-transform:uppercase;letter-spacing:1.2px;color:#7a1f1f;margin:18px 0 6px;border-bottom:1px solid #eee;padding-bottom:4px}
  .row{display:flex;justify-content:space-between;padding:4px 0;font-size:13px;gap:12px}
  .row .l{color:#666}
  .row .v{font-weight:600;text-align:right;max-width:65%}
  .photos{display:flex;gap:6px;margin-top:6px;flex-wrap:wrap}
  .totals{margin-top:14px;background:#faf6f3;border:1px solid #eee;border-radius:10px;padding:12px}
  .totals .row{padding:3px 0}
  .totals .total{font-size:16px;font-weight:800;color:#7a1f1f;border-top:1px dashed #c5a98a;margin-top:6px;padding-top:6px}
  .signs{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:30px}
  .signs .box{border-top:1px solid #333;padding-top:6px;text-align:center;font-size:11px;color:#666;text-transform:uppercase;letter-spacing:.8px}
  .legal{margin-top:18px;font-size:10px;color:#888;line-height:1.5;text-align:center}
  .actions{max-width:560px;margin:14px auto 0;display:flex;gap:8px;justify-content:flex-end}
  button{padding:10px 16px;border-radius:8px;border:1px solid #ccc;background:#fff;cursor:pointer;font-weight:600}
  button.primary{background:#7a1f1f;color:#fff;border-color:#7a1f1f}
  @media print{ .actions{display:none} body{padding:0} .ticket{border:0} }
</style></head>
<body>
  <div class="ticket" id="ticketPrintArea">
    <div class="head">
      <div class="brand">
        ${logo}
        <div>
          <h1>${escape(s.appName||'Taller')}</h1>
          <p>Comprobante de servicio</p>
        </div>
      </div>
      <div class="id-box">
        <div class="id-lbl">N.º Ticket</div>
        <div class="id">#${escape(r.id)}</div>
        <div class="id-lbl" style="margin-top:4px">${fmtDateTime(r.createdAt)}</div>
      </div>
    </div>

    <h2>Cliente</h2>
    <div class="row"><span class="l">Nombre</span><span class="v">${escape(r.clientName||'—')}</span></div>
    ${phones.length?`<div class="row"><span class="l">Teléfono(s)</span><span class="v">${phones.map(escape).join(' · ')}</span></div>`:''}
    ${r.clientAddress?`<div class="row"><span class="l">Dirección</span><span class="v">${escape(r.clientAddress)}</span></div>`:''}
    ${r.clientIdNumber?`<div class="row"><span class="l">N.º identidad</span><span class="v">${escape(r.clientIdNumber)}</span></div>`:''}

    <h2>Equipo</h2>
    <div class="row"><span class="l">Equipo</span><span class="v">${escape(r.device||'—')}</span></div>
    ${r.brand?`<div class="row"><span class="l">Marca</span><span class="v">${escape(r.brand)}</span></div>`:''}
    ${r.model?`<div class="row"><span class="l">Modelo</span><span class="v">${escape(r.model)}</span></div>`:''}
    ${r.serial?`<div class="row"><span class="l">N.º serie</span><span class="v">${escape(r.serial)}</span></div>`:''}
    <div class="row"><span class="l">Estado</span><span class="v">${escape(statusLabel(r.status))}</span></div>
    ${photosHtml?`<div class="photos">${photosHtml}</div>`:''}

    <h2>Servicio</h2>
    <div class="row"><span class="l">Falla reportada</span><span class="v">${escape(r.issue||'—')}</span></div>
    ${r.notes?`<div class="row"><span class="l">Notas</span><span class="v">${escape(r.notes)}</span></div>`:''}
    <div class="row"><span class="l">Ingreso</span><span class="v">${fmtDate(r.createdAt)}</span></div>
    ${r.dueDate?`<div class="row"><span class="l">Entrega prevista</span><span class="v">${fmtDate(r.dueDate)}</span></div>`:''}

    ${total!=null?`
    <div class="totals">
      <div class="row"><span class="l">Precio</span><span class="v">$ ${total.toFixed(2)}</span></div>
      <div class="row"><span class="l">Anticipo</span><span class="v">$ ${dep.toFixed(2)}</span></div>
      <div class="row total"><span class="l">Saldo a pagar</span><span class="v">$ ${saldo.toFixed(2)}</span></div>
    </div>`:''}

    <div class="signs">
      <div class="box">Firma del técnico</div>
      <div class="box">Firma del cliente</div>
    </div>

    <p class="legal">Conserve este comprobante. Es el único documento válido para reclamar su equipo.<br>
    Identificador único: <b>${escape(r.id)}</b> · Generado: ${fmtDateTime(Date.now())}</p>
  </div>

  <div class="actions">
    <button onclick="window.print()" class="primary">Imprimir</button>
    <button onclick="window.close()">Cerrar</button>
  </div>
</body></html>`;
    const w = window.open('', '_blank', 'width=720,height=900');
    if(!w){ UI.toast('Habilita ventanas emergentes para ver el ticket'); return; }
    w.document.write(html);
    w.document.close();
  }

  // ============= BUSCAR =============
  function search(){
    const sortKey = Views._searchSort || 'recent';
    view().innerHTML = `
      <div class="search-bar">${ICONS.search}
        <input id="searchInput" placeholder="Buscar cliente, equipo, teléfono o ID..." autofocus>
      </div>
      ${sortSelectHtml('searchSort', sortKey)}
      <div id="searchResults"></div>`;
    const input = document.getElementById('searchInput');
    const results = document.getElementById('searchResults');
    const sortSel = document.getElementById('searchSort');
    function render(q){
      const list = applySort(DB.search(q), Views._searchSort||'recent');
      results.innerHTML = list.length ? list.map(repairCard).join('') : emptyState('Sin resultados','Prueba con otro término');
      results.querySelectorAll('.repair-card').forEach(c=>c.addEventListener('click',e=>{
        if(e.target.closest('[data-stop]')) return;
        showRepair(c.dataset.id);
      }));
      results.querySelectorAll('[data-pick-phone]').forEach(b=>{
        b.addEventListener('click', e=>{ e.preventDefault(); e.stopPropagation(); openPhonePicker(b.dataset.pickPhone); });
      });
    }
    render('');
    input.addEventListener('input', e=>render(e.target.value));
    sortSel.addEventListener('change', e=>{ Views._searchSort = e.target.value; render(input.value); });
  }


  // ============= ADMIN =============
  function admin(){
    const s = DB.settings;
    const g = s.github;
    const c = s.creator || {phone:'',whatsapp:''};
    const hasLocal = typeof LocalFile !== 'undefined' && LocalFile.hasHandle();
    const localSupported = typeof LocalFile !== 'undefined' && LocalFile.isSupported();

    const menuItems = [
      {id:'adm-name',    t:'Nombre',          s:'Marca del sistema',      i:ICONS.edit},
      {id:'adm-logo',    t:'Logo',            s:'Imagen o ícono',         i:ICONS.camera},
      {id:'adm-creator', t:'Creador',         s:'Contactos en cabecera',  i:ICONS.phone},
      {id:'adm-pass',    t:'Contraseña',      s:'Acceso y seguridad',     i:ICONS.save},
      {id:'adm-recover', t:'Recuperación',    s:'Preguntas de seguridad', i:ICONS.search},
      {id:'adm-gh',      t:'GitHub',          s:'Respaldo en la nube',    i:ICONS.cloud},
      {id:'adm-local',   t:'Archivo local',   s:'Guardado en disco',      i:ICONS.save},
      {id:'adm-backup',  t:'Copia manual',    s:'Exportar / importar',    i:ICONS.upload},
      {id:'adm-devices', t:'Equipos',         s:'Catálogo de equipos',    i:ICONS.box},
      {id:'adm-products',t:'Productos',       s:'Piezas y artículos',     i:ICONS.box},
      {id:'adm-warranty',t:'Garantía',        s:'Días por defecto',       i:ICONS.check},
      {id:'adm-stats',   t:'Estadísticas',    s:'Ganancia · inversión',   i:ICONS.edit},
      {id:'adm-audit',   t:'Auditoría',       s:'Comprobar todo',         i:ICONS.cloud}
    ];
    const menuHtml = `
      <div class="admin-menu">
        ${menuItems.map(m=>`<button class="adm-tile" data-jump="${m.id}" type="button">
          <span class="adm-ico">${m.i}</span>
          <span class="adm-t">${escape(m.t)}</span>
          <span class="adm-s">${escape(m.s)}</span>
        </button>`).join('')}
      </div>`;

    view().innerHTML = `
      <h2 style="margin:0 0 10px;font-size:20px">Administración</h2>
      <p class="muted small" style="margin:0 0 14px">Toca un módulo para ir directo a esa configuración.</p>
      ${menuHtml}

      <div class="admin-card" id="adm-name">
        <h3>Nombre del sistema</h3>
        <p>La segunda palabra se mostrará en el color principal automáticamente.</p>
        <input id="appNameInput" class="input-pill" value="${escape(s.appName)}">
      </div>

      <div class="admin-card" id="adm-logo">
        <h3>Logo del sistema</h3>
        <p>Sube una imagen (PNG/JPG/SVG). Se mostrará en el inicio de sesión y en la cabecera. Si no eliges ninguna se usa el logo por defecto.</p>
        <div class="logo-upload">
          <div class="logo-preview" id="logoPreview">${s.logo?`<img src="${s.logo}">`:((App.getPresets&&App.getPresets().find(x=>x.key===(s.logoPreset||'tools')))||{svg:''}).svg}</div>
          <div class="logo-actions">
            <label class="btn-secondary btn-iconlbl">
              ${ICONS.upload}<span>Elegir imagen</span>
              <input type="file" id="logoFile" accept="image/*" hidden>
            </label>
            <button class="btn-secondary btn-iconlbl" id="logoReset">${ICONS.trash}<span>Restaurar por defecto</span></button>
          </div>
        </div>
        <p class="muted small" style="margin:14px 0 6px">O elige un icono por defecto:</p>
        <div class="preset-grid">
          ${(App.getPresets?App.getPresets():[]).map(p=>`
            <button type="button" class="preset-tile ${(!s.logo && (s.logoPreset||'tools')===p.key)?'active':''}" data-preset="${escape(p.key)}" title="${escape(p.name)}">
              <div class="preset-thumb">${p.svg}</div>
              <span>${escape(p.name)}</span>
            </button>`).join('')}
        </div>
      </div>


      <div class="admin-card" id="adm-creator">
        <h3>Datos del creador (opcional)</h3>
        <p>Se muestran como botones en la cabecera para llamar o enviar WhatsApp.</p>
        <div class="form-row">
          <div class="form-group">
            <label>Teléfono</label>
            <input id="creatorPhone" type="tel" inputmode="tel" placeholder="+53 5555 5555" value="${escape(c.phone||'')}">
          </div>
          <div class="form-group">
            <label>WhatsApp</label>
            <input id="creatorWa" type="tel" inputmode="tel" placeholder="+5355555555" value="${escape(c.whatsapp||'')}">
          </div>
        </div>
      </div>

      <div class="admin-card" id="adm-pass">
        <div class="row-between">
          <div style="flex:1;min-width:0"><h3>Pedir contraseña al entrar</h3><p>Si está apagado, no pedirá contraseña</p></div>
          <label class="switch"><input type="checkbox" id="reqPass" ${s.requirePassword?'checked':''}><span class="slider"></span></label>
        </div>
        <hr style="border:0;border-top:1px solid var(--border);margin:14px 0">
        <h3>Cambiar contraseña</h3>
        <p>Define una nueva contraseña de acceso</p>
        <div class="form-group"><input type="password" id="newPass" placeholder="Nueva contraseña"></div>
        <button class="btn-secondary" id="savePassBtn">Actualizar contraseña</button>
      </div>

      <div class="admin-card" id="adm-recover">
        <h3>Preguntas de seguridad</h3>
        <p>Configura preguntas personales (mascota, hobby preferido, ciudad de nacimiento, etc.). Te permitirán recuperar tu contraseña si la olvidas.</p>
        <div id="sqList" class="sq-list"></div>
        <button class="btn-secondary btn-inline" id="addSqBtn" style="margin-top:6px">${ICONS.plus} Añadir pregunta</button>
        <button class="btn-primary" id="saveSqBtn" style="margin-top:10px">Guardar preguntas</button>
        <p class="muted small" style="margin-top:8px">Recomendado: configura al menos 2 preguntas. Las respuestas no distinguen mayúsculas ni acentos.</p>
      </div>

      <div class="admin-card" id="adm-gh">
        <div class="row-between" style="margin-bottom:8px">
          <h3 style="margin:0">${ICONS.cloud} Sincronización GitHub</h3>
          <label class="switch"><input type="checkbox" id="ghEnabled" ${g.enabled?'checked':''}><span class="slider"></span></label>
        </div>
        <p>Cada reparación se guarda en su <b>propio archivo</b> dentro del repositorio (<code>repairs/Rxxxx.json</code>), con sus fotos, audio y texto aislados — nunca se mezcla con otras. Los ajustes y transacciones viajan en <code>index.json</code>.</p>
        <div class="form-row">
          <div class="form-group"><label>Usuario / org</label><input id="ghUser" value="${escape(g.user)}" placeholder="tu-usuario"></div>
          <div class="form-group"><label>Repositorio</label><input id="ghRepo" value="${escape(g.repo)}" placeholder="taller-datos"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Rama</label><input id="ghBranch" value="${escape(g.branch||'main')}" placeholder="main"></div>
          <div class="form-group"><label>Carpeta base</label><input id="ghPath" value="${escape(g.path||'taller-data')}" placeholder="taller-data"></div>
        </div>
        <div class="form-group"><label>Token (Fine-grained · Contents: read/write)</label><input id="ghToken" type="password" value="${escape(g.token||'')}" placeholder="github_pat_..."></div>
        <div class="form-group">
          <label class="inline-check"><input type="checkbox" id="ghAuto" ${g.autoSync?'checked':''}> Sincronización automática al guardar</label>
        </div>

        <div class="gh-panel" id="ghPanel">
          <div class="gh-head">
            <span class="gh-dot"></span>
            <span class="gh-status" id="ghStatusText">Listo</span>
          </div>
          <div class="gh-actions">
            <button class="btn-secondary" id="ghTest">${ICONS.check||''} Probar conexión</button>
            <button class="btn-secondary" id="ghPull">${ICONS.cloud} Bajar todo</button>
            <button class="btn-primary"   id="ghPush" style="grid-column:1/-1">${ICONS.save||''} Subir / sincronizar todo</button>
          </div>
          <div class="gh-progress" id="ghProgress"><i></i></div>
          <div class="gh-meta" id="ghMeta">
            <span class="pill">Repo<b id="mRepo">—</b></span>
            <span class="pill">Rama<b id="mBranch">—</b></span>
            <span class="pill">Base<b id="mBase">—</b></span>
            <span class="pill">Última sync<b id="mLast">${g.lastSyncAt?fmtDateTime(g.lastSyncAt):'nunca'}</b></span>
          </div>
          <div class="gh-log-actions">
            <button id="ghLogClear">Limpiar registro</button>
          </div>
          <div class="gh-log" id="ghLog" aria-live="polite"></div>
        </div>
      </div>

      ${typeof LocalFile !== 'undefined' ? `
      <div class="admin-card" id="adm-local">
        <h3>${ICONS.save} Guardar JSON en una ubicación</h3>
        <p>Elige un archivo local. Las fotos y audios viajan dentro del JSON — al mover ese archivo nunca pierdes información.</p>
        ${localSupported ? `
          <div class="btn-row">
            <button class="btn-secondary" id="pickLoc">${hasLocal?'Cambiar ubicación':'Elegir ubicación'}</button>
            <button class="btn-secondary" id="clearLoc" ${hasLocal?'':'disabled'}>Quitar ubicación</button>
          </div>
          <button class="btn-secondary" id="loadFromLoc" ${hasLocal?'':'disabled'} style="margin-top:8px">Cargar desde el archivo</button>
          <p class="muted small" style="margin-top:8px">Estado: ${hasLocal?'<b>Ubicación configurada</b>':'sin configurar'}</p>
        ` : `<p class="muted small">Tu navegador no soporta elegir ubicación. Usa "Exportar JSON" en su lugar.</p>`}
      </div>` : ''}

      <div class="admin-card" id="adm-backup">
        <h3>Copia local (manual)</h3>
        <p>Exporta o importa el JSON manualmente. Contiene fotos + audios embebidos.</p>
        <div class="btn-row">
          <button class="btn-secondary" id="exportBtn">Exportar JSON</button>
          <button class="btn-secondary" id="importBtn">Importar JSON</button>
        </div>
        <input type="file" id="importFile" accept="application/json" style="display:none">
      </div>

      <div class="admin-card" id="adm-devices">
        <h3>Equipos disponibles</h3>
        <p>Aparecen como sugerencias al registrar una reparación</p>
        <div class="chip-list" id="deviceTypes">
          ${s.deviceTypes.map(d=>`<span class="chip-static">${escape(d)} <button data-rm-dev="${escape(d)}">×</button></span>`).join('')}
        </div>
        <div class="form-row" style="margin-top:10px">
          <div class="form-group" style="margin:0"><input id="newDeviceType" placeholder="Nuevo equipo (ej. Soundbar)"></div>
          <div class="form-group" style="margin:0"><button class="btn-secondary" id="addDeviceBtn">Añadir</button></div>
        </div>
      </div>

      <div class="admin-card" id="adm-products">
        <h3>Productos para ventas y compras</h3>
        <p>Aparecen como sugerencias al registrar un movimiento</p>
        <div class="chip-list" id="productTypes">
          ${(s.productTypes||[]).map(d=>`<span class="chip-static">${escape(d)} <button data-rm-prod="${escape(d)}">×</button></span>`).join('')}
        </div>
        <div class="form-row" style="margin-top:10px">
          <div class="form-group" style="margin:0"><input id="newProductType" placeholder="Nuevo producto (ej. Cable HDMI)"></div>
          <div class="form-group" style="margin:0"><button class="btn-secondary" id="addProductBtn">Añadir</button></div>
        </div>
      </div>

      <div class="admin-card" id="adm-warranty">
        <h3>Garantía por defecto</h3>
        <p>Días que se rellenarán automáticamente al crear una reparación nueva.</p>
        <input id="defWarranty" type="number" min="0" step="1" inputmode="numeric" class="input-pill" value="${s.defaultWarrantyDays!=null?s.defaultWarrantyDays:30}">
      </div>

      <div class="admin-card" id="adm-stats">
        <h3>Estadísticas</h3>
        <p>Las estadísticas de <b>ganancia</b>, <b>ingresos</b>, <b>servicios</b> y <b>costos</b> se muestran ahora en la sección <b>Resumen</b>. La gestión de compras, ventas, stock y alertas vive en <b>Compra/Venta</b>.</p>
        <div class="btn-row">
          <button class="btn-secondary" id="goSummaryBtn">Ir a Resumen</button>
          <button class="btn-secondary" id="goStatsBtn">Ir a Compra/Venta</button>
        </div>
      </div>

      <div class="admin-card audit-card" id="adm-audit">
        <h3>Auditoría del sistema</h3>
        <p>Recalcula <b>todo</b> el sistema desde cero: compras, ventas, reparaciones, piezas y stock — y te avisa si algo no cuadra. Se ejecuta también automáticamente cada vez que entras.</p>
        <button class="btn-primary btn-audit" id="runAuditBtn" type="button">
          <span class="audit-ico">${ICONS.check}</span>
          <span>Calcular todo el sistema</span>
        </button>
        <p class="muted small" style="margin-top:10px">Comprueba: cuentas de ventas y compras, ganancia, piezas usadas, stock disponible, reparaciones entregadas sin precio, fechas inválidas y más.</p>
      </div>
    `;

    // Menú elegante: scroll suave a cada sección
    view().querySelectorAll('[data-jump]').forEach(b=>{
      b.onclick = ()=>{
        const el = document.getElementById(b.dataset.jump);
        if(!el) return;
        el.scrollIntoView({behavior:'smooth', block:'start'});
        el.classList.add('flash');
        setTimeout(()=>el.classList.remove('flash'), 1500);
      };
    });

    // === Preguntas de seguridad ===
    const sq = (s.securityQuestions||[]).map(x=>({ q:x.q||'', aHash:x.aHash||null, a:'' }));
    if(!sq.length) sq.push({q:'',a:'',aHash:null});
    const SQ_PRESETS = ['¿Nombre de tu primera mascota?','¿Cuál es tu hobby preferido?','¿Ciudad donde naciste?','¿Mejor amigo de la infancia?','¿Comida favorita?','¿Nombre de tu madre?','¿Modelo de tu primer teléfono?','¿Película favorita?'];
    function renderSq(){
      const wrap = document.getElementById('sqList'); if(!wrap) return;
      const dlOpts = SQ_PRESETS.map(p=>`<option value="${escape(p)}">`).join('');
      wrap.innerHTML = sq.map((it,i)=>`
        <div class="sq-row" data-si="${i}">
          <input class="sq-q" list="sqPresets" placeholder="Pregunta" value="${escape(it.q||'')}" data-sf="q" data-si="${i}">
          <input class="sq-a" type="text" placeholder="${it.aHash?'(respuesta guardada — escribe para cambiar)':'Respuesta'}" data-sf="a" data-si="${i}">
          ${sq.length>1?`<button type="button" class="icon-btn-sm" data-rm-sq="${i}" aria-label="Quitar">${ICONS.trash}</button>`:''}
        </div>
      `).join('') + `<datalist id="sqPresets">${dlOpts}</datalist>`;
      wrap.querySelectorAll('input[data-si]').forEach(inp=>{
        inp.addEventListener('input', e=>{
          const i = +inp.dataset.si; const f = inp.dataset.sf;
          sq[i][f] = inp.value;
        });
      });
      wrap.querySelectorAll('[data-rm-sq]').forEach(b=>{
        b.onclick = ()=>{ sq.splice(+b.dataset.rmSq,1); if(!sq.length) sq.push({q:'',a:'',aHash:null}); renderSq(); };
      });
    }
    renderSq();
    document.getElementById('addSqBtn').onclick = ()=>{ sq.push({q:'',a:'',aHash:null}); renderSq(); };
    document.getElementById('saveSqBtn').onclick = async ()=>{
      const out = [];
      for(const it of sq){
        const q = (it.q||'').trim(); if(!q) continue;
        let aHash = it.aHash;
        if((it.a||'').trim()){ aHash = await DB.hashAnswer(it.a); }
        if(!aHash) continue;
        out.push({ q, aHash });
      }
      if(!out.length){ UI.toast('Añade al menos una pregunta con respuesta'); return; }
      DB.setSecurityQuestions(out);
      UI.toast('Preguntas guardadas');
      admin();
    };

    const gs = document.getElementById('goStatsBtn');
    if(gs) gs.onclick = ()=> App.go('sales');
    const gsm = document.getElementById('goSummaryBtn');
    if(gsm) gsm.onclick = ()=> App.go('summary');
    const auditBtn = document.getElementById('runAuditBtn');
    if(auditBtn) auditBtn.onclick = ()=> Views.openAudit();




    document.getElementById('appNameInput').addEventListener('change', e=>{
      DB.updateSettings({ appName: e.target.value.trim() || 'Taller' });
      App.applyBrand();
      UI.toast('Nombre actualizado');
    });

    // Logo
    document.getElementById('logoFile').addEventListener('change', async e=>{
      const f = e.target.files[0]; if(!f) return;
      try{
        // Resize a 256px máx, calidad alta — el logo queda pequeño y nítido
        const dataUrl = await UI.resizeImage(f, 256, 0.92);
        DB.updateSettings({ logo: dataUrl });
        App.applyBrand();
        admin(); // re-render para actualizar preview y botón
        UI.toast('Logo actualizado');
      }catch(err){ UI.toast('No se pudo procesar la imagen'); }
    });
    document.getElementById('logoReset').addEventListener('click', async ()=>{
      const ok = await UI.confirmDialog({
        title:'Restaurar logo',
        message:'¿Volver al logo por defecto del sistema?',
        okText:'Restaurar', cancelText:'Cancelar'
      });
      if(!ok) return;
      DB.updateSettings({ logo: null, logoPreset: 'tools' });
      App.applyBrand(); admin(); UI.toast('Logo restaurado');
    });
    document.querySelectorAll('[data-preset]').forEach(b=>{
      b.onclick = ()=>{
        DB.updateSettings({ logo: null, logoPreset: b.dataset.preset });
        App.applyBrand(); admin(); UI.toast('Logo actualizado');
      };
    });
    function saveCreator(){
      DB.updateCreator({
        phone: document.getElementById('creatorPhone').value.trim(),
        whatsapp: document.getElementById('creatorWa').value.trim()
      });
      App.applyBrand();
    }
    document.getElementById('creatorPhone').addEventListener('change', saveCreator);
    document.getElementById('creatorWa').addEventListener('change', saveCreator);

    document.getElementById('reqPass').addEventListener('change', e=>{
      DB.updateSettings({ requirePassword: e.target.checked });
      UI.toast(e.target.checked?'Contraseña activada':'Contraseña desactivada');
    });
    document.getElementById('savePassBtn').addEventListener('click', async ()=>{
      const v = document.getElementById('newPass').value;
      if(v.length<3) return UI.toast('Mínimo 3 caracteres');
      await Auth.setPassword(v);
      document.getElementById('newPass').value = '';
      UI.toast('Contraseña actualizada');
    });

    function readGh(){
      return {
        enabled: document.getElementById('ghEnabled').checked,
        user: document.getElementById('ghUser').value.trim(),
        repo: document.getElementById('ghRepo').value.trim(),
        branch: document.getElementById('ghBranch').value.trim() || 'main',
        path: document.getElementById('ghPath').value.trim() || 'taller-data.json',
        token: document.getElementById('ghToken').value.trim(),
        autoSync: document.getElementById('ghAuto').checked
      };
    }
    ['ghEnabled','ghUser','ghRepo','ghBranch','ghPath','ghToken','ghAuto'].forEach(id=>{
      document.getElementById(id).addEventListener('change', ()=> DB.updateGithub(readGh()));
    });
    // ===== Panel moderno: log en vivo, progreso, estado =====
    const panel = document.getElementById('ghPanel');
    const logEl = document.getElementById('ghLog');
    const statusEl = document.getElementById('ghStatusText');
    const progressEl = document.getElementById('ghProgress');
    const progressBar = progressEl ? progressEl.querySelector('i') : null;
    const mRepo = document.getElementById('mRepo');
    const mBranch = document.getElementById('mBranch');
    const mBase = document.getElementById('mBase');
    const mLast = document.getElementById('mLast');
    function updateMeta(){
      const gg = DB.settings.github;
      mRepo.textContent = (gg.user && gg.repo) ? `${gg.user}/${gg.repo}` : '—';
      mBranch.textContent = gg.branch || 'main';
      mBase.textContent = GitSync.basePath();
      mLast.textContent = gg.lastSyncAt ? fmtDateTime(gg.lastSyncAt) : 'nunca';
    }
    updateMeta();
    function setStatus(level, txt){
      panel.classList.remove('gh-on','gh-err','gh-busy');
      if(level) panel.classList.add('gh-'+level);
      if(txt) statusEl.textContent = txt;
    }
    function setProgress(done,total){
      if(!progressEl) return;
      if(!total){ progressEl.classList.remove('on'); progressBar.style.width='0%'; return; }
      progressEl.classList.add('on');
      const pct = Math.min(100, Math.round(done*100/total));
      progressBar.style.width = pct+'%';
      if(done>=total) setTimeout(()=>{ progressEl.classList.remove('on'); progressBar.style.width='0%'; }, 700);
    }
    function fmtTime(ms){
      const d = new Date(ms);
      return d.toLocaleTimeString('es-ES',{hour12:false}) + '.' + String(d.getMilliseconds()).padStart(3,'0').slice(0,3);
    }
    function renderLog(entries){
      const html = entries.slice(-200).map(e =>
        `<div class="gh-line lv-${e.level}"><span class="gh-t">${fmtTime(e.t)}</span><span class="gh-tag">${escape(e.tag)}</span><span class="gh-msg">${escape(e.msg)}</span></div>`
      ).join('');
      logEl.innerHTML = html;
      logEl.scrollTop = logEl.scrollHeight;
    }
    const unsubLog = GitLog.subscribe(renderLog);
    // Cancela una suscripción previa para evitar fugas al re-renderizar admin
    if(window.__ghUnsub) try{ window.__ghUnsub(); }catch(_){}
    window.__ghUnsub = unsubLog;
    document.getElementById('ghLogClear').onclick = ()=> GitLog.clear();

    async function runOp(name, fn){
      setStatus('busy', name+'…');
      try{
        const res = await fn();
        setStatus('on', name+' OK');
        UI.toast(name+' completada');
        updateMeta();
        return res;
      }catch(e){
        GitLog.err('error', e.message);
        setStatus('err', 'Error: '+e.message);
        UI.toast('Error: '+e.message);
      }
    }

    document.getElementById('ghTest').onclick = ()=>{
      DB.updateGithub(readGh());
      runOp('Conexión', ()=> GitSync.test());
    };
    document.getElementById('ghPush').onclick = ()=>{
      DB.updateGithub(readGh());
      runOp('Subida', ()=> GitSync.push({ onProgress:setProgress }));
    };
    document.getElementById('ghPull').onclick = async ()=>{
      DB.updateGithub(readGh());
      if(!confirm('Esto reemplazará tus reparaciones locales con las del repositorio. ¿Continuar?')) return;
      runOp('Descarga', ()=> GitSync.pull({ onProgress:setProgress }));
    };

    if(typeof LocalFile !== 'undefined' && localSupported){
      const pl = document.getElementById('pickLoc');
      if(pl) pl.onclick = async ()=>{
        try{ await LocalFile.pickLocation(); UI.toast('Ubicación guardada'); App.refresh(); }
        catch(e){ if(e.name!=='AbortError') UI.toast('Error: '+e.message); }
      };
      const clr = document.getElementById('clearLoc');
      if(clr) clr.onclick = async ()=>{ await LocalFile.clearHandle(); UI.toast('Ubicación quitada'); App.refresh(); };
      const lf = document.getElementById('loadFromLoc');
      if(lf) lf.onclick = async ()=>{
        if(!confirm('Reemplazar datos locales con los del archivo elegido?')) return;
        try{ const ok = await LocalFile.loadFromFile(); UI.toast(ok?'Cargado':'No se pudo cargar'); App.refresh(); }
        catch(e){ UI.toast('Error: '+e.message); }
      };
    }

    document.getElementById('exportBtn').onclick = ()=>{ DB.exportJson(); UI.toast('Descargado'); };
    document.getElementById('importBtn').onclick = ()=> document.getElementById('importFile').click();
    document.getElementById('importFile').onchange = e=>{
      const f = e.target.files[0]; if(!f) return;
      if(!confirm('Esto reemplazará todos los datos. ¿Continuar?')) return;
      const reader = new FileReader();
      reader.onload = ev=>{
        if(DB.importJson(ev.target.result)){ UI.toast('Importado'); App.refresh(); }
        else UI.toast('Archivo inválido');
      };
      reader.readAsText(f);
    };

    document.getElementById('addDeviceBtn').onclick = ()=>{
      const v = document.getElementById('newDeviceType').value;
      if(DB.addDeviceType(v)){ UI.toast('Equipo añadido'); admin(); }
      else UI.toast('Vacío o duplicado');
    };
    document.querySelectorAll('[data-rm-dev]').forEach(b=>{
      b.onclick = ()=>{ DB.removeDeviceType(b.dataset.rmDev); admin(); };
    });

    document.getElementById('addProductBtn').onclick = ()=>{
      const v = document.getElementById('newProductType').value;
      if(DB.addProductType(v)){
        document.getElementById('newProductType').value = '';
        UI.toast('Producto añadido'); admin();
      } else UI.toast('Vacío o duplicado');
    };
    document.querySelectorAll('[data-rm-prod]').forEach(b=>{
      b.onclick = ()=>{ DB.removeProductType(b.dataset.rmProd); admin(); };
    });
    document.getElementById('defWarranty').addEventListener('change', e=>{
      const v = Math.max(0, parseInt(e.target.value,10)||0);
      DB.updateSettings({ defaultWarrantyDays: v });
      UI.toast('Garantía por defecto actualizada');
    });
  }

  // ============= VENTAS Y COMPRAS =============
  const TX_FILTERS = [
    {k:'all', label:'Todo'},
    {k:'sale', label:'Ventas'},
    {k:'purchase', label:'Compras'}
  ];
  function txLabel(t){ return t==='sale' ? 'Venta' : 'Compra'; }

  // Calcula estadísticas combinadas (ventas + compras + reparaciones + piezas) por periodo.
  function computeAllStats(){
    const now = new Date();
    const t0 = new Date(now); t0.setHours(0,0,0,0);
    const wd = (t0.getDay()+6)%7;
    const w0 = new Date(t0); w0.setDate(w0.getDate()-wd);
    const m0 = new Date(t0.getFullYear(), t0.getMonth(), 1);
    const y0 = new Date(t0.getFullYear(), 0, 1);

    const empty = ()=>({
      salesIncome:0, salesCost:0,        // ventas y su costo de mercancía
      purchases:0,                        // inversión en compras de stock
      repairIncome:0, repairPartsCost:0,  // reparaciones entregadas y costo de piezas usadas
      countSales:0, countPurchases:0, countRepairs:0,
      pendingRepair:0                     // por cobrar (no entregadas)
    });
    const buckets = { day:empty(), week:empty(), month:empty(), year:empty(), total:empty() };
    function inAll(ts, fn){
      fn(buckets.total);
      if(ts>=y0.getTime()) fn(buckets.year);
      if(ts>=m0.getTime()) fn(buckets.month);
      if(ts>=w0.getTime()) fn(buckets.week);
      if(ts>=t0.getTime()) fn(buckets.day);
    }
    for(const tx of DB.transactions){
      const ts = tx.date || tx.createdAt || 0;
      const total = Number(tx.total||0);
      if(tx.type==='sale'){
        const cost = Number(tx.costTotal||0);
        inAll(ts, b=>{ b.salesIncome+=total; b.salesCost+=cost; b.countSales++; });
      } else {
        inAll(ts, b=>{ b.purchases+=total; b.countPurchases++; });
      }
    }
    for(const r of DB.repairs){
      const price = Number(r.price||0);
      const partsCost = (r.parts||[]).reduce((a,p)=> a + Number(p.unitCost||0)*Number(p.qty||0), 0);
      if(r.status==='delivered'){
        const ts = r.deliveredAt || r.updatedAt || r.createdAt || 0;
        inAll(ts, b=>{ b.repairIncome+=price; b.repairPartsCost+=partsCost; b.countRepairs++; });
      } else if(r.status!=='cancelled' && price>0){
        const dep = Number(r.deposit||0);
        buckets.total.pendingRepair += Math.max(0, price - dep);
      }
    }
    // Derivados
    for(const k in buckets){
      const b = buckets[k];
      b.salesProfit = b.salesIncome - b.salesCost;
      b.repairProfit = b.repairIncome - b.repairPartsCost;
      b.totalProfit = b.salesProfit + b.repairProfit;
      b.totalIncome = b.salesIncome + b.repairIncome;
      b.totalInvested = b.salesCost + b.repairPartsCost; // dinero realmente convertido en ingresos
    }
    return buckets;
  }

  function computeRepairStats(){
    const a = computeAllStats();
    return {
      dT:a.day.repairIncome, wT:a.week.repairIncome, mT:a.month.repairIncome, yT:a.year.repairIncome,
      total:a.total.repairIncome, pending:a.total.pendingRepair, countDel:a.total.countRepairs
    };
  }
  function totalProfitNow(){
    try { return computeAllStats().total.totalProfit || 0; } catch(e){ return 0; }
  }

  function txCard(t){
    const isSale = t.type==='sale';
    const sign = isSale ? '+' : '-';
    const cls = isSale ? 'sale' : 'purchase';
    const qty = Number(t.quantity||0);
    const unit = Number(t.unitPrice||0);
    const total = Number(t.total||0);
    const cp = t.counterparty ? ` · ${escape(t.counterparty)}` : '';
    let profitHtml = '';
    if(isSale && t.costTotal != null){
      const profit = total - Number(t.costTotal||0);
      const pcls = profit>=0 ? 'pos' : 'neg';
      profitHtml = `<span class="tx-profit ${pcls}">Ganancia de esta venta: $ ${profit.toFixed(2)}</span>`;
    } else if(isSale){
      profitHtml = `<span class="tx-profit muted">Ganancia de esta venta: sin costo registrado</span>`;
    } else {
      profitHtml = `<span class="tx-profit neg">Inversión de esta compra: $ ${total.toFixed(2)}</span>`;
    }
    return `
      <div class="tx-card ${cls}" data-tx-id="${escape(t.id)}">
        <div class="tx-info">
          <div class="tx-head">
            <span class="tx-badge ${cls}">${txLabel(t.type)}</span>
            <span class="tx-id">${escape(t.id)}</span>
          </div>
          <h3>${escape(t.product||'Producto')}</h3>
          <p class="muted small">${qty} × $ ${unit.toFixed(2)}${cp}</p>
          <p class="muted small">${fmtDate(t.date||t.createdAt)}</p>
          <p class="small" style="margin-top:2px">${profitHtml}</p>
        </div>
        <div class="tx-amount ${cls}">${sign} $ ${total.toFixed(2)}</div>
      </div>`;
  }

  function bindTxCards(){
    view().querySelectorAll('.tx-card').forEach(c=>{
      c.addEventListener('click', ()=> showTransaction(c.dataset.txId));
    });
  }

  // Accordion ligero — clickea cabecera para abrir/cerrar
  function bindAccordions(root){
    (root||view()).querySelectorAll('[data-acc]').forEach(head=>{
      head.addEventListener('click', ()=>{
        const card = head.closest('.acc-card');
        if(!card) return;
        card.classList.toggle('open');
      });
    });
  }

  function fmtMoney(v){ return '$ '+Number(v||0).toFixed(2); }

  // Etiquetas con descripción humana del rango temporal
  function periodInfo(){
    const now = new Date();
    const t0 = new Date(now); t0.setHours(0,0,0,0);
    const wd = (t0.getDay()+6)%7;
    const w0 = new Date(t0); w0.setDate(w0.getDate()-wd);
    const m0 = new Date(t0.getFullYear(), t0.getMonth(), 1);
    const y0 = new Date(t0.getFullYear(), 0, 1);
    const fd = d => d.toLocaleDateString('es-ES',{day:'2-digit',month:'short'});
    return {
      day:   `Solo el día de hoy (${fd(t0)})`,
      week:  `Desde el lunes ${fd(w0)} hasta hoy`,
      month: `Desde el día 1 (${fd(m0)}) hasta hoy`,
      year:  `Desde el 1 de enero (${fd(y0)}) hasta hoy`,
      total: 'Suma de todo lo registrado, sin límite de fecha'
    };
  }

  function sysStatsTilesHtml(){
    const s = computeRepairStats();
    const p = periodInfo();
    return `
      <p class="muted small" style="margin:0 0 10px">
        Dinero que has <b>cobrado</b> por reparaciones <b>entregadas</b>.
        Solo cuenta cuando marcas el equipo como <b>Entregado</b>.
      </p>
      <div class="earn-grid">
        <div class="earn-tile" title="${escape(p.day)}"><span class="el">Hoy</span><span class="ev">${fmtMoney(s.dT)}</span><span class="er">${escape(p.day)}</span></div>
        <div class="earn-tile" title="${escape(p.week)}"><span class="el">Esta semana</span><span class="ev">${fmtMoney(s.wT)}</span><span class="er">${escape(p.week)}</span></div>
        <div class="earn-tile" title="${escape(p.month)}"><span class="el">Este mes</span><span class="ev">${fmtMoney(s.mT)}</span><span class="er">${escape(p.month)}</span></div>
        <div class="earn-tile" title="${escape(p.year)}"><span class="el">Este año</span><span class="ev">${fmtMoney(s.yT)}</span><span class="er">${escape(p.year)}</span></div>
        <div class="earn-tile gold" title="${escape(p.total)}"><span class="el">Total cobrado</span><span class="ev">${fmtMoney(s.total)}</span><span class="er">${escape(p.total)}</span></div>
        <div class="earn-tile pending" title="Reparaciones aún no entregadas con precio definido"><span class="el">Pendiente de cobrar</span><span class="ev">${fmtMoney(s.pending)}</span><span class="er">Reparaciones aún sin entregar</span></div>
      </div>
      <p class="muted small" style="margin-top:12px">Reparaciones entregadas: <b>${s.countDel}</b> · Total registradas: <b>${DB.repairs.length}</b></p>`;
  }

  function cvStatsTilesHtml(){
    const stats = computeAllStats();
    const p = periodInfo();
    function tile(label, b, rangeHelp, accent){
      const pcls = b.totalProfit>=0 ? 'pos' : 'neg';
      const movs = b.countSales+b.countPurchases+b.countRepairs;
      return `<div class="cv-tile ${accent||''}">
        <div class="cv-tile-head">
          <span class="cv-tile-label">${escape(label)}</span>
          <span class="cv-tile-profit ${pcls}" title="Ganancia neta: lo que entró menos lo que costó">${fmtMoney(b.totalProfit)}</span>
        </div>
        <p class="cv-range">${escape(rangeHelp)}</p>
        <div class="cv-tile-grid">
          <div class="cv-mini sale" title="Dinero recibido por ventas de productos"><span>Ventas (entró)</span><b>${fmtMoney(b.salesIncome)}</b></div>
          <div class="cv-mini repair" title="Dinero cobrado por reparaciones entregadas"><span>Servicios (entró)</span><b>${fmtMoney(b.repairIncome)}</b></div>
          <div class="cv-mini cost" title="Cuánto te costó a ti la mercancía que vendiste"><span>Costo mercancía</span><b>${fmtMoney(b.salesCost)}</b></div>
          <div class="cv-mini cost" title="Cuánto costaron las piezas usadas en reparaciones"><span>Piezas usadas</span><b>${fmtMoney(b.repairPartsCost)}</b></div>
          <div class="cv-mini buy" title="Dinero gastado en compras de stock"><span>Compras stock</span><b>${fmtMoney(b.purchases)}</b></div>
          <div class="cv-mini count" title="Número de operaciones registradas en el periodo"><span>Movimientos</span><b>${movs}</b></div>
        </div>
      </div>`;
    }
    return `
      <p class="muted small" style="margin:0 0 10px">
        Resumen del dinero que entró, lo que te costó y la <b>ganancia neta</b> en cada periodo.
        Cada bloque te dice exactamente desde qué fecha cuenta.
      </p>
      <div class="cv-grid">
        ${tile('Hoy', stats.day, p.day)}
        ${tile('Esta semana', stats.week, p.week)}
        ${tile('Este mes', stats.month, p.month)}
        ${tile('Este año', stats.year, p.year)}
        ${tile('Total histórico', stats.total, p.total, 'gold')}
      </div>
      <div class="cv-legend">
        <b>¿Cómo se calcula?</b>
        <ul>
          <li><b>Ganancia</b> = (Ventas − Costo mercancía) + (Servicios − Piezas usadas).</li>
          <li><b>Ventas</b>: total facturado por los productos que vendiste.</li>
          <li><b>Servicios</b>: precio de las reparaciones <i>entregadas</i> al cliente.</li>
          <li><b>Costo mercancía</b> y <b>Piezas usadas</b>: lo que tú pagaste por esos artículos.</li>
          <li><b>Compras stock</b>: inversión total en comprar piezas (no resta de la ganancia hasta que las vendas o las uses).</li>
          <li><b>Movimientos</b>: cantidad de ventas, compras y reparaciones entregadas en ese periodo.</li>
        </ul>
      </div>`;
  }


  function stockPanelHtml(){
    const stats = DB.productStats();
    const items = Object.values(stats).sort((a,b)=>{
      // alerta primero
      const la = (a.min>0 && a.stock<=a.min) ? 0 : 1;
      const lb = (b.min>0 && b.stock<=b.min) ? 0 : 1;
      if(la!==lb) return la-lb;
      return a.name.localeCompare(b.name,'es');
    });
    if(!items.length) return `<p class="muted small">Aún no hay productos con movimientos. Registra una compra o usa una pieza en una reparación para ver el stock.</p>`;
    const lowCount = items.filter(i=> i.min>0 && i.stock<=i.min).length;
    const rows = items.map(i=>{
      const isLow = i.min>0 && i.stock<=i.min;
      const cls = isLow ? 'low' : (i.stock<=0 ? 'zero' : '');
      return `<div class="stk-row ${cls}">
        <div class="stk-main">
          <span class="stk-name">${escape(i.name)}</span>
          <span class="stk-tags">
            <span class="stk-tag in">+${i.purchased}</span>
            <span class="stk-tag out">−${i.sold+i.usedInRepairs}</span>
            ${isLow?'<span class="stk-tag alert">¡Bajo!</span>':''}
          </span>
        </div>
        <div class="stk-side">
          <span class="stk-stock">${i.stock}</span>
          <input class="stk-min" type="number" min="0" step="1" inputmode="numeric" placeholder="mín" value="${i.min||''}" data-stk-min="${escape(i.name)}" title="Stock mínimo">
        </div>
      </div>`;
    }).join('');
    return `
      <p class="muted xsmall" style="margin:0 0 10px">Define el <b>stock mínimo</b> de cada pieza. El sistema avisará cuando bajes de ese umbral.${lowCount?` Hoy hay <b class="warn">${lowCount}</b> por reponer.`:''}</p>
      <div class="stk-list">${rows}</div>`;
  }

  function bindStockInputs(){
    view().querySelectorAll('[data-stk-min]').forEach(inp=>{
      inp.addEventListener('change', ()=>{
        DB.setProductMinStock(inp.dataset.stkMin, inp.value);
        UI.toast('Stock mínimo actualizado');
        sales(document.getElementById('txFilter') ? document.getElementById('txFilter').value : 'all');
      });
    });
  }

  function summary(){
    const _stats = computeAllStats();
    const _gT = _stats.total.totalProfit;
    const _gCls = _gT>=0 ? 'pos' : 'neg';
    view().innerHTML = `
      <div class="greeting">Resumen <span>financiero</span></div>
      <p class="muted small" style="margin:-8px 4px 14px">Ganancias, ingresos y reparaciones — todo con explicación de dónde sale cada cifra.</p>

      <div class="profit-hero ${_gCls}">
        <span class="ph-label">Ganancia total acumulada</span>
        <span class="ph-amount">$ ${_gT.toFixed(2)}</span>
        <span class="ph-help">Ventas + servicios − costos · de todo el historial</span>
      </div>


      <div class="acc-card cv-stats-card open">
        <button class="acc-head" data-acc type="button">
          <span class="acc-ico">${ICONS.box}</span>
          <span class="acc-title">Contabilidad e ingresos</span>
          <span class="acc-sub">Lo que entró, lo que costó y la ganancia neta</span>
          <span class="acc-chev"></span>
        </button>
        <div class="acc-body">${cvStatsTilesHtml()}</div>
      </div>

      <div class="acc-card open">
        <button class="acc-head" data-acc type="button">
          <span class="acc-ico">${ICONS.edit}</span>
          <span class="acc-title">Reparaciones cobradas</span>
          <span class="acc-sub">Solo cuenta cuando entregas el equipo</span>
          <span class="acc-chev"></span>
        </button>
        <div class="acc-body">${sysStatsTilesHtml()}</div>
      </div>

      <div class="btn-row" style="margin-top:14px">
        <button class="btn-secondary" id="goCvBtn">${ICONS.box} Ir a Compra/Venta</button>
      </div>
    `;
    bindAccordions();
    const gb = document.getElementById('goCvBtn');
    if(gb) gb.onclick = ()=> App.go('sales');
  }

  function sales(filter){
    const active = filter || 'all';
    let list = DB.transactions.slice();
    if(active!=='all') list = list.filter(t=>t.type===active);
    list.sort((a,b)=>(b.date||b.createdAt||0)-(a.date||a.createdAt||0));

    const opts = TX_FILTERS.map(f=>`<option value="${f.k}" ${f.k===active?'selected':''}>${f.label}</option>`).join('');

    const groups = groupByDate(list.map(t=>({ ...t, createdAt: t.date||t.createdAt })));
    const grouped = groups.map(g=>`
      ${sectionDivider(g.label, g.items.length)}
      ${g.items.map(txCard).join('')}
    `).join('');

    const stockStats = DB.productStats();
    const lowList = Object.values(stockStats).filter(i=> i.min>0 && i.stock<=i.min);
    const lowBadge = lowList.length ? `<span class="acc-badge alert">${lowList.length}</span>` : '';
    const items = Object.values(stockStats);
    const totalStockUnits = items.reduce((a,i)=> a + Math.max(0,i.stock), 0);

    const _all = computeAllStats().total;
    const _gainSales = _all.salesIncome - _all.salesCost;
    const _gainPurch = -_all.purchases; // las compras son inversión (no son ganancia)
    const _netCls = _all.totalProfit>=0 ? '' : 'neg';
    const _heroHtml = `
      <div class="cv-hero ${_netCls}">
        <div class="cvh-row"><span class="lbl">Ventas (entró)</span><span class="val">${fmtMoney(_all.salesIncome)}</span></div>
        <div class="cvh-row"><span class="lbl">Costo de mercancía vendida</span><span class="val neg">${fmtMoney(_all.salesCost)}</span></div>
        <div class="cvh-row"><span class="lbl">Ganancia de ventas (con inversión)</span><span class="val ${_gainSales>=0?'pos':'neg'}">${fmtMoney(_gainSales)}</span></div>
        <div class="cvh-row"><span class="lbl">Ingreso bruto de ventas (sin restar inversión)</span><span class="val pos">${fmtMoney(_all.salesIncome)}</span></div>
        <div class="cvh-row"><span class="lbl">Compras stock (inversión)</span><span class="val neg">${fmtMoney(_all.purchases)}</span></div>
        <div class="cvh-row"><span class="lbl">Servicios cobrados − piezas</span><span class="val ${_all.repairProfit>=0?'pos':'neg'}">${fmtMoney(_all.repairProfit)}</span></div>
        <div class="cvh-big">
          <span class="lbl">Ganancia neta total</span>
          <span class="val ${_all.totalProfit>=0?'pos':'neg'}">${fmtMoney(_all.totalProfit)}</span>
        </div>
      </div>`;
    view().innerHTML = `
      <div class="greeting">Compras y <span>Ventas</span></div>
      <p class="muted small" style="margin:-8px 4px 10px">
        Gestiona aquí tus compras de stock y tus ventas. Cada compra suma piezas a tu inventario;
        cada venta o pieza usada en una reparación las descuenta automáticamente.
      </p>
      ${_heroHtml}


      <div class="acc-card ${lowList.length?'open':''}">
        <button class="acc-head" data-acc type="button">
          <span class="acc-ico">${ICONS.box}</span>
          <span class="acc-title">Stock y alertas ${lowBadge}</span>
          <span class="acc-sub">${totalStockUnits} unidad(es) en total · define mínimos para avisos</span>
          <span class="acc-chev"></span>
        </button>
        <div class="acc-body">${stockPanelHtml()}</div>
      </div>

      <div class="btn-row" style="margin:14px 0 6px">
        <button class="btn-secondary" id="newSaleBtn">${ICONS.plus} Nueva venta</button>
        <button class="btn-secondary" id="newPurchaseBtn">${ICONS.plus} Nueva compra</button>
      </div>
      <div class="select-elegant" style="margin-top:10px">
        <select id="txFilter" aria-label="Filtrar movimientos">${opts}</select>
      </div>
      ${list.length ? grouped : emptyState('Sin movimientos','Registra tu primera venta o compra')}
    `;
    document.getElementById('newSaleBtn').onclick = ()=> newTransaction('sale');
    document.getElementById('newPurchaseBtn').onclick = ()=> newTransaction('purchase');
    document.getElementById('txFilter').addEventListener('change', e=> sales(e.target.value));
    bindAccordions();
    bindStockInputs();
    bindTxCards();
  }





  function newTransaction(type, existing){
    const t = existing || { type };
    const productOptions = (DB.settings.productTypes||[])
      .map(p=>`<option value="${escape(p)}">`).join('');
    const dateVal = t.date ? fmtDateInput(t.date) : fmtDateInput(Date.now());

    UI.openModal(`
      <h2 style="margin:0 0 4px;font-size:20px">${existing?'Editar':'Nueva'} ${txLabel(t.type)}</h2>
      <p class="muted small" style="margin:0 0 14px">Registra el movimiento con todos los detalles.</p>
      <form id="txForm" novalidate>
        <div class="form-group">
          <label>Tipo</label>
          <div class="select-elegant">
            <select name="type">
              <option value="sale" ${t.type==='sale'?'selected':''}>Venta (ingreso)</option>
              <option value="purchase" ${t.type==='purchase'?'selected':''}>Compra (gasto)</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Producto *</label>
          <input name="product" list="productTypesList" required placeholder="Selecciona o escribe" value="${escape(t.product||'')}">
          <datalist id="productTypesList">${productOptions}</datalist>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Cantidad *</label>
            <input name="quantity" type="number" min="0" step="1" inputmode="numeric" required value="${t.quantity!=null?t.quantity:1}">
          </div>
          <div class="form-group">
            <label>Precio unitario *</label>
            <input name="unitPrice" type="number" min="0" step="0.01" inputmode="decimal" required value="${t.unitPrice!=null?t.unitPrice:''}">
          </div>
        </div>
        <div class="form-group cost-group" id="costGroup">
          <label>Costo unitario (lo que te costó) <span class="muted" style="text-transform:none;font-weight:500">— opcional</span></label>
          <input name="unitCost" type="number" min="0" step="0.01" inputmode="decimal" value="${t.unitCost!=null?t.unitCost:''}" placeholder="Ej: 5.00">
          <p class="muted small" style="margin:6px 2px 0">Se usa para calcular tu <b>ganancia</b> e <b>inversión</b> al vender.</p>
          <div id="profitHint" class="profit-hint hidden"></div>
        </div>
        <div class="form-group">
          <label>Total</label>
          <input name="total" type="number" min="0" step="0.01" inputmode="decimal" id="txTotalInput" value="${t.total!=null?t.total:''}" placeholder="Se calcula automáticamente">
          <p class="muted small" style="margin:6px 2px 0">Puedes ajustar el total si aplicaste un descuento.</p>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Fecha</label>
            <input name="date" type="date" value="${dateVal}">
          </div>
          <div class="form-group">
            <label id="cpLabel">Cliente / Proveedor</label>
            <input name="counterparty" autocapitalize="words" value="${escape(t.counterparty||'')}">
          </div>
        </div>
        <div class="form-group">
          <label>Notas</label>
          <textarea name="notes" rows="2">${escape(t.notes||'')}</textarea>
        </div>
        <button type="submit" class="btn-primary" style="margin-top:6px">${existing?'Guardar cambios':'Registrar movimiento'}</button>
      </form>
    `);

    const form = document.getElementById('txForm');
    const qty = form.querySelector('[name=quantity]');
    const unit = form.querySelector('[name=unitPrice]');
    const costI = form.querySelector('[name=unitCost]');
    const totalI = document.getElementById('txTotalInput');
    const cpLabel = document.getElementById('cpLabel');
    const typeSel = form.querySelector('[name=type]');
    const costGroup = document.getElementById('costGroup');
    const profitHint = document.getElementById('profitHint');
    let totalEdited = !!(existing && t.total!=null);
    function recalc(){
      if(!totalEdited){
        const q = parseFloat(qty.value)||0;
        const u = parseFloat(unit.value)||0;
        totalI.value = (q*u).toFixed(2);
      }
      updateProfitHint();
    }
    function updateProfitHint(){
      if(typeSel.value !== 'sale'){ profitHint.classList.add('hidden'); return; }
      const q = parseFloat(qty.value)||0;
      const u = parseFloat(unit.value)||0;
      const c = parseFloat(costI.value);
      const totalCalc = parseFloat(totalI.value) || (q*u);
      if(isNaN(c) || costI.value===''){ profitHint.classList.add('hidden'); return; }
      const inv = c*q;
      const profit = totalCalc - inv;
      const cls = profit>=0 ? 'pos' : 'neg';
      profitHint.classList.remove('hidden');
      profitHint.innerHTML = `
        <span class="ph-row"><span>Inversión</span><b>$ ${inv.toFixed(2)}</b></span>
        <span class="ph-row ${cls}"><span>Ganancia estimada</span><b>$ ${profit.toFixed(2)}</b></span>`;
    }
    function updateCpLabel(){
      cpLabel.textContent = typeSel.value==='sale' ? 'Cliente' : 'Proveedor';
    }
    function updateCostVisibility(){
      // El campo coste es útil sobre todo en ventas; en compras lo ocultamos
      costGroup.style.display = typeSel.value==='sale' ? '' : 'none';
      updateProfitHint();
    }
    qty.addEventListener('input', recalc);
    unit.addEventListener('input', recalc);
    if(costI) costI.addEventListener('input', updateProfitHint);
    totalI.addEventListener('input', ()=>{ totalEdited = true; updateProfitHint(); });
    typeSel.addEventListener('change', ()=>{ updateCpLabel(); updateCostVisibility(); });
    updateCpLabel();
    updateCostVisibility();
    if(!totalEdited) recalc();

    form.addEventListener('submit', e=>{
      e.preventDefault();
      const fd = new FormData(form);
      const product = (fd.get('product')||'').trim();
      if(!product){ UI.toast('Indica el producto'); return; }
      const q = parseFloat(fd.get('quantity'))||0;
      const u = parseFloat(fd.get('unitPrice'))||0;
      const tot = fd.get('total')!=='' ? parseFloat(fd.get('total')) : (q*u);
      const typeVal = fd.get('type')==='purchase' ? 'purchase' : 'sale';
      const costRaw = fd.get('unitCost');
      const hasCost = typeVal==='sale' && costRaw!=null && String(costRaw).trim()!=='';
      const unitCost = hasCost ? parseFloat(costRaw) : null;
      const dateStr = fd.get('date');
      const data = {
        type: typeVal,
        product,
        quantity: q,
        unitPrice: u,
        unitCost: unitCost,
        costTotal: hasCost ? Number((unitCost*q).toFixed(2)) : null,
        total: Number(tot.toFixed(2)),
        date: dateStr ? new Date(dateStr).getTime() : Date.now(),
        counterparty: (fd.get('counterparty')||'').trim() || null,
        notes: (fd.get('notes')||'').trim() || null
      };
      if(data.product && !DB.settings.productTypes.some(p=>p.toLowerCase()===data.product.toLowerCase())){
        DB.addProductType(data.product);
      }
      if(existing){
        DB.updateTransaction(existing.id, data);
        UI.toast('Movimiento actualizado');
      } else {
        const nt = DB.addTransaction(data);
        UI.toast(`${txLabel(data.type)} registrada: ${nt.id}`);
      }
      UI.closeModal();
      App.refresh();
    });
  }

  function showTransaction(id){
    const t = DB.findTransaction(id); if(!t) return;
    const isSale = t.type==='sale';
    const sign = isSale ? '+' : '-';
    const total = Number(t.total||0);
    const qty = Number(t.quantity||0);
    let saleExtras = '';
    if(isSale && t.unitCost != null){
      const unitCost = Number(t.unitCost||0);
      const invTotal = t.costTotal != null ? Number(t.costTotal) : unitCost*qty;
      const profit = total - invTotal;
      const pcls = profit>=0 ? 'pos' : 'neg';
      saleExtras = `
        <div class="detail-row"><span class="lbl">Costo unit.</span><span class="val">$ ${unitCost.toFixed(2)}</span></div>
        <div class="detail-row"><span class="lbl">Inversión</span><span class="val">$ ${invTotal.toFixed(2)}</span></div>
        <div class="detail-row"><span class="lbl">Ganancia de esta venta</span><span class="val tx-profit ${pcls}">$ ${profit.toFixed(2)}</span></div>`;
    } else if(!isSale){
      saleExtras = `
        <div class="detail-row"><span class="lbl">Inversión</span><span class="val tx-profit neg">$ ${total.toFixed(2)}</span></div>
        <div class="detail-row"><span class="lbl">Ganancia de esta compra</span><span class="val muted">— (se realiza al vender o usar la pieza)</span></div>`;
    }
    const _gT = totalProfitNow();
    const _gCls = _gT>=0 ? 'pos' : 'neg';
    const generalRow = `<div class="detail-row"><span class="lbl">Ganancia general</span><span class="val tx-profit ${_gCls}">$ ${_gT.toFixed(2)}</span></div>`;
    UI.openModal(`
      <h2 style="margin:0 0 4px;font-size:20px">${escape(t.product||'Producto')}</h2>
      <p class="muted" style="margin:0 0 14px">${escape(t.id)} · <span class="tx-badge ${isSale?'sale':'purchase'}">${txLabel(t.type)}</span></p>
      <div class="detail-row"><span class="lbl">Cantidad</span><span class="val">${qty}</span></div>
      <div class="detail-row"><span class="lbl">Precio unit.</span><span class="val">$ ${Number(t.unitPrice||0).toFixed(2)}</span></div>
      <div class="detail-row"><span class="lbl">Total</span><span class="val tx-amount ${isSale?'sale':'purchase'}">${sign} $ ${total.toFixed(2)}</span></div>
      ${saleExtras}
      ${generalRow}
      <div class="detail-row"><span class="lbl">Fecha</span><span class="val">${fmtDate(t.date||t.createdAt)}</span></div>
      <div class="detail-row"><span class="lbl">${isSale?'Cliente':'Proveedor'}</span><span class="val">${t.counterparty?escape(t.counterparty):'<span class="muted">—</span>'}</span></div>
      <div class="detail-row"><span class="lbl">Notas</span><span class="val">${t.notes?escape(t.notes):'<span class="muted">—</span>'}</span></div>
      <div class="btn-row" style="margin-top:14px">
        <button class="btn-secondary" id="txEdit">${ICONS.edit} Editar</button>
        <button class="btn-primary btn-cancel" id="txDel">${ICONS.trash} Eliminar</button>
      </div>
    `);
    document.getElementById('txEdit').onclick = ()=>{ UI.closeModal(); newTransaction(t.type, t); };
    document.getElementById('txDel').onclick = async ()=>{
      const ok = await UI.confirmDialog({
        title:'Eliminar movimiento',
        message:`¿Eliminar definitivamente ${t.id}? Esta acción no se puede deshacer.`,
        okText:'Eliminar', cancelText:'Cancelar', danger:true
      });
      if(!ok) return;
      DB.deleteTransaction(id);
      UI.toast('Movimiento eliminado');
      UI.closeModal();
      App.refresh();
    };
  }

  // ============= CHOOSER FAB =============
  function newChooser(){
    UI.openModal(`
      <h2 style="margin:0 0 6px;font-size:20px">¿Qué quieres registrar?</h2>
      <p class="muted small" style="margin:0 0 14px">Elige el tipo de movimiento.</p>
      <div class="chooser-grid">
        <button class="chooser-tile repair" data-c="repair">
          ${ICONS.edit}
          <span class="ct-title">Reparación</span>
          <span class="ct-sub">Registrar un nuevo equipo</span>
        </button>
        <button class="chooser-tile sale" data-c="sale">
          ${ICONS.plus}
          <span class="ct-title">Venta</span>
          <span class="ct-sub">Producto vendido (ingreso)</span>
        </button>
        <button class="chooser-tile purchase" data-c="purchase">
          ${ICONS.box}
          <span class="ct-title">Compra</span>
          <span class="ct-sub">Producto comprado (gasto)</span>
        </button>
      </div>
    `);
    document.querySelectorAll('[data-c]').forEach(b=>{
      b.onclick = ()=>{
        const c = b.dataset.c;
        UI.closeModal();
        if(c==='repair') App.go('new');
        else { App.go('sales'); newTransaction(c); }
      };
    });
  }

  // ============= AUDITORÍA DEL SISTEMA =============
  function runSystemAudit(){
    const s = computeAllStats();
    const total = s.total;
    const repairs = DB.repairs;
    const txs = DB.transactions;
    const issues = [];
    const ps = DB.productStats ? DB.productStats() : {};
    for(const n in ps){
      const it = ps[n];
      const stock = (it.purchased||0) - (it.sold||0) - (it.usedInRepairs||0);
      if(stock < 0) issues.push(`Stock negativo en "${n}": faltan ${Math.abs(stock)} unidades. Registra una compra.`);
      if(it.min && stock < it.min && stock>=0) issues.push(`Stock bajo en "${n}": ${stock} (mínimo ${it.min}).`);
    }
    for(const r of repairs){
      if(r.status==='delivered' && (r.price==null || r.price==='')) issues.push(`Reparación ${r.id} entregada sin precio asignado.`);
      if(r.deposit!=null && r.price!=null && Number(r.deposit) > Number(r.price)) issues.push(`Reparación ${r.id}: anticipo ($${Number(r.deposit).toFixed(2)}) supera al precio ($${Number(r.price).toFixed(2)}).`);
      if(r.dueDate && r.createdAt){
        const c0 = new Date(r.createdAt); c0.setHours(0,0,0,0);
        if(r.dueDate < c0.getTime()) issues.push(`Reparación ${r.id}: fecha de entrega anterior a la fecha de entrada.`);
      }
    }
    for(const t of txs){
      const q = Number(t.quantity||0), u = Number(t.unitPrice||0), tot = Number(t.total||0);
      if(q>0 && u>0 && Math.abs(q*u - tot) > 0.05) issues.push(`Movimiento ${t.id}: total $${tot.toFixed(2)} no coincide con ${q}×$${u.toFixed(2)}.`);
    }
    return {
      stats: s,
      totals: {
        repairs: repairs.length,
        delivered: repairs.filter(r=>r.status==='delivered').length,
        pendingPayments: total.pendingRepair,
        salesIncome: total.salesIncome,
        salesProfit: total.salesProfit,
        purchases: total.purchases,
        repairIncome: total.repairIncome,
        repairProfit: total.repairProfit,
        totalProfit: total.totalProfit,
        countSales: total.countSales,
        countPurchases: total.countPurchases
      },
      issues
    };
  }

  function auditReportHtml(a){
    const t = a.totals;
    const okBadge = a.issues.length===0
      ? '<span class="audit-badge ok">✓ Todo consistente</span>'
      : `<span class="audit-badge warn">⚠ ${a.issues.length} aviso(s)</span>`;
    const issuesHtml = a.issues.length
      ? `<ul class="audit-issues">${a.issues.map(i=>`<li>${escape(i)}</li>`).join('')}</ul>`
      : `<p class="muted small">No se detectaron inconsistencias. Las cifras de compras, ventas y reparaciones cuadran perfectamente.</p>`;
    return `
      <h2 style="margin:0 0 4px;font-size:20px">Auditoría del sistema</h2>
      <p class="muted small" style="margin:0 0 12px">Recalculado en tiempo real desde compras, ventas y reparaciones. ${okBadge}</p>
      <div class="audit-grid">
        <div class="audit-tile"><span>Ingresos por ventas</span><b>${fmtMoney(t.salesIncome)}</b><em>${t.countSales} venta(s)</em></div>
        <div class="audit-tile"><span>Inversión en compras</span><b>${fmtMoney(t.purchases)}</b><em>${t.countPurchases} compra(s)</em></div>
        <div class="audit-tile"><span>Reparaciones cobradas</span><b>${fmtMoney(t.repairIncome)}</b><em>${t.delivered} entregadas</em></div>
        <div class="audit-tile"><span>Por cobrar</span><b>${fmtMoney(t.pendingPayments)}</b><em>reparaciones sin entregar</em></div>
        <div class="audit-tile gold"><span>Ganancia total</span><b>${fmtMoney(t.totalProfit)}</b><em>ventas + servicios − costos</em></div>
        <div class="audit-tile"><span>Reparaciones totales</span><b>${t.repairs}</b><em>en el sistema</em></div>
      </div>
      <div class="section-title">Avisos</div>
      ${issuesHtml}
    `;
  }

  function openAudit(){
    const a = runSystemAudit();
    UI.openModal(auditReportHtml(a));
  }

  function autoAuditOnLoad(){
    try{
      const a = runSystemAudit();
      if(a.issues.length){
        UI.toast(`Auditoría: ${a.issues.length} aviso(s) — revisa Administración.`);
      }
    }catch(e){}
  }

  return { dashboard, repairsList, newRepair, search, admin, showRepair, showLabel, sales, summary, newTransaction, newChooser, runSystemAudit, openAudit, autoAuditOnLoad };
})();
