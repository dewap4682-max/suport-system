/* ============================================================
   Notaku POS — service worker
   ------------------------------------------------------------
   Tugas:
     • membuat aplikasi bisa dipasang (PWA) dan dibuka tanpa sinyal
     • tetap mengambil versi terbaru saat perangkat online

   Strategi:
     Navigasi (HTML)  → network-first, cadangan cache, lalu halaman depan
     Berkas statis    → cache-first, lalu jaringan (diperbarui di latar)
     Request non-GET  → dibiarkan lewat (tidak pernah disimpan)

   Lingkup otomatis: folder tempat berkas ini berada (/notaku/),
   sehingga tidak mengganggu halaman utama Suport System.

   Naikkan VERSI setiap kali mengunggah perbaikan aplikasi.
   ============================================================ */
var VERSI = 'notaku-pos-v2';
var CACHE = VERSI;
var INTI = [
  './',
  './index.html',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './manifest.webmanifest'
];

/* ---------- pasang ---------- */
self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return Promise.all(INTI.map(function (u) {
        return c.add(new Request(u, { cache: 'reload' })).catch(function () {});
      }));
    })
  );
});

/* ---------- aktif: buang cache versi lama ---------- */
self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (nama) {
      return Promise.all(nama.map(function (n) {
        // hanya hapus cache milik Notaku; jangan sentuh cache Suport System
        if (n !== CACHE && /^notaku-pos-v/.test(n)) return caches.delete(n);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

/* ---------- ambil ---------- */
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;

  var url;
  try { url = new URL(req.url); } catch (err) { return; }
  if (url.origin !== self.location.origin) return;      // WhatsApp/eksternal: lewat

  var navigasi = req.mode === 'navigate' ||
                 (req.headers.get('accept') || '').indexOf('text/html') > -1;

  /* --- halaman: network-first --- */
  if (navigasi) {
    e.respondWith(
      fetch(req).then(function (res) {
        if (res && res.ok) {
          var salinan = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, salinan); });
        }
        return res;
      }).catch(function () {
        return caches.match(req).then(function (hit) {
          return hit || caches.match('./index.html') || caches.match('./');
        });
      })
    );
    return;
  }

  /* --- berkas statis: cache-first --- */
  e.respondWith(
    caches.match(req).then(function (hit) {
      if (hit) {
        // perbarui diam-diam saat online
        fetch(req).then(function (res) {
          if (res && res.ok) {
            var salinan = res.clone();
            caches.open(CACHE).then(function (c) { c.put(req, salinan); });
          }
        }).catch(function () {});
        return hit;
      }
      return fetch(req).then(function (res) {
        if (res && res.ok && res.type === 'basic') {
          var salinan = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, salinan); });
        }
        return res;
      }).catch(function () {
        return caches.match('./index.html');
      });
    })
  );
});

/* ---------- pesan dari halaman ---------- */
self.addEventListener('message', function (e) {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
  /* halaman meminta dirinya disimpan (mis. kunjungan pertama sebelum SW aktif) */
  if (e.data && e.data.simpan) {
    e.waitUntil(caches.open(CACHE).then(function (c) {
      return c.add(new Request(e.data.simpan, { cache: 'reload' })).catch(function () {});
    }));
  }
});
