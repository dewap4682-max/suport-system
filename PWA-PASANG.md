# PWA — Website Suport System Bisa Dipasang Seperti Aplikasi

Sejak versi ini, `suport-system` adalah **PWA (Progressive Web App)**:
pengunjung bisa memasangnya ke layar utama HP dan membukanya layar penuh,
tanpa perlu unduh dari Play Store, **tanpa biaya developer**.

> **Hosting tetap GitHub Pages.** PWA tidak butuh server tambahan, tidak butuh
> akun Google Play, dan tidak menambah biaya sepeser pun.

---

## 1. Apa yang sudah ditambahkan

| Berkas | Fungsi |
|---|---|
| `manifest.webmanifest` | identitas aplikasi: nama, ikon, warna tema, pintasan menu |
| `sw.js` | service worker — cache offline + pendeteksi versi baru |
| `offline.html` | halaman khusus saat perangkat tanpa sinyal |
| `assets/img/icon-192.png` | ikon sudut membulat (Android/desktop) |
| `assets/img/icon-512.png` | ikon resolusi besar |
| `assets/img/icon-maskable-*.png` | ikon adaptif Android (tidak terpotong bentuk bulat/kotak) |
| `buat-ikon-pwa.py` | pembuat ulang semua ikon dari logo asli |
| `index.html` | `<link rel="manifest">`, meta iOS, tombol pasang, panel bawah |
| `css/styles.css` | §31 gaya tombol pasang, panel, dan mode aplikasi |
| `js/app.js` | modul `pwa()` — deteksi perangkat, tombol pasang, pendaftaran SW |

**Isi `manifest.webmanifest`**

- `name`: Suport System — Website & Aplikasi Android Solo Raya
- `short_name`: Suport System (nama di bawah ikon)
- `display`: `standalone` → tampil tanpa bilah alamat
- `theme_color` `#0D1417` (sama dengan `meta theme-color` di halaman)
- `background_color` `#F6F2EA`
- **4 pintasan** saat ikon ditekan lama: Paket · APK · Invoice · Galeri
- `start_url: ./?src=pwa` dan `scope: ./` → aman walau nanti pindah domain

---

## 2. Cara memasang di HP

### Android (Chrome)
1. Buka `https://dewap4682-max.github.io/suport-system/`
2. Ketuk tombol **Pasang aplikasi** (ikon ⬇ di kiri bawah), **atau** menu **⋮ → Instal aplikasi**
3. Ketuk **Instal** → ikon **Suport System** muncul di layar utama

### iPhone (Safari)
1. Buka di **Safari** (bukan Chrome — iOS hanya mengizinkan Safari untuk memasang)
2. Ketuk tombol **Bagikan** (kotak dengan panah ke atas)
3. **Tambahkan ke Layar Utama** → **Tambah**

### Komputer (Chrome / Edge)
1. Klik ikon **instal** di ujung kanan bilah alamat
2. Atau menu **⋮ → Instal Suport System**

Tombol **Pasang aplikasi** ada di dua tempat: tombol mengambang (kiri bawah di
ponsel, tumpukan kanan bawah di desktop) dan tombol di bagian footer.
Kalau perangkat sudah memasangnya, tombol itu hilang sendiri.

---

## 3. Yang berubah saat sudah terpasang

| | Sebelum | Sesudah dipasang |
|---|---|---|
| Tampilan | ada bilah alamat | layar penuh, terasa seperti aplikasi asli |
| Kecepatan buka | muat ulang penuh | langsung dari cache, hampir instan |
| Tanpa sinyal | halaman error peramban | tetap terbuka (`offline.html` bila halaman belum tersimpan) |
| Ikon | tidak ada | ikon di layar utama + 4 pintasan |
| Biaya | — | **Rp 0** |

---

## 4. Berkas yang WAJIB diunggah ke GitHub

Tambahan baru:

```
manifest.webmanifest
sw.js
offline.html
assets/img/icon-192.png
assets/img/icon-512.png
assets/img/icon-maskable-192.png
assets/img/icon-maskable-512.png
```

Ditimpa (isi berubah):

```
index.html
css/styles.css
js/app.js
assets/img/apple-touch-icon.png
assets/img/favicon.png (tidak berubah, boleh dilewati)
versi-satu-file.html
```

Setelah unggah, tunggu **GitHub Actions/Pages selesai (±1–2 menit)**, lalu buka
situs di HP. Kalau tombol pasang belum muncul, lakukan **hard refresh**:
Chrome Android → menu **⋮ → Muat ulang**; desktop → **Ctrl+Shift+R**.

> **Penting:** PWA hanya berjalan pada **HTTPS**. `github.io` sudah HTTPS
> otomatis, jadi tidak ada yang perlu diatur.

---

## 5. Cara memperbarui isi website

Normalnya cukup ubah `index.html` lalu unggah — pengunjung akan mendapat versi
baru saat koneksi tersedia (strategi **network-first** untuk HTML).

