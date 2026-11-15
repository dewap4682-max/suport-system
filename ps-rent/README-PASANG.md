# PS Rent POS di Situs Suport System

Aplikasi kasir rental PlayStation sekarang ikut dipublikasikan bersama website Suport System.

**Alamat:** `https://dewap4682-max.github.io/suport-system/ps-rent/`

| Bagian | Isi |
|---|---|
| **Meja / Unit** | timer per unit PS3/PS4/PS5, mulai & stop sesi |
| **Billing** | tarif per jam, minimum menit, pembulatan, kantin, diskon, tunai/QRIS/transfer, kembalian |
| **Struk** | printer thermal 58/80 mm atau kirim ke WhatsApp pelanggan |
| **Sewa** | perjanjian 12 jam / 24 jam / harian + denda keterlambatan, siap cetak |
| **Transaksi & Laporan** | riwayat, rekap harian/bulanan/tahunan, ekspor gambar & PDF |
| **Kantin, Produk, Pelanggan** | stok, kartu member QR, riwayat main |
| **Setelan** | dua akun (Pemilik/Penjaga), cadangan `.json`, tema terang & gelap |

---

## 1. Berkas yang saya lengkapi

Berkas yang Anda unggah (`app.js`, `index-2.html`, `styles.css`, `sw.js`) **belum lengkap**
untuk bisa dipasang sebagai aplikasi — beberapa berkas yang dirujuk belum ada. Saya buatkan:

| Berkas | Status | Keterangan |
|---|---|---|
| `manifest.webmanifest` | **dibuat** | 6 ikon + 3 pintasan (Sesi, Kasir, Laporan) |
| `icons/` — 9 berkas | **dibuat** | favicon 32 & 96, apple-touch 180, 192/256/384/512, maskable 192 & 512 |
| `assets/units/ps3.jpg`, `ps4.jpg`, `ps5.jpg` | **dibuat** | 1200×800, dipakai kartu meja |
| `assets/products/` — 6 foto | **dibuat** | air mineral, teh botol, kopi sachet, mie instan, gorengan, rokok ketengan |
| `index-2.html` | diganti nama → `index.html` | nama berkas disesuaikan agar bisa dibuka langsung |
| `.nojekyll` | ditambahkan | agar GitHub Pages tidak menyaring folder tertentu |

> **Catatan soal ikon:** ikon dibuat **orisinil** (gambar gamepad + aksen hijau neon),
> **bukan** menyalin logo PlayStation. Logo PlayStation adalah merek dagang Sony —
> memakainya di aplikasi yang dijual bisa menimbulkan masalah hukum.
> Kalau Anda punya logo sendiri, cukup timpa berkas di `icons/` dengan ukuran yang sama.

Berkas asli lain tetap dipakai apa adanya: `app.js`, `styles.css`, `sw.js`,
`Panduan-Pengguna.pdf`, `PANDUAN-UPLOAD.md`, `README-PS.md`.

**Satu perbaikan pada `sw.js`:** versi aslinya menghapus **semua** cache di perangkat
saat aktif — kalau dibiarkan, membuka PS Rent akan menghapus cache situs Suport System
dan Notaku sehingga keduanya kehilangan mode offline. Sekarang hanya cache
`pspos-*` miliknya sendiri yang dibersihkan.

**Satu penyesuaian pada `app.js`:** nomor WhatsApp tidak lagi dicetak sebagai teks
(mengikuti aturan pemilik situs). Tombolnya tetap membuka chat WhatsApp yang sama.

---

## 2. Dua aplikasi kasir di satu situs

| Aplikasi | Alamat | Untuk |
|---|---|---|
| **Notaku POS** | `…/notaku/` | sembako, listrik, ATK, bangunan, warmindo, mukena, barbershop, salon, PKK |
| **PS Rent POS** | `…/ps-rent/` | rental PlayStation: timer, billing, sewa, kantin |

Keduanya berjalan berdampingan tanpa saling mengganggu:

| | Notaku | PS Rent |
|---|---|---|
| Service worker | `notaku/notaku-sw.js` | `ps-rent/sw.js` |
| Lingkup | `/suport-system/notaku/` | `/suport-system/ps-rent/` |
| Cache | `notaku-pos-v…` | `pspos-v…` |
| Membersihkan cache | hanya `notaku-pos-*` | hanya `pspos-*` |

