/* Venture OS service worker - Phase 0
   Cache-first shell; network-first index.json; stale-while-revalidate docs;
   cache-first runtime for web fonts. (TECHNICAL_ARCHITECTURE.md v2.0 SS6.6/SS9) */
const CACHE = 'vos-cache-v15';
const SHELL = [
  './', './index.html', './app.js', './index.json', './manifest.webmanifest',
  './static/vendor/marked.min.js', './static/icons/icon-192.png', './static/icons/icon-512.png'
];

// Pre-cache with {cache:'reload'} so install bypasses the HTTP cache and always
// stores the freshly-deployed files (prevents stale-on-deploy cache poisoning).
async function precache() {
  const c = await caches.open(CACHE);
  await Promise.all(SHELL.map((u) =>
    fetch(new Request(u, { cache: 'reload' }))
      .then((res) => { if (res && (res.ok || res.type === 'opaque')) return c.put(u, res); })
      .catch(() => {})
  ));
}

self.addEventListener('install', (e) => {
  e.waitUntil(precache().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function networkFirst(req) {
  return fetch(req).then((res) => {
    const copy = res.clone();
    caches.open(CACHE).then((c) => c.put(req, copy));
    return res;
  }).catch(() => caches.match(req));
}

function staleWhileRevalidate(req) {
  return caches.open(CACHE).then((c) => c.match(req).then((cached) => {
    const net = fetch(req).then((res) => { c.put(req, res.clone()); return res; }).catch(() => cached);
    return cached || net;
  }));
}

function cacheFirst(req) {
  return caches.match(req).then((cached) => cached || fetch(req).then((res) => {
    const copy = res.clone();
    caches.open(CACHE).then((c) => c.put(req, copy));
    return res;
  }));
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).catch(() => caches.match('./index.html')));
    return;
  }
  if (url.host.i