Supaya perangkat yang sudah memasang aplikasi ikut memperbarui **berkas inti**
(CSS, JS, gambar):

1. Buka `sw.js`, naikkan versinya:
   ```js
   var VERSI = 'ss-v1.0.3';   // → 'ss-v1.0.4'
   ```
2. Unggah `sw.js` (dan berkas yang berubah).
3. Pengunjung membuka aplikasi → SW baru terpasang → halaman otomatis **reload
   sekali** ke versi terbaru. Tidak perlu minta pengguna melakukan apa pun.

Kalau lupa menaikkan `VERSI`, pengunjung masih bisa mendapat konten terbaru
(tersimpan di latar belakang), tetapi berkas lama bisa bertahan sampai cache
dibersihkan.

---

## 6. Cara memeriksa (5 menit)

1. **Chrome DevTools** → tab **Application**
   - *Manifest*: nama & ikon terbaca, tidak ada peringatan merah
   - *Service Workers*: status **activated and is running**
   - *Cache Storage*: ada `ss-v1.0.x-inti` dan `ss-v1.0.x-gambar`
2. **Lighthouse** (DevTools → Lighthouse → kategori *Progressive Web App*) → target **Installable**
3. **Uji offline:** DevTools → tab *Network* → centang **Offline** → muat ulang
   halaman → website tetap terbuka
4. **Uji di HP:** buka di Chrome Android → pastikan tombol **Pasang aplikasi** muncul
5. **PageSpeed Insights** → `https://pagespeed.web.dev` (opsional)

Hasil uji di lingkungan pengembangan: Chrome melaporkan **0 installability error**,
service worker aktif, cache terisi 21 berkas inti + 4 gambar, dan galeri
tetap tampil penuh (7/7) saat mode offline.

---

## 7. Batasan yang perlu diketahui

- **iPhone tidak menampilkan tombol pasang otomatis.** Apple mewajibkan lewat
  menu Bagikan di Safari. Panel panduan di situs sudah mendeteksi iPhone dan
  menampilkan langkahnya.
- **Bukan aplikasi Play Store.** PWA tidak muncul di Play Store dan tidak bisa
  diakses lewat pencarian Play Store. Untuk itu perlu APK/AAB terpisah.
- **Fitur native terbatas.** Tidak ada akses kamera latar belakang, Bluetooth,
  atau notifikasi push tanpa layanan tambahan. Untuk website profil & katalog,
  semua yang dibutuhkan sudah tercakup.
- **Data pesanan tetap di perangkat.** Nomor urut & invoice memakai
  `localStorage` + penghitung daring, tidak berubah karena PWA.
- **`file://` tidak mendukung PWA.** Karena itu `versi-satu-file.html` otomatis
  menyembunyikan tombol pasang.

---

## 8. Kalau nanti pindah domain / ganti username

Tidak ada yang perlu diubah manual pada PWA — `start_url` dan `scope` memakai
path relatif (`./`), jadi ikut otomatis.

Yang perlu dijalankan hanya skrip yang sudah ada:

```bash
cd /home/user/suport-system
python3 ganti-domain.py suportsystem.id     # atau --www
python3 build-onefile.py
```

Lalu unggah seperti biasa. Pengecualian: kalau nanti situs dipindah ke
**subfolder** atau **repo berbeda**, ubah `"id"` dan `"scope"` pada
`manifest.webmanifest` agar sesuai.

---

## 9. Kalau ingin menjadikannya APK (opsional, nanti)

PWA bisa dibungkus menjadi APK tanpa menulis ulang kode:

- **PWABuilder** — `pwabuilder.com`, gratis, hasilkan APK/AAB untuk Play Store
- **Bubblewrap** — alat resmi Google, berbasis baris perintah

Yang dibutuhkan hanya URL website yang sudah HTTPS. Ini bisa jadi langkah
lanjutan setelah PWA stabil dan ada permintaan dari pelanggan.

---

## 10. Dua service worker di satu situs

Sejak folder `notaku/` ditambahkan, ada **dua service worker**:

| Berkas | Lingkup | Keterangan |
|---|---|---|
| `sw.js` (akar) | `/suport-system/` | situs utama; **melewati** folder `notaku/` |
| `notaku/notaku-sw.js` | `/suport-system/notaku/` | aplikasi kasir Notaku |

Ini sah dan disengaja: lingkup service worker dibatasi folder tempat berkasnya
berada. Situs utama tidak menyimpan apa pun dari `/notaku/`, sehingga cache tidak
dobel dan pembaruan Notaku tidak memaksa situs utama memuat ulang.

Kalau mengubah keduanya sekaligus, naikkan versi di **masing-masing** berkas:

```js
// sw.js
var VERSI = 'ss-v1.1.0';
// notaku/notaku-sw.js
var VERSI = 'notaku-pos-v2';
```
