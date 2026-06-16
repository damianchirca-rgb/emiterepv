// ─── Service Worker Mentenanță PWA v12.0 ──────────────────────
const CACHE_NAME = 'mentenanta-v12.1';
const ASSETS = ['/emiterepv/', '/emiterepv/index.html', '/emiterepv/icon.svg', '/emiterepv/manifest.json'];

// La instalare
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

// La activare: sterge cache-urile vechi
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// La fetch
self.addEventListener('fetch', event => {
  const url = event.request.url;

  // Lasa TOATE request-urile externe sa treaca neinterceptate
  if (!url.startsWith(self.location.origin)) return;

  // Doar fisierele aplicatiei sunt cached
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.ok && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') self.skipWaiting();
});
