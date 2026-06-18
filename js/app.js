/* =====================================================
   UNLOCK BOX — App Logic (vanilla JS)
   Data persisted in localStorage.
===================================================== */

const DEFAULT_PASSWORD = '1234';
const DEFAULT_RECOVERY_ANSWER = 'unlock';

const STORAGE = {
  boxes: 'ub_boxes_v1',
  clients: 'ub_clients_v1',
  session: 'ub_admin_session',
  settings: 'ub_settings_v2',
  auth: 'ub_auth_v1',
  subs: 'ub_subs_v1'
};

/* ============ Utils ============ */
function cryptoId() { return 'b_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36); }
function togglePass(btn) {
  const inp = btn.previousElementSibling;
  if (!inp) return;
  const show = inp.type === 'password';
  inp.type = show ? 'text' : 'password';
  const ico = btn.querySelector('i');
  if (ico) ico.className = show ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
}
function $(sel, root = document) { return root.querySelector(sel); }
function $$(sel, root = document) { return [...root.querySelectorAll(sel)]; }
function load(key, fallback) { try { const v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; } catch { return fallback; } }
function save(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
function escapeHtml(s = '') { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function toast(msg) {
  const el = $('#toast'); el.textContent = msg; el.classList.add('show');
  clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove('show'), 2800);
}
async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2,'0')).join('');
}

/* ============ Defaults ============ */
const DEFAULT_SETTINGS = {
  siteName: 'UNLOCK BOX',
  lockCode: false,  // ofuscación de código fuente
  contacts: {
    phone: '+53 0000 0000',
    email: 'contacto@unlockbox.com',
    schedule: 'Lun - Sáb · 8AM - 5PM',
    address: ''
  },
  payments: [
    { id: cryptoId(), name: 'CUP', details: 'Transferencia móvil' },
    { id: cryptoId(), name: 'MLC', details: 'Tarjeta MLC' },
    { id: cryptoId(), name: 'Zelle', details: '' },
    { id: cryptoId(), name: 'USDT', details: 'TRC20 / BEP20' }
  ],
  social: {
    whatsapp: '5354975132',
    telegram: 'https://t.me/siouxs_unlock',
    facebook: '',
    instagram: '',
    youtube: '',
    twitter: '',
    tiktok: '',
    emailLink: 'mailto:contacto@unlockbox.com'
  }
};

const DEFAULT_BOXES = [
  {
    id: cryptoId(),
    name: 'iRemoval PRO', price: 25, image: 'images/box-sample.jpg',
    short: 'iCloud Bypass con señal para iPhone XR a 15 Pro Max.',
    description: 'Solución definitiva de bypass de iCloud con señal. Compatible con iPhone XR hasta iPhone 15 Pro Max. Incluye soporte y actualizaciones.',
    features: ['Bypass iCloud con señal', 'iPhone XR - 15 Pro Max', 'Soporte 24/7', 'Actualizaciones gratis'],
    downloads: [{ label: 'Descargar v2.3', url: '#' }, { label: 'Manual PDF', url: '#' }],
    whatsapp: '5354975132', telegram: 'https://t.me/siouxs_unlock',
    facebook: '', phone: '+5354975132', moreInfo: 'https://iremoval.pro'
  },
  {
    id: cryptoId(),
    name: 'Unlock Tool', price: 18, image: 'images/box-sample.jpg',
    short: 'Herramienta multimarca para FRP, MDM y desbloqueo.',
    description: 'Caja universal de desbloqueo para múltiples marcas Android. Soporte para FRP, MDM, patrón, PIN y más.',
    features: ['Multi-marca Android', 'FRP / MDM bypass', 'Actualizaciones diarias'],
    downloads: [{ label: 'Última versión', url: '#' }],
    whatsapp: '5354975132', telegram: '@unlockbox',
    facebook: '', phone: '+5354975132', moreInfo: ''
  }
];

/* ============ State ============ */
let boxes = load(STORAGE.boxes, null);
if (!boxes) { boxes = DEFAULT_BOXES; save(STORAGE.boxes, boxes); }
let clients = load(STORAGE.clients, []);
let settings = load(STORAGE.settings, null);
if (!settings) { settings = DEFAULT_SETTINGS; save(STORAGE.settings, settings); }
else {
  // merge missing keys
  if (!settings.siteName) settings.siteName = DEFAULT_SETTINGS.siteName;
  if (settings.lockCode === undefined) settings.lockCode = false;
  settings.contacts = { ...DEFAULT_SETTINGS.contacts, ...(settings.contacts || {}) };
  settings.social = { ...DEFAULT_SETTINGS.social, ...(settings.social || {}) };
  settings.payments = settings.payments || DEFAULT_SETTINGS.payments;
}
let subs = load(STORAGE.subs, []);

