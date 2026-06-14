const App = (() => {
  let current = 'dashboard';
  let currentArg = null;

  // Logos: trazos refinados, geometría centrada, estética premium
  const LOGO_PRESETS = [
    { key:'phoenix', name:'Fénix', svg: `
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="lg-ph" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="currentColor" stop-opacity=".95"/>
    <stop offset="1" stop-color="currentColor" stop-opacity=".5"/>
  </linearGradient></defs>
  <g fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M32 8 C 20 18 18 30 26 38 L 22 44 C 30 42 34 38 36 32 C 38 38 42 42 50 44 L 46 38 C 54 30 52 18 40 10 C 38 16 36 20 32 22 C 30 18 30 12 32 8 Z" fill="url(#lg-ph)" fill-opacity=".25"/>
    <path d="M24 48 L40 48 M22 54 L42 54" stroke-width="2.4"/>
  </g>
</svg>`.trim() },
    { key:'tools', name:'Herramientas', svg: `
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <g fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="32" cy="32" r="26" stroke-opacity=".25"/>
    <path d="M16 48 L36 28" />
    <path d="M14 50 a4 4 0 1 1 5 -5" />
    <path d="M44 22 a8 8 0 1 0 -12 -8 l6 6 -4 4 -6 -6 a8 8 0 0 0 12 8 z" fill="currentColor" fill-opacity=".2"/>
    <path d="M50 14 L30 34" />
    <path d="M52 12 l4 4 -4 4 -4 -4 z" fill="currentColor" fill-opacity=".3"/>
  </g>
</svg>`.trim() },
    { key:'gear', name:'Engranaje', svg: `
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <g fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M32 6 L35 12 L41.5 11 L43 17.5 L49 19.5 L48 26 L53 30 L50 35.5 L52 41.5 L46 44 L44 50 L37.5 50 L34 55.5 L28 53.5 L22 55 L19 49.5 L13 47.5 L13 41 L8 36.5 L11.5 31 L10 25 L15 22 L16.5 15.5 L23 14.5 L27 9 Z" fill="currentColor" fill-opacity=".14"/>
    <circle cx="32" cy="32" r="9" fill="currentColor" fill-opacity=".22"/>
    <circle cx="32" cy="32" r="3.4" fill="currentColor"/>
  </g>
</svg>`.trim() },
    { key:'shield', name:'Garantía', svg: `
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <g fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M32 6 L52 14 L52 32 C52 44 42 54 32 58 C22 54 12 44 12 32 L12 14 Z" fill="currentColor" fill-opacity=".15"/>
    <path d="M22 32 L29 39 L43 24" stroke-width="3.2"/>
  </g>
</svg>`.trim() },
    { key:'circuit', name:'Circuito', svg: `
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <g fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
    <rect x="12" y="12" width="40" height="40" rx="6" fill="currentColor" fill-opacity=".08"/>
    <path d="M22 22 h8 v8 h-8z M34 22 h10 M34 30 h10 M22 38 h22 M22 46 h8 M34 46 h10"/>
    <circle cx="44" cy="22" r="2.6" fill="currentColor"/>
    <circle cx="44" cy="30" r="2.6" fill="currentColor"/>
    <circle cx="30" cy="46" r="2.6" fill="currentColor"/>
  </g>
</svg>`.trim() },
    { key:'bolt', name:'Energía', svg: `
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="lg-bl" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="currentColor" stop-opacity=".95"/>
    <stop offset="1" stop-color="currentColor" stop-opacity=".5"/>
  </linearGradient></defs>
  <path d="M36 4 L14 36 h12 L22 60 L50 26 H38 z" fill="url(#lg-bl)" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>
</svg>`.trim() },
    { key:'diamond', name:'Diamante', svg: `
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <g fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round">
    <path d="M14 24 L24 10 L40 10 L50 24 L32 56 Z" fill="currentColor" fill-opacity=".18"/>
    <path d="M14 24 H50 M24 10 L32 24 L40 10 M14 24 L32 24 L50 24"/>
  </g>
</svg>`.trim() },
    { key:'wrench', name:'Llave', svg: `
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <path d="M44 8a12 12 0 0 0-11 16L10 47a4 4 0 0 0 0 6l1 1a4 4 0 0 0 6 0l23-23a12 12 0 0 0 14-15l-7 7-6-1-1-6z" fill="currentColor" fill-opacity=".22" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/>
</svg>`.trim() }
  ];

  // Compatibilidad con presets antiguos guardados en DB
  const LOGO_ALIASES = { screwdriver:'tools' };

  function logoHtml(){
    const custom = DB.settings.logo;
    if(custom) return `<img src="${custom}" alt="logo">`;
    let key = DB.settings.logoPreset || 'phoenix';
    if(LOGO_ALIASES[key]) key = LOGO_ALIASES[key];
    const p = LOGO_PRESETS.find(x=>x.key===key) || LOGO_PRESETS[0];
    return p.svg;
  }
  function getPresets(){ return LOGO_PRESETS; }

  function applyBrand(){
    const name = DB.settings.appName || 'Taller';
    const html = UI.renderBrand(name);
    const app = document.getElementById('appTitle');
    const login = document.getElementById('loginTitle');
    if(app) app.innerHTML = html;
    if(login) login.innerHTML = html;
    document.title = name;
    const lh = logoHtml();
    const al = document.getElementById('appLogo');
    const ll = document.getElementById('loginLogo');
    if(al) al.innerHTML = lh;
    if(ll) ll.innerHTML = lh;
    renderCreatorChips();
    renderBrandStats();
  }

  function renderBrandStats(){
    const box = document.getElementById('brandStats');
    if(!box) return;
    try{
      const total = DB.repairs.length;
      const pend = DB.byStatus('pending').length + DB.byStatus('in_progress').length;
      const done = DB.byStatus('delivered').length;
      const todayP = (DB.todayPending && DB.todayPending().length) || 0;
      box.innerHTML =
        `<span class="bs-chip total" title="Total de reparaciones registradas en el sistema">📋 Reparaciones totales <b>${total}</b></span>` +
        `<span class="bs-chip" title="Pendientes y en proceso">⏳ Pendientes <b>${pend}</b></span>` +
        `<span class="bs-chip" title="Entregadas">✅ Entregadas <b>${done}</b></span>` +
        (todayP>0 ? `<span class="bs-chip warn" title="Entrega para hoy o vencidas">⚠️ Hoy <b>${todayP}</b></span>` : '');
    }catch(e){ box.innerHTML=''; }
  }


  function renderCreatorChips(){
    const box = document.getElementById('creatorContacts');
    if(!box) return;
    const c = (DB.settings.creator || {});
    const tel = UI.phoneClean(c.phone);
    const sms = UI.phoneSms(c.phone);
    const ICON_PHONE = '<svg viewBox="0 0 24 24"><path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.58 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.4 11.4 0 0 0 .58 3.6 1 1 0 0 1-.25 1l-2.23 2.2z" fill="currentColor"/></svg>';
    const ICON_SMS = '<svg viewBox="0 0 24 24"><path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM7 11h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z" fill="currentColor"/></svg>';
    const parts = [];
    if(tel) parts.push(`<a class="creator-chip tel icon-only" href="tel:${UI.escape(tel)}" title="Llamar al creador" aria-label="Llamar">${ICON_PHONE}</a>`);
    if(sms) parts.push(`<a class="creator-chip sms icon-only" href="sms:${UI.escape(sms)}" title="Enviar SMS al creador" aria-label="SMS">${ICON_SMS}</a>`);
    box.innerHTML = parts.join('');
  }

  function showLogin(){
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('app').classList.add('hidden');
  }
  function showApp(){
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    go('dashboard');
    // Auditoría automática al entrar: avisa si algo no cuadra
    setTimeout(()=>{ if(window.Views && Views.autoAuditOnLoad) Views.autoAuditOnLoad(); }, 600);
  }
  function go(v, arg, extra){
    current = v; currentArg = arg;
    document.querySelectorAll('.tab').forEach(t=>{
      t.classList.toggle('active', t.dataset.view === v);
    });
    if(v==='dashboard') Views.dashboard();
    else if(v==='repairs') Views.repairsList(arg);
    else if(v==='new') Views.newRepair(extra);
    else if(v==='sales') Views.sales(arg);
    else if(v==='summary') Views.summary();
    else if(v==='chooser') Views.newChooser();
    else if(v==='search') Views.search();
    else if(v==='admin') Views.admin();
    try{ renderBrandStats(); }catch(e){}
    window.scrollTo(0,0);
  }
  function refresh(){ go(current, currentArg); }

  function init(){
    applyBrand();
    document.getElementById('loginBtn').addEventListener('click', tryLogin);
    document.getElementById('loginPass').addEventListener('keydown', e=>{
      if(e.key==='Enter') tryLogin();
    });
    const fb = document.getElementById('forgotBtn');
    if(fb) fb.addEventListener('click', openForgotFlow);
    document.getElementById('logoutBtn').addEventListener('click', ()=>{
      Auth.logout();
      showLogin();
    });
    document.getElementById('modalClose').addEventListener('click', UI.closeModal);
    document.getElementById('modal').addEventListener('click', e=>{
      if(e.target.id==='modal') UI.closeModal();
    });
    document.querySelectorAll('.tab').forEach(t=>{
      t.addEventListener('click', ()=>{
        const v = t.dataset.view;
        if(v==='chooser'){ Views.newChooser(); return; }
        go(v);
      });
    });
    const sb = document.getElementById('headerSearchBtn');
    if(sb) sb.addEventListener('click', ()=> go('search'));
    // refrescar contador del header cuando se navega
    const _go = go;
    window.__appGoOriginal = _go;
    if(Auth.isLoggedIn()) showApp();
    else {
      if(!DB.settings.passwordHash){
        document.querySelector('#loginScreen .muted').textContent = 'Primer acceso: define tu contraseña';
      }
      showLogin();
    }
  }
  async function tryLogin(){
    const pass = document.getElementById('loginPass').value;
    const err = document.getElementById('loginError');
    if(await Auth.login(pass)){
      err.classList.add('hidden');
      document.getElementById('loginPass').value = '';
      applyBrand();
      showApp();
    } else {
      err.classList.remove('hidden');
    }
  }
  function openForgotFlow(){
    const qs = Auth.getQuestions();
    if(!qs.length){
      UI.toast('No hay preguntas configuradas. Pide ayuda al administrador.');
      return;
    }
    const rows = qs.map((q,i)=>`
      <div class="form-group">
        <label>${UI.escape(q)}</label>
        <input type="text" data-ans="${i}" autocomplete="off">
      </div>`).join('');
    UI.openModal(`
      <h2 style="margin:0 0 6px;font-size:20px">Recuperar contraseña</h2>
      <p class="muted small" style="margin:0 0 12px">Responde las preguntas que configuraste. No distinguen mayúsculas ni acentos.</p>
      <form id="forgotForm">
        ${rows}
        <button type="submit" class="btn-primary">Verificar respuestas</button>
      </form>
    `);
    document.getElementById('forgotForm').addEventListener('submit', async e=>{
      e.preventDefault();
      const answers = Array.from(document.querySelectorAll('[data-ans]')).map(i=>i.value);
      const ok = await Auth.verifyAnswers(answers);
      if(!ok){ UI.toast('Respuestas incorrectas'); return; }
      UI.openModal(`
        <h2 style="margin:0 0 6px;font-size:20px">Nueva contraseña</h2>
        <p class="muted small" style="margin:0 0 12px">Define una nueva contraseña de acceso.</p>
        <form id="newPassForm">
          <div class="form-group"><input type="password" id="np1" placeholder="Nueva contraseña" required></div>
          <div class="form-group"><input type="password" id="np2" placeholder="Repetir contraseña" required></div>
          <button type="submit" class="btn-primary">Guardar contraseña</button>
        </form>
      `);
      document.getElementById('newPassForm').addEventListener('submit', async ev=>{
        ev.preventDefault();
        const a = document.getElementById('np1').value;
        const b = document.getElementById('np2').value;
        if(a.length<3){ UI.toast('Mínimo 3 caracteres'); return; }
        if(a!==b){ UI.toast('No coinciden'); return; }
        await Auth.setPassword(a);
        UI.closeModal();
        UI.toast('Contraseña actualizada. Ya puedes entrar.');
      });
    });
  }
  return { init, go, refresh, applyBrand, getPresets };
})();
document.addEventListener('DOMContentLoaded', App.init);
