// Cache Destroyer & Auto-Updater Service Worker
self.addEventListener('install', (e) => {
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(keys.map(k => caches.delete(k)));
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (e) => {
    // Always fetch fresh network content
    e.respondWith(fetch(e.request));
});