/* ============ Auth bootstrap ============ */
async function ensureAuth() {
  let auth = load(STORAGE.auth, null);
  if (!auth) {
    auth = {
      passHash: await sha256(DEFAULT_PASSWORD),
      question: '¿Palabra clave de seguridad?',
      answerHash: await sha256(DEFAULT_RECOVERY_ANSWER.toLowerCase())
    };
    save(STORAGE.auth, auth);
  }
  return auth;
}

/* ============ Render: Topbar / Contact / Social / Footer ============ */
function renderTopbar() {
  const c = settings.contacts;
  $('#topbarInner').innerHTML = `
    ${c.phone ? `<a href="tel:${encodeURIComponent(c.phone.replace(/\s/g,''))}" class="topbar-link"><i class="fa-solid fa-phone"></i> ${escapeHtml(c.phone)}</a>` : ''}
    ${c.email ? `<a href="mailto:${encodeURIComponent(c.email)}" class="topbar-link"><i class="fa-solid fa-envelope"></i> ${escapeHtml(c.email)}</a>` : ''}
    ${c.schedule ? `<span><i class="fa-solid fa-clock"></i> ${escapeHtml(c.schedule)}</span>` : ''}
  `;
}

function tgLink(t) {
  if (!t) return '#';
  if (/^https?:/.test(t)) return t;
  return 'https://t.me/' + t.replace(/^@/, '');
}
function waLink(n) {
  if (!n) return '#';
  if (/^https?:/.test(n)) return n;
  return 'https://wa.me/' + encodeURIComponent(String(n).replace(/\D/g,''));
}

function renderSocialRail() {
  const s = settings.social;
  const items = [
    s.whatsapp && { cls:'wa', href: waLink(s.whatsapp), icon:'fa-brands fa-whatsapp', label:'WhatsApp' },
    s.telegram && { cls:'tg', href: tgLink(s.telegram), icon:'fa-brands fa-telegram', label:'Telegram' },
    s.facebook && { cls:'fb', href: s.facebook, icon:'fa-brands fa-facebook', label:'Facebook' },
    s.instagram && { cls:'ig', href: s.instagram, icon:'fa-brands fa-instagram', label:'Instagram' },
    s.youtube && { cls:'yt', href: s.youtube, icon:'fa-brands fa-youtube', label:'YouTube' },
    s.twitter && { cls:'tw', href: s.twitter, icon:'fa-brands fa-x-twitter', label:'X' },
    s.tiktok && { cls:'tk', href: s.tiktok, icon:'fa-brands fa-tiktok', label:'TikTok' },
    s.emailLink && { cls:'em', href: s.emailLink, icon:'fa-solid fa-envelope', label:'Email' }
  ].filter(Boolean);
  $('#socialRail').innerHTML = items.map(i =>
    `<a class="${i.cls}" href="${escapeHtml(i.href)}" target="_blank" rel="noopener" title="${i.label}" aria-label="${i.label}"><i class="${i.icon}"></i></a>`
  ).join('');
}

function renderContactGrid() {
  const s = settings.social, c = settings.contacts;
  const items = [
    s.whatsapp && { cls:'wa', href: waLink(s.whatsapp), icon:'fa-brands fa-whatsapp', label:'WhatsApp' },
    s.telegram && { cls:'tg', href: tgLink(s.telegram), icon:'fa-brands fa-telegram', label:'Telegram' },
    s.facebook && { cls:'fb', href: s.facebook, icon:'fa-brands fa-facebook', label:'Facebook' },
    c.phone && { cls:'ph', href: 'tel:' + c.phone.replace(/\s/g,''), icon:'fa-solid fa-phone', label:'Llamar' }
  ].filter(Boolean);
  $('#contactGrid').innerHTML = items.map(i =>
    `<a href="${escapeHtml(i.href)}" target="_blank" rel="noopener" class="ctc ${i.cls}"><i class="${i.icon}"></i><span>${i.label}</span></a>`
  ).join('');
}

function renderBottomContacts() {
  const c = settings.contacts;
  $('#bottomContacts').innerHTML = `
    <h3><i class="fa-solid fa-headset"></i> Contáctanos</h3>
    ${c.phone ? `<div class="bc-item"><i class="fa-solid fa-phone"></i> <span>${escapeHtml(c.phone)}</span></div>` : ''}
    ${c.email ? `<div class="bc-item"><i class="fa-solid fa-envelope"></i> <span>${escapeHtml(c.email)}</span></div>` : ''}
    ${c.schedule ? `<div class="bc-item"><i class="fa-solid fa-clock"></i> <span>${escapeHtml(c.schedule)}</span></div>` : ''}
    ${c.address ? `<div class="bc-item"><i class="fa-solid fa-location-dot"></i> <span>${escapeHtml(c.address)}</span></div>` : ''}
  `;
}