Situs utama (`sw.js` di akar) sengaja **melewati** kedua folder itu, dan cache-nya
(`ss-v…`) tidak pernah disentuh aplikasi lain. Sudah diuji: ketiganya tetap bisa
dibuka saat tanpa sinyal.

---

## 3. Cara memasang di HP

**Android (Chrome)**
1. Buka `…/suport-system/ps-rent/`
2. Menu **⋮ → Instal aplikasi** (atau **Tambahkan ke layar utama**)

**iPhone / iPad (Safari)**
1. Buka alamatnya dengan **Safari**
2. **Bagikan** → **Tambahkan ke Layar Utama**

**Komputer (Chrome / Edge)** — ikon instal di bilah alamat.

**Akun bawaan:** Pemilik `1234`, Penjaga `5678` — **segera ganti** di
*Setelan → Akun & Hak Akses*.

---

## 4. Berkas yang perlu diunggah ke GitHub

Tambahkan seluruh folder **`ps-rent/`** ke repo `suport-system`:

```
ps-rent/
├── index.html                  (kerangka aplikasi)
├── app.js                      (logika: sesi, billing, sewa, laporan)
├── styles.css                  (tampilan + gaya cetak struk)
├── sw.js                       (service worker — offline)
├── manifest.webmanifest        (identitas PWA)
├── icons/                      (9 ikon)
├── assets/units/               (ps3.jpg, ps4.jpg, ps5.jpg)
├── assets/products/            (6 foto produk kantin)
├── Panduan-Pengguna.pdf
├── PANDUAN-UPLOAD.md
├── README-PS.md
├── README-PASANG.md            (berkas ini)
├── buat-aset.py                (pembuat ulang ikon & gambar)
└── .nojekyll
```

Ditimpa di akar repo: `index.html` (pita PS Rent), `css/styles.css`,
`manifest.webmanifest`, `sitemap.xml`, `sw.js`, `versi-satu-file.html`.

---

## 5. Memperbarui aplikasi

1. Ganti berkas yang berubah.
2. Naikkan versi di `ps-rent/sw.js`:
   ```js
   const VERSION = 'pspos-v1.6.3';   // → 'pspos-v1.6.4'
   ```
3. Unggah.

Tanpa menaikkan versi, HP pengguna masih memakai berkas lama dari cache.

Kalau ingin membuat ulang ikon atau foto produk:

```bash
cd ps-rent
python3 buat-aset.py
```

---

## 6. Hasil uji

| Yang diuji | Hasil |
|---|---|
| Judul & navigasi | 7 tab: Meja · Sewa · Transaksi · Laporan · Produk · Pelanggan · Setelan |
| Mulai sesi | modal tarif tampil, nama pelanggan tersimpan, sesi aktif **1/4** |
| Billing | timer berjalan, Rp 8.000/jam → tagihan 15 menit **Rp 2.000** |
| Kantin | Teh Botol Rp 5.000 masuk ke total → **Rp 7.000** |
| Pembayaran | Tunai / QRIS / Transfer, uang Rp 20.000, kembalian dihitung |
| Struk & transaksi | transaksi tercatat, omset harian ikut naik |
| Sewa | paket 12 jam / 24 jam / harian, harga harian Rp 64.000, denda per jam |
| PWA | Chrome **0 installability error**, manifest & ikon terbaca |
| Offline | PS Rent, Notaku, dan situs utama semuanya tetap terbuka |
| Nomor telepon | **tidak** tercetak sebagai teks di aplikasi |
| Lebar layar | tanpa geser horizontal di 360 / 390 / 768 / 1440 px |

---

## 7. Catatan

- **Lisensi & demo 30 hari** tidak diubah — kode aktivasi tetap memakai mekanisme aslinya.
- **Data** tersimpan di perangkat masing-masing (`localStorage`), tidak dikirim ke server.
  Ingatkan pengguna untuk mengunduh cadangan lewat *Setelan → Data & Cadangan*.
- **Merek PlayStation** milik Sony. Aplikasi ini menyebut nama tersebut untuk menjelaskan
  fungsinya (kasir rental PS). Ikon dan gambar dibuat orisinil, bukan aset Sony.
- Aplikasi ini **berbasis web (PWA)**, bukan APK Play Store.
