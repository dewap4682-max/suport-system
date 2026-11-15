/* ============================================================
   Service Worker — Suport System
   ------------------------------------------------------------
   Tujuan: website tetap terbuka saat sinyal jelek / offline,
   dan pembaruan isi langsung terpakai setelah halaman di-reload.

   Strategi:
     HTML + manifest  → network-first  (isi selalu yang terbaru)
     CSS/JS/gambar    → stale-while-revalidate (cepat, tetap segar)
     Halaman lain     → network-first, cadangan cache, lalu offline.html
     Request non-GET (abacus /hit) tidak pernah disimpan.

   Naikkan VERSI setiap kali mengubah berkas inti, supaya cache
   lama dibuang.
   ============================================================ */
var VERSI = 'ss-v1.2.0';
var CACHE_INTI = VERSI + '-inti';
var CACHE_GAMBAR = VERSI + '-gambar';

var BERKAS_INTI = [
  './',
  './index.html',
  './offline.html',
  './manifest.webmanifest',
  './css/styles.css',
  './css/fonts.css',
  './js/app.js',
  './assets/img/logo-mark.png',
  './assets/img/logo-mark-white.png',
  './assets/img/icon-192.png',
  './assets/img/icon-maskable-192.png',
  './assets/img/favicon.png',
  './assets/img/apple-touch-icon.png',
  /* poster galeri ikut disimpan supaya galeri tetap tampil saat offline (±1,1 MB) */
  './assets/img/galeri/tim-suport.jpg',
  './assets/img/galeri/futsal.jpg',
  './assets/img/galeri/rentbook.jpg',
  './assets/img/galeri/i-kos.jpg',
  './assets/img/galeri/pos-umkm.jpg',
  './assets/img/galeri/dokter-gigi.jpg',
  './assets/img/galeri/toko-klontong.jpg',
  './assets/img/galeri/website-umkm.jpg'
];

/* ---------- pasang ---------- */
self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_INTI).then(function (c) {
      // satu berkas gagal jangan sampai membatalkan seluruh pemasangan
      return Promise.all(BERKAS_INTI.map(function (u) {
        return c.add(new Request(u, { cache: 'reload' })).catch(function () {});
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

/* ---------- aktif: buang cache versi lama ---------- */
self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (nama) {
      return Promise.all(nama.map(function (n) {
        return (n !== CACHE_INTI && n !== CACHE_GAMBAR) ? caches.delete(n) : null;
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

/* ---------- bantu: simpan ke cache ---------- */
function simpan(nama, req, res) {
  if (res && res.status === 200 && res.type !== 'opaque') {
    var salinan = res.clone();
    caches.open(nama).then(function (c) { c.put(req, salinan); });
  }
  return res;
}

/* ---------- ambil ---------- */
self.addEventListener('fetch', function (e) {
  var req = e.request;

  if (req.method !== 'GET') return;                 // penghitung pesanan: jangan disentuh
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;  // abacus / WhatsApp: langsung ke jaringan

  /* folder /notaku/ punya service worker sendiri — jangan di-cache di sini
     agar tidak dobel dan tidak bentrok saat pembaruan */
  var dasarScope = new URL(self.registration.scope).pathname;
  if (url.pathname.indexOf(dasarScope + 'notaku/') === 0) return;
  if (url.pathname.indexOf(dasarScope + 'ps-rent/') === 0) return;

  var html = req.mode === 'navigate' ||
             (req.headers.get('accept') || '').indexOf('text/html') > -1;

  /* --- HTML & manifest: network-first --- */
  if (html || url.pathname.endsWith('manifest.webmanifest')) {
    var dasar = new URL(self.registration.scope).pathname;   // mis. /suport-system/
    var akar = url.pathname === dasar || url.pathname === dasar + 'index.html';
    e.respondWith(
      fetch(req).then(function (res) { return simpan(CACHE_INTI, req, res); })
        .catch(function () {
          return caches.match(req).then(function (hit) {
            if (hit) return hit;
            // halaman tak dikenal: beranda kalau alamatnya beranda,
            // selain itu tampilkan halaman "sedang offline" yang jujur
            return akar
              ? caches.match('./index.html').then(function (i) { return i || caches.match('./offline.html'); })
              : caches.match('./offline.html');
          });
        })
    );
    return;
  }

  /* --- CSS / JS / gambar: stale-while-revalidate --- */
  if (/\.(css|js|png|jpe?g|svg|webp|woff2?|ico)$/i.test(url.pathname)) {
    var nama = /\.(png|jpe?g|svg|webp|ico)$/i.test(url.pathname) ? CACHE_GAMBAR : CACHE_INTI;
    e.respondWith(
      caches.match(req).then(function (hit) {
        var ambil = fetch(req).then(function (res) {
          return simpan(nama, req, res);
        }).catch(function () { return hit; });
        return hit || ambil;
      })
    );
  }
});

/* ---------- pesan dari halaman ---------- */
self.addEventListener('message', function (e) {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
  if (e.data === 'VERSI' && e.source) e.source.postMessage({ versi: VERSI });
});