function renderFooter() {
  $('#footerPayments').textContent = (settings.payments || []).map(p => p.name).join(' · ') || '—';
  $('#footerSchedule').textContent = settings.contacts.schedule || '—';
}

/* Brand: respect case, color SECOND word red/brown via <strong> */
function brandMarkup(name) {
  const raw = (name || 'UNLOCK BOX').trim();
  const parts = raw.split(/\s+/);
  if (parts.length === 1) return escapeHtml(parts[0]);
  const first = escapeHtml(parts[0]);
  const second = escapeHtml(parts[1]);
  const rest = parts.slice(2).map(escapeHtml).join(' ');
  return `${first} <strong>${second}</strong>${rest ? ' ' + rest : ''}`;
}
function renderBrand() {
  const html = brandMarkup(settings.siteName);
  $$('.brand span, #brandText').forEach(el => { el.innerHTML = html; });
  const plain = (settings.siteName || 'UNLOCK BOX').trim();
  document.title = `${plain} - Alquiler de Cajas de Desbloqueo`;
  const prev = $('#siteNamePreview');
  if (prev) prev.innerHTML = html;
  document.dispatchEvent(new CustomEvent('ub:brandUpdated'));
}

function renderAll() {
  renderBrand();
  applyCodeLock();
  renderTopbar();
  renderSocialRail();
  renderContactGrid();
  renderBottomContacts();
  renderFooter();
  renderBoxes();
}

/* ============ Render: Public Boxes ============ */
function renderBoxes(filter = '') {
  const grid = $('#boxesGrid');
  const q = filter.trim().toLowerCase();
  const list = boxes.filter(b => !q || b.name.toLowerCase().includes(q) || (b.short || '').toLowerCase().includes(q));
  if (!list.length) {
    grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:var(--text-dim)">No se encontraron cajas.</p>`;
    return;
  }
  grid.innerHTML = list.map(b => `
    <article class="box-card" data-id="${b.id}">
      <div class="box-img" style="background-image:url('${escapeHtml(b.image || 'images/box-sample.jpg')}')">
        ${b.price ? `<div class="box-price">$${escapeHtml(b.price)}/mes</div>` : ''}
      </div>
      <div class="box-body">
        <h3>${escapeHtml(b.name)}</h3>
        <p>${escapeHtml(b.short || '')}</p>
        <div class="box-actions">
          ${b.whatsapp ? `<a class="icon-btn wa" title="WhatsApp" target="_blank" rel="noopener" href="${waLink(b.whatsapp)}"><i class="fa-brands fa-whatsapp"></i></a>` : ''}
          ${b.telegram ? `<a class="icon-btn tg" title="Telegram" target="_blank" rel="noopener" href="${tgLink(b.telegram)}"><i class="fa-brands fa-telegram"></i></a>` : ''}
          ${b.facebook ? `<a class="icon-btn fb" title="Facebook" target="_blank" rel="noopener" href="${escapeHtml(b.facebook)}"><i class="fa-brands fa-facebook"></i></a>` : ''}
          ${b.phone ? `<a class="icon-btn ph" title="Llamar" href="tel:${escapeHtml(b.phone)}"><i class="fa-solid fa-phone"></i></a>` : ''}
          ${(b.downloads && b.downloads.length) ? `<a class="icon-btn dl" title="Descargar" href="${escapeHtml(b.downloads[0].url)}" target="_blank" rel="noopener"><i class="fa-solid fa-download"></i></a>` : ''}
          <span class="spacer"></span>
          <button class="icon-btn info" title="Más información" data-info="${b.id}"><i class="fa-solid fa-circle-info"></i></button>
        </div>
      </div>
    </article>
  `).join('');
  $('#statBoxes').textContent = boxes.length;
  refreshBoxSelect();
}

function refreshBoxSelect() {
  const sel = $('#boxSelect');
  if (!sel) return;
  sel.innerHTML = '<option value="">-- Seleccionar --</option>' +
    boxes.map(b => `<option value="${escapeHtml(b.name)}">${escapeHtml(b.name)}</option>`).join('');
}

