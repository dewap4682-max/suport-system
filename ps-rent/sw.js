/* PS Rent POS — service worker (offline-first app shell) */
const VERSION = 'pspos-v1.6.3';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-256.png',
  './icons/icon-384.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon.png',
  './icons/favicon-32.png',
  './assets/units/ps3.jpg',
  './assets/units/ps4.jpg',
  './assets/units/ps5.jpg',
  './assets/products/air-mineral.jpg',
  './assets/products/teh-botol.jpg',
  './assets/products/kopi-sachet.jpg',
  './assets/products/mie-instan.jpg',
  './assets/products/gorengan.jpg',
  './assets/products/rokok-ketengan.jpg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(VERSION)
      .then(cache => Promise.all(ASSETS.map(u => cache.add(u).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      // HANYA hapus cache milik PS Rent sendiri.
      // Jangan disentuh cache aplikasi lain di origin yang sama (Suport System, Notaku),
      // karena menghapus semuanya akan mematikan mode offline mereka.
      keys.filter(k => k.indexOf('pspos-') === 0 && k !== VERSION)
          .map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  // Navigasi: network-first, fallback ke cache (offline)
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(VERSION).then(c => c.put('./index.html', copy));
        return res;
      }).catch(() => caches.match('./index.html').then(r => r || caches.match('./')))
    );
    return;
  }

  // Aset statis: cache-first + update di belakang
  event.respondWith(
    caches.match(req).then(cached => {
      const network = fetch(req).then(res => {
        if (res && res.status === 200 && new URL(req.url).origin === self.location.origin) {
          const copy = res.clone();
          caches.open(VERSION).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
