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
| **Aplikasi siap pakai** | Kartu I-KOS, POS Rentcar, POS Dokter Gigi, Jimpitan Ronda, POS UMKM, dan Aplikasi Custom — tombol *Pilih* mengisi formulir, atau pakai tautan *"atau pesan langsung via WhatsApp"* di tiap kartu |
| **Invoice otomatis** | Isi formulir → klik **Buat invoice & kirim via WhatsApp** → muncul invoice (nomor, rincian, DP 50%, GoPay) → tombol **Kirim invoice ke WhatsApp**, **Cetak / Simpan PDF**, dan **Lihat invoice terakhir** |
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

### c. Harga & nama paket website / aplikasi
`js/app.js` bagian atas:
```js
var PACKAGES = {
  '1':  {price: 1000000, type: 'web', umkm: 'Paket 1 — Profil Bisnis', properti: '...'},
  '2':  {price: 1500000, type: 'web', ...},
  '3':  {price: 2500000, type: 'web', ...},
  'ik': {price: 2500000, type: 'app', label: 'APK I-KOS — Pengelolaan Kos'},
  'rc': {price: 2500000, type: 'app', label: 'APK POS Rentcar — Rental Mobil'},
  'dg': {price: 4500000, type: 'app', label: 'APK POS Dokter Gigi'},
  'jr': {price: 1000000, type: 'app', label: 'APK Jimpitan Ronda — Kas & Ronda Warga'},
  'pu': {price: 1000000, type: 'app', label: 'APK POS UMKM — Kasir UMKM'}
};
```
`price` = angka tanpa titik. `type:'web'` memakai nama UMKM/Properti, `type:'app'`
memakai `label`. Harga yang tertera di kartu aplikasi juga ditulis di
`index.html` (bagian `<section id="aplikasi">`) — ubah keduanya agar konsisten.

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

---

## 4. Invoice

- Nomor invoice dibuat otomatis berurutan per hari: `INV/SS/YYYYMMDD/001` (disimpan di `localStorage`).
- Isi invoice: nama pemesan, nomor WA, item, ketentuan, harga, **DP 50%**, pelunasan, dan nomor **GoPay 0813-9239-9300**.
- Tombol **Cetak / Simpan PDF** memakai dialog cetak browser (CSS `@media print` hanya mencetak invoice, bukan halaman web).
- Untuk mengubah nomor GoPay di invoice, ubah teks `0813-9239-9300` dan `data-copy="081392399300"` di bagian `<!-- ============ INVOICE MODAL ============ -->` pada `index.html`.

---

## 5. Tampilan (desain v3)

- **Hero gelap**: warna diambil dari variabel `--ink` (latar) dan `--gold` (aksen) di `css/styles.css`.
  Untuk kembali ke hero terang, hapus class `hero--ink` pada `<section class="hero" id="beranda">`.
- **Action bar ponsel** (`#mobileBar`): muncul otomatis di layar ≤ 760 px; tombol WhatsApp & Buat invoice.
- **Carousel aplikasi di ponsel**: diatur di blok `@media (max-width:760px)` bagian `.app-grid`.
- **2 kolom di tablet**: blok `@media (min-width:761px) and (max-width:1024px)`.
- **Pita emas** (marquee): ubah teks pada elemen `.marquee-item` di `index.html`.

---

## 6. Mengatur harga di formulir

- **Harga paket** ada di `js/app.js` bagian `PACKAGES` (mis. `'2': { price: 1500000 ... }`). Mengubah angka di sana otomatis mengubah kartu harga? **Tidak** — kartu harga ditulis di `index.html`; ubah keduanya bila mengganti harga resmi.
- **Pengunjung boleh mengisi harga sendiri**: tombol `#hargaEdit` (teks “Ubah sendiri” / “Pakai harga paket”).
- **Kunci harga** (matikan isian manual): hapus tombol `<button ... id="hargaEdit">` di `index.html`; kolom harga tetap terisi otomatis dan read-only.
- **Mode custom**: opsi `wcust` dan `acust` di `<optgroup label="Custom — harga diisi sendiri">`. Menambah jenis custom baru cukup menambah opsi + entri `PACKAGES` bertipe `type: 'custom'`.
- **Batas minimal harga** (opsional): tambahkan pada validasi submit di `js/app.js` — `if (harga < 500000) { ... }`.

---

## 7. Keranjang pesanan (banyak layanan, satu invoice)

- Data pesanan tersimpan di variabel `orderItems` pada `js/app.js` (berisi `pkgId`, `name`, `price`, `kind`, `manual`).
- Tombol **Tambah ke daftar pesanan** memakai harga yang sedang tampil di kolom Harga — jadi harga isian manual ikut tersimpan per item.
- Item ganda dicegah: kombinasi **paket + harga yang sama** tidak bisa ditambahkan dua kali.
- `invoiceItems()` menentukan isi invoice: bila `orderItems` kosong → hanya paket yang dipilih.
- Untuk mengosongkan otomatis setelah invoice dibuat, tambahkan `orderItems = []; renderOrderList();` di handler `#invClose2`.
- Markup daftar: `#orderListWrap` (formulir) dan `#sumItems` (ringkasan); baris invoice dibuat dinamis di `#invRows`.

---

## 8. Nomor urut pemesan

- Konfigurasi ada di `js/app.js` bagian **NOMOR URUT PEMESAN**:
  `SEQ_BASE`, `SEQ_NS`, `SEQ_KEY`, `SEQ_BASELINE`, `SEQ_LOCAL_KEY`.
- Ganti `SEQ_NS` (mis. `suport-system-solo-2`) bila ingin memulai penghitung dari nol di namespace baru.
- `SEQ_BASELINE = 1` karena setiap penghitung disemai satu kali saat pemasangan. Bila Anda menyemai ulang
  (memanggil `/hit/...` manual), naikkan angka ini agar tampilan kembali ke 0.
- **Lencana produk**: `productKey(id)` → `produk-web-<id>`; tambah id baru di `refreshProductBadges()` bila menambah produk.
- **Nonaktifkan fitur**: hapus blok `NOMOR URUT PEMESAN` dan elemen `#seqPill`; invoice tetap berjalan tanpa nomor pesanan.
- **Reset nomor lokal** (per peramban): hapus kunci `ss_order_seq_v2` dan `ss_order_seq_online` di localStorage.
- **Ganti sumber penghitung**: ubah `SEQ_BASE` ke layanan lain dengan bentuk API `GET /hit/:ns/:key` → `{"value":n}`.