/* ============ Box Detail Modal ============ */
function openBoxDetail(id) {
  const b = boxes.find(x => x.id === id); if (!b) return;
  $('#boxModalContent').innerHTML = `
    <div class="detail-hero" style="background-image:url('${escapeHtml(b.image || 'images/box-sample.jpg')}')"></div>
    <h3>${escapeHtml(b.name)}</h3>
    ${b.price ? `<div class="detail-row"><span class="chip">💰 $${escapeHtml(b.price)}/mes</span></div>` : ''}
    <p style="color:var(--text-dim)">${escapeHtml(b.description || b.short || '')}</p>
    ${b.features && b.features.length ? `
      <h4 style="margin-top:18px;font-size:13px;color:var(--primary-2);text-transform:uppercase;letter-spacing:1px">Características</h4>
      <ul class="features-list">${b.features.map(f => `<li>${escapeHtml(f)}</li>`).join('')}</ul>` : ''}
    ${b.downloads && b.downloads.length ? `
      <h4 style="margin-top:14px;font-size:13px;color:var(--primary-2);text-transform:uppercase;letter-spacing:1px">Descargas</h4>
      <div class="dl-list">${b.downloads.map(d => `<a href="${escapeHtml(d.url)}" target="_blank" rel="noopener"><i class="fa-solid fa-download"></i> ${escapeHtml(d.label || 'Descargar')}</a>`).join('')}</div>` : ''}
    <h4 style="margin-top:14px;font-size:13px;color:var(--primary-2);text-transform:uppercase;letter-spacing:1px">Contacto</h4>
    <div class="box-actions" style="border:none;padding-top:0">
      ${b.whatsapp ? `<a class="icon-btn wa" target="_blank" rel="noopener" href="${waLink(b.whatsapp)}"><i class="fa-brands fa-whatsapp"></i></a>` : ''}
      ${b.telegram ? `<a class="icon-btn tg" target="_blank" rel="noopener" href="${tgLink(b.telegram)}"><i class="fa-brands fa-telegram"></i></a>` : ''}
      ${b.facebook ? `<a class="icon-btn fb" target="_blank" rel="noopener" href="${escapeHtml(b.facebook)}"><i class="fa-brands fa-facebook"></i></a>` : ''}
      ${b.phone ? `<a class="icon-btn ph" href="tel:${escapeHtml(b.phone)}"><i class="fa-solid fa-phone"></i></a>` : ''}
      ${b.moreInfo ? `<a class="icon-btn info" target="_blank" rel="noopener" href="${escapeHtml(b.moreInfo)}"><i class="fa-solid fa-arrow-up-right-from-square"></i></a>` : ''}
    </div>
    <div class="btn-row" style="margin-top:20px">
      <a href="#registro" class="btn btn-primary" onclick="closeModals()"><i class="fa-solid fa-paper-plane"></i> Solicitar Alquiler</a>
    </div>
  `;
  openModal('#boxModal');
}

/* ============ Modals ============ */
function openModal(sel) { $(sel).hidden = false; document.body.style.overflow = 'hidden'; }
function closeModals() { $$('.modal').forEach(m => m.hidden = true); document.body.style.overflow = ''; }
window.closeModals = closeModals;

document.addEventListener('click', e => {
  if (e.target.matches('[data-close]')) closeModals();
  const info = e.target.closest('[data-info]'); if (info) openBoxDetail(info.dataset.info);
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModals(); });



/* ============ Floating Menu ============ */
(function initFloatingMenu() {
  var btn     = document.getElementById('menuBtn');
  var panel   = document.getElementById('fmPanel');
  var overlay = document.getElementById('fmOverlay');
  var closeBtn = document.getElementById('fmClose');
  var brand   = document.getElementById('fmBrand');
  var links   = document.querySelectorAll('[data-fm-link]');

  if (!btn || !panel || !overlay) return;

  // Sync brand text
  function syncBrand() {
    if (brand) brand.textContent = (settings.siteName || 'UNLOCKBOX').trim();
  }
  syncBrand();
  // re-sync after settings load
  document.addEventListener('ub:brandUpdated', syncBrand);

  function open() {
    panel.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    panel.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  btn.addEventListener('click', function(e) {
    e.stopPropagation();
    panel.classList.contains('open') ? close() : open();
  });

  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', close);

  // Cada link: navegar inmediatamente, cerrar panel
  links.forEach(function(a) {
    a.addEventListener('click', function() {
      close();
    });
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') close();
  });
})();

/* ============ Search ============ */
$('#searchBox').addEventListener('input', e => renderBoxes(e.target.value));

/* ============ Registration ============ */
$('#registerForm').addEventListener('submit', e => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const name = (fd.get('name') || '').toString().trim();
  const phone = (fd.get('phone') || '').toString().trim();
  if (!name || name.length < 2) return toast('Nombre inválido');
  if (!phone || phone.length < 6) return toast('Teléfono inválido');
  const client = {
    id: cryptoId(), name, phone,
    email: (fd.get('email') || '').toString().trim(),
    location: (fd.get('location') || '').toString().trim(),
    box: (fd.get('box') || '').toString(),
    message: (fd.get('message') || '').toString().trim(),
    date: new Date().toISOString(),
    status: 'nuevo'
  };
  clients.unshift(client); save(STORAGE.clients, clients);
  e.target.reset();
  toast('¡Solicitud enviada! Te contactaremos pronto.');
  $('#statClients').textContent = clients.length;
});

