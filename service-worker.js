// Fru'eat Heaven – Service Worker v1.0
const CACHE_NAME = 'frueat-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Telepítéskor cache-elés
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Aktiváláskor régi cache törlése
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: network-first (mindig friss adat), fallback cache-re
self.addEventListener('fetch', event => {
  // API hívásokat ne cache-eljük
  if (event.request.url.includes('script.google.com') ||
      event.request.url.includes('fonts.googleapis.com') ||
      event.request.url.includes('api.zippopotam.us')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Friss választ cache-eljük is
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
