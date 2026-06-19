/* Task 6: Service Worker with precache + runtime cache */
const CACHE = 'lgx-v2';
const PRECACHE = [
  '/',
  '/index.html',
  '/src/styles/main.css',
  '/src/main.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // API calls: network first, cache fallback
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(
      fetch(request).then((res) => {
        const clone = res.clone();
        caches.open(CACHE).then((cache) => cache.put(request, clone));
        return res;
      }).catch(() => caches.match(request))
    );
    return;
  }

  // Static assets: cache first
  e.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((res) => {
      const clone = res.clone();
      caches.open(CACHE).then((cache) => cache.put(request, clone));
      return res;
    }))
  );
});