/* ============ Newsletter ============ */
$('#newsletterForm').addEventListener('submit', e => {
  e.preventDefault();
  const email = e.target.email.value.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return toast('Email inválido');
  if (subs.find(s => s.email === email)) { toast('Ya estás suscrito'); return; }
  subs.unshift({ id: cryptoId(), email, date: new Date().toISOString() });
  save(STORAGE.subs, subs);
  e.target.reset();
  toast('¡Suscripción confirmada!');
});

/* ============ Admin auth ============ */
$('#fmAdminBtn').addEventListener('click', e => {
  e.preventDefault();
  if (sessionStorage.getItem(STORAGE.session) === '1') openAdminPanel();
  else openModal('#adminLogin');
});
$('#adminLoginForm').addEventListener('submit', async e => {
  e.preventDefault();
  const auth = await ensureAuth();
  const h = await sha256($('#adminPass').value);
  if (h === auth.passHash) {
    sessionStorage.setItem(STORAGE.session, '1');
    $('#adminPass').value = '';
    openAdminPanel();
  } else toast('Contraseña incorrecta');
});
$('#forgotPassBtn').addEventListener('click', async e => {
  e.preventDefault();
  const auth = await ensureAuth();
  $('#recoverQuestionLabel').textContent = auth.question || '¿Respuesta de seguridad?';
  closeModals(); openModal('#recoverModal');
});
$('#recoverForm').addEventListener('submit', async e => {
  e.preventDefault();
  const auth = await ensureAuth();
  const ans = $('#recoverAnswer').value.trim().toLowerCase();
  const newp = $('#recoverNewPass').value;
  const h = await sha256(ans);
  if (h !== auth.answerHash) return toast('Respuesta incorrecta');
  if (newp.length < 3) return toast('Contraseña muy corta');
  auth.passHash = await sha256(newp);
  save(STORAGE.auth, auth);
  e.target.reset();
  toast('Contraseña actualizada. Inicia sesión.');
  closeModals(); openModal('#adminLogin');
});
$('#adminLogout').addEventListener('click', () => {
  sessionStorage.removeItem(STORAGE.session);
  closeModals(); toast('Sesión cerrada');
});

function openAdminPanel() {
  closeModals(); openModal('#adminPanel');
  renderAdminBoxes(); renderAdminClients();
  loadContactsForm(); renderPayments(); loadSocialForm(); renderSubs();
  loadSystemForm();
}

/* ============ Admin Tabs ============ */
$$('.admin-tabs .tab[data-tab]').forEach(t => {
  t.addEventListener('click', () => {
    $$('.admin-tabs .tab').forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    $$('.tab-pane').forEach(p => p.classList.remove('active'));
    $('#tab-' + t.dataset.tab).classList.add('active');
  });
});

/* ============ Admin: Boxes CRUD ============ */
function renderAdminBoxes() {
  $('#adminBoxList').innerHTML = boxes.map(b => `
    <div class="admin-item">
      <img src="${escapeHtml(b.image || 'images/box-sample.jpg')}" alt="" />
      <div class="info">
        <strong>${escapeHtml(b.name)}</strong>
        <small>${escapeHtml(b.short || '')}</small>
      </div>
      <div class="actions">
        <button class="btn btn-ghost btn-sm" data-edit="${b.id}"><i class="fa-solid fa-pen"></i></button>
        <button class="btn btn-ghost btn-sm" data-del="${b.id}" style="color:var(--accent)"><i class="fa-solid fa-trash"></i></button>
      </div>
    </div>
  `).join('') || `<p class="muted">Sin cajas todavía.</p>`;
}

$('#newBoxBtn').addEventListener('click', () => openBoxEditor());
document.addEventListener('click', e => {
  const ed = e.target.closest('[data-edit]'); if (ed) openBoxEditor(ed.dataset.edit);
  const dl = e.target.closest('[data-del]'); if (dl) {
    if (confirm('¿Eliminar esta caja?')) {
      boxes = boxes.filter(b => b.id !== dl.dataset.del);
      save(STORAGE.boxes, boxes); renderBoxes(); renderAdminBoxes(); toast('Caja eliminada');
    }
  }
  const delc = e.target.closest('[data-delclient]'); if (delc) {
    if (confirm('¿Eliminar este cliente?')) {
      clients = clients.filter(c => c.id !== delc.dataset.delclient);
      save(STORAGE.clients, clients); renderAdminClients(); $('#statClients').textContent = clients.length;
    }
  }
  const delp = e.target.closest('[data-delpay]'); if (delp) {
    settings.payments = settings.payments.filter(p => p.id !== delp.dataset.delpay);
    save(STORAGE.settings, settings); renderPayments(); renderFooter(); toast('Eliminado');
  }
  const dels = e.target.closest('[data-delsub]'); if (dels) {
    subs = subs.filter(s => s.id !== dels.dataset.delsub);
    save(STORAGE.subs, subs); renderSubs();
  }
});

