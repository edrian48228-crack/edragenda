const CACHE = 'taller-v22';
const ASSETS = [
  './','./index.html','./manifest.json',
  './css/styles.css',
  './js/db.js','./js/sync.js','./js/auth.js','./js/ui.js','./js/views.js','./js/app.js',
  './icons/icon-192.png','./icons/icon-512.png'
];
self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('message', e=>{ if(e.data==='SKIP_WAITING') self.skipWaiting(); });
// Network-first para HTML/JS/CSS — siempre ves los cambios; cae a cache si offline
self.addEventListener('fetch', e=>{
  if(e.request.method!=='GET') return;
  if(e.request.url.includes('api.github.com')) return;
  const url = new URL(e.request.url);
  const isShell = /\.(html|js|css)$/.test(url.pathname) || url.pathname.endsWith('/') || e.request.mode === 'navigate';
  if(isShell){
    e.respondWith(
      fetch(e.request).then(resp=>{
        const copy = resp.clone();
        caches.open(CACHE).then(c=>c.put(e.request, copy)).catch(()=>{});
        return resp;
      }).catch(()=> caches.match(e.request).then(r=> r || caches.match('./index.html')))
    );
    return;
  }
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).catch(()=>caches.match('./index.html'))));
});
