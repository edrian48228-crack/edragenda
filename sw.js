const CACHE = 'mi-agenda-v18-20260608-fixes';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {}))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const ks = await caches.keys();
    await Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Solo manejar recursos del mismo origen
  if (url.origin !== location.origin) return;

  const isHTML = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');

  if (isHTML) {
    // HTML: Cache-first con actualización en background, con fallback a index.html
    e.respondWith(
      caches.open(CACHE).then(async cache => {
        const cached = await cache.match(req) || await cache.match('./index.html') || await cache.match('./');
        const fetchPromise = fetch(req, { cache: 'no-store' })
          .then(res => { if (res && res.ok) cache.put(req, res.clone()); return res; })
          .catch(() => null);
        // Devolver cache instantáneamente si existe; si no esperar red; si red falla, fallback a index
        if (cached) return cached;
        const net = await fetchPromise;
        if (net) return net;
        const fallback = await cache.match('./index.html') || await cache.match('./');
        return fallback || new Response('<!doctype html><meta charset="utf-8"><title>Mi Agenda</title><body style="background:#0a0a0f;color:#fff;font-family:system-ui;padding:24px"><h1>Mi Agenda</h1><p>Estás sin conexión. Vuelve a abrir la app cuando tengas internet o instálala como app para usarla offline.</p><script>setTimeout(()=>location.reload(),3000)</script>', { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      })
    );
  } else {
    // Assets: Cache-first, fetch si no está en cache, guardar en cache
    e.respondWith(
      caches.match(req).then(cached => {
        if (cached) return cached;
        return fetch(req).then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(req, clone));
          }
          return res;
        }).catch(() => new Response('', { status: 503 }));
      })
    );
  }
});

self.addEventListener('sync', e => {
  if (e.tag === 'sync-agenda') {
    e.waitUntil(
      self.clients.matchAll().then(cs => cs.forEach(c => c.postMessage({ type: 'SYNC_NOW' })))
    );
  }
});