function openBoxEditor(id) {
  const editing = id ? boxes.find(b => b.id === id) : null;
  $('#editorTitle').textContent = editing ? 'Editar Caja' : 'Nueva Caja';
  const f = $('#boxForm');
  f.reset();
  f.id.value = editing?.id || '';
  if (editing) {
    f.name.value = editing.name || '';
    f.price.value = editing.price || '';
    f.image.value = editing.image || '';
    f.short.value = editing.short || '';
    f.description.value = editing.description || '';
    f.features.value = (editing.features || []).join('\n');
    f.whatsapp.value = editing.whatsapp || '';
    f.telegram.value = editing.telegram || '';
    f.facebook.value = editing.facebook || '';
    f.phone.value = editing.phone || '';
    f.moreInfo.value = editing.moreInfo || '';
  }
  renderDownloads(editing?.downloads || []);
  openModal('#boxEditor');
}

function renderDownloads(items) {
  const wrap = $('#downloadsWrap');
  wrap.innerHTML = items.map((d, i) => downloadRow(d, i)).join('') || downloadRow({}, 0);
}
function downloadRow(d = {}, i) {
  return `<div class="row" data-dl style="margin-bottom:8px">
    <input placeholder="Etiqueta" data-dl-label value="${escapeHtml(d.label || '')}" />
    <div style="display:flex;gap:6px">
      <input placeholder="URL" data-dl-url value="${escapeHtml(d.url || '')}" style="flex:1" />
      <button type="button" class="btn btn-ghost btn-sm" data-removedl>&times;</button>
    </div>
  </div>`;
}
$('#addDownload').addEventListener('click', () => {
  $('#downloadsWrap').insertAdjacentHTML('beforeend', downloadRow({}, 0));
});
$('#downloadsWrap').addEventListener('click', e => {
  if (e.target.closest('[data-removedl]')) e.target.closest('[data-dl]').remove();
});

$('#imageFile').addEventListener('change', e => {
  const file = e.target.files[0]; if (!file) return;
  if (file.size > 800 * 1024) return toast('Imagen muy grande (máx ~800KB)');
  const r = new FileReader();
  r.onload = () => { $('#boxForm').image.value = r.result; toast('Imagen cargada'); };
  r.readAsDataURL(file);
});

$('#boxForm').addEventListener('submit', e => {
  e.preventDefault();
  const f = e.target;
  const downloads = $$('[data-dl]', $('#downloadsWrap')).map(row => ({
    label: row.querySelector('[data-dl-label]').value.trim(),
    url: row.querySelector('[data-dl-url]').value.trim()
  })).filter(d => d.url);
  const data = {
    id: f.id.value || cryptoId(),
    name: f.name.value.trim(),
    price: parseFloat(f.price.value) || 0,
    image: f.image.value.trim(),
    short: f.short.value.trim(),
    description: f.description.value.trim(),
    features: f.features.value.split('\n').map(s => s.trim()).filter(Boolean),
    downloads,
    whatsapp: f.whatsapp.value.trim(),
    telegram: f.telegram.value.trim(),
    facebook: f.facebook.value.trim(),
    phone: f.phone.value.trim(),
    moreInfo: f.moreInfo.value.trim()
  };
  if (!data.name) return toast('Nombre requerido');
  const ix = boxes.findIndex(b => b.id === data.id);
  if (ix >= 0) boxes[ix] = data; else boxes.push(data);
  save(STORAGE.boxes, boxes);
  renderBoxes(); renderAdminBoxes(); closeModals(); toast('Caja guardada');
});

