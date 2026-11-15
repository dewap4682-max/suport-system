# 🎮 PS Rent POS

**Aplikasi kasir (POS) untuk rental PlayStation** — jalan di HP, tablet, dan komputer.
Dipasang sebagai aplikasi (PWA), **bekerja penuh tanpa internet**, data tersimpan di perangkat Anda.

> Dikembangkan oleh **Bolangcorp** · Bantuan & aktivasi WhatsApp **0813-9239-9300**

---

## ✨ Fitur

- **Timer per unit PS** — setiap meja punya jam sendiri, biaya dihitung otomatis mengikuti tarif per jam.
- **Tarif fleksibel** — tarif/jam per unit, minimum menit, pembulatan ke atas, tarif harian (jam × 8).
- **Kantin Kita** — jual minuman/mie/snack tanpa sesi PS, atau tambahkan ke tagihan sesi yang sedang berjalan. Stok ikut berkurang.
- **Struk & nota** — cetak ke printer thermal **58 mm / 80 mm** dengan spasi tepi rapi, atau kirim nota ke **WhatsApp** pelanggan.
- **Laporan** — harian / bulanan / tahunan, **1 halaman**, bisa disimpan sebagai gambar, dicetak (A4/A5/A3), atau dikirim ke owner via WhatsApp.
- **Catatan kas** — modal awal, pengeluaran, dan penghitung selisih uang di laci.
- **Pelanggan & kartu member QR** — kartu A4 (8 kartu/lembar), riwayat main pelanggan.
- **Sewa panjang** — perjanjian 12 jam / 24 jam / harian, dokumen 1 halaman + denda keterlambatan per jam.
- **Dua akun** — **Pemilik** (semua akses) dan **Penjaga** (khusus operasional).
- **Log aktivitas** — siapa mengubah apa dan kapan.
- **Cadangan** — unduh/pulihkan file `.json` atau hubungkan Google Drive.
- **Tema terang & gelap**, **data contoh 10 unit PS** yang bisa dihapus.

## 🚀 Publikasikan (GitHub Pages)

Ringkasnya:

1. Buat repositori baru di GitHub (boleh **Public**), lalu unggah **seluruh isi folder ini** ke repo tersebut.
2. Buka **Settings → Pages** → *Source*: **Deploy from a branch** → Branch **main**, folder **/ (root)** → **Save**.
3. Tunggu 1–3 menit, situs aktif di `https://<username>.github.io/<nama-repo>/`.

Langkah lengkap beserta tangkapan alur, penanganan masalah, dan cara memperbarui versi ada di
**[PANDUAN-UPLOAD.md](PANDUAN-UPLOAD.md)**.

## 📲 Pasang sebagai aplikasi (PWA)

| Perangkat | Caranya |
|---|---|
| **Android / Chrome** | Buka alamat situs → menu ⋮ → **Instal aplikasi** / **Tambahkan ke layar utama** |
| **iPhone / iPad / Safari** | Buka alamat situs → tombol **Bagikan** → **Add to Home Screen** |
| **Windows / macOS (Chrome/Edge)** | Ikon **Install** di bilah alamat → aplikasi terbuka di jendela sendiri |

Setelah dipasang, aplikasi tampil dengan ikon PlayStation dan bisa dibuka tanpa koneksi internet.

## 🔑 Akun bawaan

| Akun | PIN awal | Hak akses |
|---|---|---|
| **Pemilik** | `1234` | Semua: tarif, produk, setelan, laporan, hapus transaksi, lisensi |
| **Penjaga** | `5678` | Operasional: mulai sesi, pembayaran, kantin, laporan |

> **Segera ganti PIN** lewat **Setelan → Akun & Hak Akses** setelah aplikasi dipasang.

## 🧾 Lisensi

- **Demo 30 hari** — semua fitur terbuka, tanpa batasan.
- Setelah masa demo, aktifkan permanen dengan kode aktivasi dari Bolangcorp.
- Aktivasi & bantuan: **WhatsApp 0813-9239-9300**.

## 🗂️ Struktur berkas

```
index.html              # kerangka aplikasi
styles.css              # seluruh tampilan (tema terang & gelap, cetak struk/laporan)
app.js                  # logika aplikasi: sesi, tarif, transaksi, laporan, cadangan
manifest.webmanifest   # identitas PWA (nama, warna, 8 ikon)
sw.js                   # service worker — cache offline
icons/                  # ikon aplikasi semua ukuran
assets/units/           # foto unit PS3 / PS4 / PS5
assets/products/        # foto produk kantin
.nojekyll               # agar GitHub Pages tidak memproses berkas lewat Jekyll
```

## 🔒 Privasi data

Semua data transaksi disimpan **di perangkat Anda** (localStorage), tidak dikirim ke server mana pun.
Karena itu: **unduh cadangan** secara rutin lewat **Setelan → Data & Cadangan**, terutama sebelum
mengganti HP atau membersihkan data peramban.

---

Dikembangkan oleh **Bolangcorp** · WhatsApp **0813-9239-9300**
