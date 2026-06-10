// ─── Service Worker Mentenanță PWA ───────────────────────────
const CACHE_NAME = 'mentenanta-v5.4';
const ASSETS = ['/', '/index.html', '/icon.svg', '/manifest.json'];

// La instalare: pune fișierele în cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  // Activează imediat fără să aștepte tab-uri vechi
  self.skipWaiting();
});

// La activare: șterge cache-urile vechi
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => {
          console.log('[SW] Sterg cache vechi:', k);
          return caches.delete(k);
        })
      )
    )
  );
  self.clients.claim();
});

// La fetch: Network first, fallback la cache
self.addEventListener('fetch', event => {
  // Nu intercepta request-uri catre Apps Script API
  if (event.request.url.includes('script.google.com')) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Dacă networkul merge, actualizează cache-ul
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // Network fail -> servește din cache
        return caches.match(event.request);
      })
  );
});

// Mesaj de la app: skip waiting (forțează activarea noii versiuni)
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') self.skipWaiting();
});
