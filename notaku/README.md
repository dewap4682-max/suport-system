# Notaku POS — Satu untuk Semua Jenis Usaha

Aplikasi kasir (Point of Sale) berbasis web untuk semua jenis usaha Indonesia:
sembako/kelontong, toko listrik, ATK, toko bangunan, warmindo, mukena & busana muslim,
barbershop, salon & spa, serta kas & iuran PKK.

Setiap edisi adalah satu file HTML mandiri — berjalan offline, tanpa server, data tersimpan di perangkat.
Bisa dipasang sebagai aplikasi (PWA) di Android, iPhone/iPad, Windows, dan Mac.

## Demo 30 Hari & Aktivasi

- Semua edisi bisa dicoba **gratis selama 30 hari** sejak pertama dibuka.
- Setelah itu diperlukan **key aktivasi** — hubungi Bolangcrop:

  **WhatsApp 0813-9239-9300**
  Paket: **Sewa Bulanan** (30 hari, bisa diperpanjang) atau **Sekali Beli** (selamanya).

- Satu key berlaku untuk **semua edisi** Notaku POS, di semua perangkat dan browser.

## Isi Repositori

| File | Isi |
| --- | --- |
| `index.html` | Halaman depan (landing) — daftar 9 edisi |
| `notaku.html` | Edisi Sembako / Toko Umum (demo: Nota Penjualan Modern) |
| `notaku-listrik.html` | Edisi Toko Listrik (demo: Terang Jaya) |
| `notaku-atk.html` | Edisi Alat Tulis Kantor (demo: Sumber Ilmu) |
| `notaku-bangunan.html` | Edisi Toko Bangunan (demo: Sumber Makmur) |
| `notaku-warmindo.html` | Edisi Warmindo (demo: Warmindo Barokah) |
| `notaku-mukena.html` | Edisi Mukena & Busana Muslim (demo: Mukena Az-Zahra) |
| `notaku-barbershop.html` | Edisi Barbershop (demo: Panglima Barbershop) |
| `notaku-salon-spa.html` | Edisi Salon & Spa (demo: Arum Salon & Spa) |
| `notaku-pkk.html` | Edisi Kas & Iuran PKK (demo: PKK RT 03/RW 09) |
| `notaku-sw.js` | Service Worker — mode offline & install PWA |
| `Panduan-Notaku-POS.pdf` | Panduan instalasi & penggunaan lengkap |

## Cara Publikasikan ke GitHub Pages

1. Buat repositori baru di github.com (misalnya `notaku-pos`).
2. Upload **semua file di folder ini** ke root repositori:
   ```bash
   git init
   git add .
   git commit -m "Notaku POS v1.0"
   git branch -M main
   git remote add origin https://github.com/<username>/notaku-pos.git
   git push -u origin main
   ```
3. Buka **Settings → Pages** → Source: **Deploy from a branch** → Branch: **main** folder **/(root)** → **Save**.
4. Tunggu ±1 menit, lalu buka `https://<username>.github.io/notaku-pos/` —
   halaman depan menampilkan 9 edisi siap pasang.

> Catatan: mode instalasi PWA (ikon di layar utama + offline penuh) memerlukan akses lewat
> http(s) seperti GitHub Pages — bukan dibuka sebagai file `file://`.

## Fitur Utama

- Kasir cepat (katalog kiri, nota kasir kanan) · Diskon & pajak (PPN opsional)
- Cetak struk bergambar (58/80 mm) · Kirim struk via WhatsApp (gambar + caption)
- Stok otomatis berkurang · Riwayat & status nota (lunas/piutang) · Laporan penjualan
- Ekspor/impor data (cadangan) · Foto barang (opsional, tersimpan lokal)

## Lisensi & Hak Cipta

© 2026 Bolangcrop. Seluruh hak cipta dilindungi. Dilarang memperjualbelikan ulang
aplikasi ini sebagai produk pihak lain tanpa izin tertulis dari Bolangcrop.

**Dikembangkan oleh Bolangcrop** — WhatsApp 0813-9239-9300