/* ============ Admin: Clients ============ */
function renderAdminClients() {
  $('#adminClientList').innerHTML = clients.map(c => `
    <div class="admin-item">
      <div style="width:60px;height:60px;border-radius:50%;background:var(--grad-primary);display:grid;place-items:center;font-weight:700;font-size:20px;flex-shrink:0">
        ${escapeHtml((c.name || '?')[0].toUpperCase())}
      </div>
      <div class="info">
        <strong>${escapeHtml(c.name)}</strong>
        <small>
          <i class="fa-solid fa-phone"></i> ${escapeHtml(c.phone)}
          ${c.email ? ` · <i class="fa-solid fa-envelope"></i> ${escapeHtml(c.email)}` : ''}
          ${c.box ? ` · 📦 ${escapeHtml(c.box)}` : ''}
        </small>
        <small style="display:block;margin-top:4px">${escapeHtml(c.message || '')}</small>
        <small style="display:block;color:var(--muted);margin-top:4px">${new Date(c.date).toLocaleString()}</small>
      </div>
      <div class="actions">
        ${c.phone ? `<a class="btn btn-ghost btn-sm" target="_blank" rel="noopener" href="${waLink(c.phone)}" title="WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>` : ''}
        <button class="btn btn-ghost btn-sm" data-delclient="${c.id}" style="color:var(--accent)"><i class="fa-solid fa-trash"></i></button>
      </div>
    </div>
  `).join('') || `<p class="muted">No hay solicitudes todavía.</p>`;
  $('#statClients').textContent = clients.length;
}

/* ============ Admin: Contacts ============ */
function loadContactsForm() {
  const f = $('#contactsForm');
  f.phone.value = settings.contacts.phone || '';
  f.email.value = settings.contacts.email || '';
  f.schedule.value = settings.contacts.schedule || '';
  f.address.value = settings.contacts.address || '';
}
$('#contactsForm').addEventListener('submit', e => {
  e.preventDefault();
  const f = e.target;
  settings.contacts = {
    phone: f.phone.value.trim(),
    email: f.email.value.trim(),
    schedule: f.schedule.value.trim(),
    address: f.address.value.trim()
  };
  save(STORAGE.settings, settings);
  renderTopbar(); renderBottomContacts(); renderContactGrid(); renderFooter();
  toast('Contactos actualizados');
});

/* ============ Admin: Payments ============ */
function renderPayments() {
  $('#paymentsList').innerHTML = (settings.payments || []).map(p => `
    <div class="admin-item">
      <div style="width:50px;height:50px;border-radius:10px;background:var(--grad-primary);display:grid;place-items:center;flex-shrink:0"><i class="fa-solid fa-credit-card"></i></div>
      <div class="info">
        <input data-payname="${p.id}" value="${escapeHtml(p.name)}" placeholder="Nombre (ej: Zelle)" />
        <input data-paydet="${p.id}" value="${escapeHtml(p.details || '')}" placeholder="Detalles (cuenta, etc)" style="margin-top:6px" />
      </div>
      <div class="actions">
        <button class="btn btn-ghost btn-sm" data-delpay="${p.id}" style="color:var(--accent)"><i class="fa-solid fa-trash"></i></button>
      </div>
    </div>
  `).join('') || `<p class="muted">Sin métodos de pago.</p>`;
  $$('[data-payname]').forEach(i => i.addEventListener('input', e => {
    const p = settings.payments.find(x => x.id === e.target.dataset.payname);
    if (p) { p.name = e.target.value; save(STORAGE.settings, settings); renderFooter(); }
  }));
  $$('[data-paydet]').forEach(i => i.addEventListener('input', e => {
    const p = settings.payments.find(x => x.id === e.target.dataset.paydet);
    if (p) { p.details = e.target.value; save(STORAGE.settings, settings); }
  }));
}
$('#addPaymentBtn').addEventListener('click', () => {
  settings.payments.push({ id: cryptoId(), name: 'Nuevo', details: '' });
  save(STORAGE.settings, settings); renderPayments();
});

/* ============ Admin: Social ============ */
function loadSocialForm() {
  const f = $('#socialForm');
  Object.entries(settings.social).forEach(([k,v]) => { if (f[k]) f[k].value = v || ''; });
}
$('#socialForm').addEventListener('submit', e => {
  e.preventDefault();
  const f = e.target;
  ['whatsapp','telegram','facebook','instagram','youtube','twitter','tiktok','emailLink'].forEach(k => {
    settings.social[k] = (f[k]?.value || '').trim();
  });
  save(STORAGE.settings, settings);
  renderSocialRail(); renderContactGrid();
  toast('Redes sociales actualizadas');
});

/* ============ Admin: Newsletter subs ============ */
function renderSubs() {
  $('#subsList').innerHTML = subs.map(s => `
    <div class="admin-item">
      <div style="width:40px;height:40px;border-radius:50%;background:var(--grad-primary);display:grid;place-items:center;flex-shrink:0"><i class="fa-solid fa-envelope"></i></div>
      <div class="info"><strong>${escapeHtml(s.email)}</strong><small>${new Date(s.date).toLocaleString()}</small></div>
      <div class="actions"><button class="btn btn-ghost btn-sm" data-delsub="${s.id}" style="color:var(--accent)"><i class="fa-solid fa-trash"></i></button></div>
    </div>
  `).join('') || `<p class="muted">Aún no hay suscriptores.</p>`;
}
$('#exportSubsBtn').addEventListener('click', () => {
  if (!subs.length) return toast('Sin suscriptores');
  const csv = 'email,fecha\n' + subs.map(s => `${s.email},${s.date}`).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `suscriptores-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
});

