/* Retirement worker: remove old LifeGex caches and stop intercepting requests. */
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key.startsWith('lgx-')).map((key) => caches.delete(key))
      ))
      .then(() => self.registration.unregister())
      .then(() => self.clients.claim())
  );
});
