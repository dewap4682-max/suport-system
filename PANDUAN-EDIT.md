# Panduan Singkat — Website Suport System

Struktur: `index.html` + `css/styles.css` + `js/app.js` + `assets/img/`.
Ada juga **`versi-satu-file.html`** (semua digabung jadi satu file) untuk dikirim
lewat WhatsApp/e-mail atau dibuka langsung tanpa folder.

---

## 1. Fitur interaktif

| Fitur | Cara pakai |
|---|---|
| **Pratinjau tampilan** (hero) | Tombol *Properti / UMKM* mengganti contoh tampilan & alamat domain |
| **Tab Manfaat** | UMKM ↔ Pemasaran properti |
| **Tombol UMKM / Properti** di bagian Paket | Mengubah nama paket, isi katalog, dan ringkasan harga |
| **Pilih Paket 1/2/3** (termasuk tombol di promo) | Memilih paket di formulir + scroll ke formulir |
| **Bandingkan semua fitur** | Membuka tabel perbandingan lengkap |
| **GoPay / Transfer bank** | Tab metode pembayaran; tombol **Salin** untuk nomor GoPay |
| **Formulir pemesanan** | Validasi nama & nomor WA → membuka WhatsApp dengan pesan otomatis (paket, harga, DP 50%) |
| **Countdown promo** | Otomatis menghitung sampai akhir bulan berjalan |
| **FAQ** | Akordeon buka–tutup |
| **Tombol WhatsApp** (header, kartu, melayang, footer) | Membuka chat ke 0813-9239-9300 |

---

## 2. Data yang perlu diubah

### a. Nomor WhatsApp
- Di `index.html`: cari `6281392399300` (muncul di beberapa tautan).
- Di `js/app.js`: variabel `WA_NUMBER = '6281392399300'`.
- Format: tanpa `+`, tanpa spasi, diawali `62`.

### b. Nomor GoPay (bagian Pembayaran)
```html
<span class="nb" id="gopayNumber">0813-9239-9300</span>
<button class="copy" ... data-copy="081392399300" ...>
```
Ganti nomor tampilan **dan** nilai `data-copy` (angka saja, tanpa strip).

### c. Harga & nama paket
`js/app.js` bagian atas:
```js
var PACKAGES = {
  '1': {price: 1000000, umkm: 'Paket 1 — Profil Bisnis', properti: 'Paket 1 — Daftar Properti Dasar'},
  ...
};
```
`price` = angka tanpa titik. Nama paket juga tampil di kartu harga — ubah
atribut `data-umkm` / `data-properti` di `index.html` (bagian `<section id="paket">`)
supaya konsisten.

### d. Teks, wilayah, FAQ
Semua teks biasa ada langsung di `index.html`. Cari kata yang ingin diubah,
misalnya `Surakarta`, `3–5 hari`, atau `0813-9239-9300`.

### e. Warna brand
Di `css/styles.css`, bagian `:root`:
```css
--ivory:#F6F2EA;  /* latar terang */
--ink:#0D1417;    /* hitam tinta */
--gold:#FFC20E;   /* kuning logo */
```

### f. Setelah mengubah berkas
Perbarui versi satu file:
```bash
python3 build-onefile.py
```

---

## 3. Catatan

- **Pratinjau di dalam aplikasi** berjalan di iframe tanpa akses jaringan, sehingga
  tautan WhatsApp tidak bisa terbuka di sana. Buka lewat browser atau setelah
  di-hosting (GitHub Pages) — semua tombol WA berfungsi normal.
- Tidak ada data yang dikirim ke server. Formulir hanya menyusun pesan lalu
  membuka aplikasi WhatsApp pengguna.
- Nomor rekening bank sengaja **tidak** ditulis di halaman; pembeli diarahkan
  meminta detail rekening lewat WhatsApp agar selalu akurat.
- Langkah upload + mengaktifkan GitHub Pages ada di `README.md`.