/* ============ Code Lock (ofuscación fuente) ============ */
function applyCodeLock() {
  // Cuando está activo: desactiva DevTools inspect en el DOM visual,
  // bloquea click derecho, bloquea atajos de teclado de DevTools.
  // Esto NO protege contra extracción técnica avanzada,
  // pero disuade acceso casual / visual al código.
  const on = !!settings.lockCode;
  if (on) {
    document.addEventListener('contextmenu', _blockCtx, true);
    document.addEventListener('keydown', _blockDevKeys, true);
    document.addEventListener('selectstart', _blockSelect, true);
  } else {
    document.removeEventListener('contextmenu', _blockCtx, true);
    document.removeEventListener('keydown', _blockDevKeys, true);
    document.removeEventListener('selectstart', _blockSelect, true);
  }
}
function _blockCtx(e) { e.preventDefault(); e.stopImmediatePropagation(); return false; }
function _blockSelect(e) {
  // solo bloquear selección fuera de inputs/textarea
  if (['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)) return;
  e.preventDefault();
}
function _blockDevKeys(e) {
  // F12, Ctrl+Shift+I/J/C/U, Ctrl+U (ver código fuente)
  if (e.key === 'F12') { e.preventDefault(); return; }
  if (e.ctrlKey && e.shiftKey && ['i','I','j','J','c','C'].includes(e.key)) { e.preventDefault(); return; }
  if (e.ctrlKey && ['u','U'].includes(e.key)) { e.preventDefault(); return; }
  if (e.metaKey && e.altKey && ['i','I','j','J','c','C'].includes(e.key)) { e.preventDefault(); return; }
}

/* ============ Admin: Security ============ */
/* ============ Admin: System (site name) ============ */
function loadSystemForm() {
  const inp = $('#siteNameInput');
  if (!inp) return;
  inp.value = settings.siteName || 'UNLOCK BOX';
  updateSystemPreview();
  // Sync lockCode toggle
  const tog = $('#lockCodeToggle');
  if (tog) tog.checked = !!settings.lockCode;
}
function updateSystemPreview() {
  const v = ($('#siteNameInput')?.value || '').trim() || 'UNLOCK BOX';
  const prev = $('#siteNamePreview');
  if (prev) prev.innerHTML = brandMarkup(v);
}
document.addEventListener('input', e => {
  if (e.target && e.target.id === 'siteNameInput') updateSystemPreview();
});
(function bindSystemForm(){
  const f = $('#systemForm');
  if (!f) return;
  f.addEventListener('submit', e => {
    e.preventDefault();
    const v = (f.siteName.value || '').trim();
    if (!v) return toast('Escribe un nombre');
    if (v.length > 40) return toast('Nombre demasiado largo');
    settings.siteName = v;
    const lct = $('#lockCodeToggle');
    settings.lockCode = lct ? lct.checked : false;
    save(STORAGE.settings, settings);
    renderBrand();
    applyCodeLock();
    toast('Sistema actualizado');
  });
})();

$('#securityForm').addEventListener('submit', async e => {
  e.preventDefault();
  const f = e.target;
  const auth = await ensureAuth();
  const curHash = await sha256(f.current.value);
  if (curHash !== auth.passHash) return toast('Contraseña actual incorrecta');
  const newp = f.newPass.value, newp2 = f.newPass2.value;
  if (newp || newp2) {
    if (newp !== newp2) return toast('Las contraseñas no coinciden');
    if (newp.length < 3) return toast('Contraseña muy corta');
    auth.passHash = await sha256(newp);
  }
  if (f.question.value.trim()) auth.question = f.question.value.trim();
  if (f.answer.value.trim()) auth.answerHash = await sha256(f.answer.value.trim().toLowerCase());
  save(STORAGE.auth, auth);
  f.reset();
  toast('Seguridad actualizada');
});

/* ============ Export / Import ============ */
$('#exportBtn').addEventListener('click', () => {
  const data = JSON.stringify({ boxes, clients, settings, subs, exportedAt: new Date().toISOString() }, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `unlockbox-backup-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  toast('Backup descargado');
});
$('#importFile').addEventListener('change', e => {
  const file = e.target.files[0]; if (!file) return;
  const r = new FileReader();
  r.onload = () => {
    try {
      const data = JSON.parse(r.result);
      if (data.boxes) { boxes = data.boxes; save(STORAGE.boxes, boxes); }
      if (data.clients) { clients = data.clients; save(STORAGE.clients, clients); }
      if (data.settings) { settings = data.settings; save(STORAGE.settings, settings); }
      if (data.subs) { subs = data.subs; save(STORAGE.subs, subs); }
      renderAll(); renderAdminBoxes(); renderAdminClients(); renderPayments(); renderSubs(); loadContactsForm(); loadSocialForm();
      toast('Datos importados');
    } catch { toast('Archivo inválido'); }
  };
  r.readAsText(file);
});

/* ============ Init ============ */
ensureAuth();
renderAll();
$('#statClients').textContent = clients.length;
$('#year').textContent = new Date().getFullYear();
