const CACHE_NAME = 'bijli-meter-v2';
const FILES_TO_CACHE = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const isHtmlPage = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');

  if(isHtmlPage){
    // Network-first for the app page itself, so updates show up right away.
    event.respondWith(
      fetch(req)
        .then((res) => {
          caches.open(CACHE_NAME).then((cache) => cache.put(req, res.clone()));
          return res;
        })
        .catch(() => caches.match(req))
    );
  } else {
    // Cache-first for static assets (icons, manifest) — fast and works offline.
    event.respondWith(
      caches.match(req).then((cached) => cached || fetch(req))
    );
  }
});
