const CACHE = 'mi-agenda-v4-20260523';
const ASSETS = ['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install', e=>{ self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS).catch(()=>{}))); });
self.addEventListener('activate', e=>{ e.waitUntil((async()=>{ const ks=await caches.keys(); await Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k))); await self.clients.claim(); })()); });
self.addEventListener('message', e=>{ if(e.data && e.data.type==='SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('fetch', e=>{
  const req = e.request;
  if(req.method!=='GET') return;
  const url = new URL(req.url);
  if(url.origin !== location.origin) return;
  const isHTML = req.mode==='navigate' || (req.headers.get('accept')||'').includes('text/html');
  if(isHTML){
    e.respondWith(fetch(req,{cache:'no-store'}).then(r=>{ const cp=r.clone(); caches.open(CACHE).then(c=>c.put(req,cp)); return r; }).catch(()=>caches.match(req).then(r=>r||caches.match('./index.html'))));
  } else {
    e.respondWith(caches.match(req).then(r=>r||fetch(req).then(rr=>{ const cp=rr.clone(); caches.open(CACHE).then(c=>c.put(req,cp)); return rr; })));
  }
});
self.addEventListener('sync', e=>{ if(e.tag==='sync-agenda'){ e.waitUntil(self.clients.matchAll().then(cs=>cs.forEach(c=>c.postMessage({type:'SYNC_NOW'})))); } });
