# Notaku POS di Situs Suport System

Aplikasi kasir Notaku POS sekarang ikut dipublikasikan bersama website Suport System.

| Alamat | Isi |
|---|---|
| `…/suport-system/notaku/` | halaman depan: daftar **9 edisi** |
| `…/suport-system/notaku/notaku.html` | edisi Sembako |
| `…/suport-system/notaku/notaku-listrik.html` | Toko Listrik |
| `…/suport-system/notaku/notaku-atk.html` | Alat Tulis Kantor |
| `…/suport-system/notaku/notaku-bangunan.html` | Toko Bangunan |
| `…/suport-system/notaku/notaku-warmindo.html` | Warmindo |
| `…/suport-system/notaku/notaku-mukena.html` | Mukena & Busana Muslim |
| `…/suport-system/notaku/notaku-barbershop.html` | Barbershop |
| `…/suport-system/notaku/notaku-salon-spa.html` | Salon & Spa |
| `…/suport-system/notaku/notaku-pkk.html` | Kas & Iuran PKK |
| `…/suport-system/notaku/Panduan-Notaku-POS.pdf` | panduan penggunaan |

Contoh lengkap:
**`https://dewap4682-max.github.io/suport-system/notaku/`**

---

## 1. Yang saya ubah dari berkas asli

| Perubahan | Alasan |
|---|---|
| Manifest inline (±97 KB per berkas) dipindah ke `manifest-<edisi>.webmanifest` | 9 berkas × 97 KB = ±870 KB terbuang; HTML tiap edisi kini **±97 KB lebih ringan** |
| Setiap edisi punya **identitas PWA sendiri** (`notaku-pos-sembako`, `notaku-pos-warmindo`, …) | 9 edisi tidak saling menimpa saat dipasang — bisa punya beberapa ikon sekaligus |
| Ikon diambil ke `icons/icon-192.png` & `icon-512.png` | dipakai bersama, tidak lagi ditanam berulang di tiap berkas |
| `notaku-sw.js` dirapikan | cache dibatasi pada folder `/notaku/`, tidak bertabrakan dengan service worker situs utama |
| Halaman ini menyimpan dirinya ke cache setelah dibuka | aplikasi tetap terbuka saat tanpa sinyal sejak kunjungan pertama |
| Halaman depan diberi manifest, tombol **Pasang aplikasi**, tautan balik ke Suport System | pengunjung tidak tersesat, bisa langsung memasang |
| Nomor WhatsApp **disembunyikan** dari teks | hanya bisa dihubungi lewat tombol/tautan WhatsApp, sesuai aturan pemilik situs |

Isi aplikasi (kasir, nota, stok, laporan, aktivasi) **tidak diubah** — hanya pembungkusan PWA-nya.

---

## 2. Cara memasang di HP

**Android (Chrome)**
1. Buka `…/suport-system/notaku/`
2. Ketuk tombol **Pasang aplikasi**, atau menu **⋮ → Instal aplikasi**
3. Pilih edisi usaha → ikon **Notaku <nama edisi>** muncul di layar utama

**iPhone / iPad (Safari)**
1. Buka halaman depan Notaku dengan **Safari**
2. Ketuk **Bagikan** → **Tambahkan ke Layar Utama**

**Komputer (Chrome / Edge)** — klik ikon instal di bilah alamat.

> Setiap edisi dipasang **terpisah**. Pemilik toko bangunan bisa punya ikon
> "Notaku Toko Bangunan" sendiri di layar utama, tanpa tercampur edisi lain.

---

## 3. Berkas yang perlu diunggah ke GitHub

Tambahkan seluruh folder **`notaku/`** ke repo `suport-system`:

```
notaku/
├── index.html                  (halaman depan 9 edisi)
├── notaku.html                 (edisi sembako)
├── notaku-listrik.html
├── notaku-atk.html
├── notaku-bangunan.html
├── notaku-warmindo.html
├── notaku-mukena.html
├── notaku-barbershop.html
├── notaku-salon-spa.html
├── notaku-pkk.html
├── manifest.webmanifest        (halaman depan)
├── manifest-sembako.webmanifest
├── manifest-listrik.webmanifest
├── manifest-atk.webmanifest
├── manifest-bangunan.webmanifest
├── manifest-warmindo.webmanifest
├── manifest-mukena.webmanifest
├── manifest-barbershop.webmanifest
├── manifest-salon-spa.webmanifest
├── manifest-pkk.webmanifest
├── notaku-sw.js
├── icons/icon-192.png
├── icons/icon-512.png
├── Panduan-Notaku-POS.pdf
├── README.md                   (dokumen asli Notaku)
├── README-PASANG.md            (berkas ini)
└── siapkan-manifest.py         (skrip penyiapan, tidak wajib diunggah)
```

Ditimpa di akar repo: `index.html` (pita promo Notaku), `css/styles.css` (§32),
`manifest.webmanifest` (pintasan Notaku), `sitemap.xml` (10 URL baru),
`sw.js` (melewati folder `/notaku/`), `versi-satu-file.html`.

> Skrip `siapkan-manifest.py` **sudah dijalankan**; unggahan pertama tidak perlu
> menjalankannya lagi. Jalankan hanya jika Anda mengganti berkas HTML Notaku
> dengan versi baru yang masih memakai manifest inline.

---

## 4. Memperbarui aplikasi Notaku

1. Timpa berkas HTML edisi yang berubah.
2. **Naikkan versi** di `notaku-sw.js`:
   ```js
   var VERSI = 'notaku-pos-v2';   // → 'notaku-pos-v3'
   ```
3. Unggah. Perangkat yang sudah memasang akan mengambil versi baru pada
   pembukaan berikutnya.

Kalau lupa menaikkan versi, halaman tetap terbaru (HTML bersifat
*network-first*), tetapi ikon dan berkas statis bisa tertahan di cache lama.

---

## 5. Cara memeriksa

```bash
# 1. manifest terbaca & JSON valid
python3 -c "import json,glob;[json.load(open(f)) for f in glob.glob('notaku/manifest*.webmanifest')];print('semua manifest valid')"

# 2. semua tautan edisi ada
python3 -c "import re,os;h=open('notaku/index.html').read();\
f=re.findall(r'\"f\": \"(notaku[^\"]+)\"',h);\
print([x for x in f if not os.path.exists('notaku/'+x)] or 'semua edisi ada')"
```

Di Chrome DevTools → **Application**: manifest per edisi terbaca, service worker
`notaku-sw.js` berstatus *activated*, dan folder `/notaku/` punya cache
`notaku-pos-v…` yang terpisah dari cache situs utama.

Hasil uji di lingkungan pengembangan: 9 kartu edisi tampil, Chrome melaporkan
**0 installability error** untuk halaman depan maupun tiap edisi, dan saat
mode offline halaman depan serta aplikasi kasir tetap terbuka penuh.

---

## 6. Catatan

- **Batas 1 GB GitHub Pages** — folder ini ±4,5 MB, aman.
- **Aktivasi 30 hari** tetap berjalan seperti aslinya; key aktivasi tidak diubah.
- **Data pengguna** tersimpan di perangkat masing-masing (`localStorage`),
  tidak dikirim ke server mana pun.
- Nomor WhatsApp tidak lagi tercetak sebagai teks. Tombol WhatsApp mengarah ke
  `wa.me/6281392399300` — nomor tetap sampai ke penerima setelah diklik.
