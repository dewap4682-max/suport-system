# Pakai Domain Sendiri di GitHub Pages — Panduan Lengkap

**Sekarang:** `https://dewap4682-max.github.io/suport-system/`
**Setelah domain sendiri:** `https://suportsystem.id` (atau `suportsystem.my.id`)

> **Hosting tetap GRATIS.** GitHub Pages tidak menarik biaya walaupun Anda memakai domain sendiri.
> Yang berbayar hanya domainnya — sekitar **Rp 10.000 – Rp 270.000 per tahun**.

---

## 1. Kenapa perlu domain sendiri?

| | `github.io/suport-system` | `suportsystem.id` |
|---|---|---|
| Kesan profesional | terlihat seperti proyek/portofolio | terlihat seperti perusahaan |
| SEO lokal Solo Raya | sinyal lokasi lemah | ekstensi `.id` = sinyal Indonesia |
| Kepercayaan calon pembeli | sering ditanya "ini benar usaha?" | langsung dipercaya |
| Fleksibel pindah hosting | URL ikut berubah | URL tetap, hosting bisa diganti kapan saja |
| Biaya | Rp 0 | ± Rp 10.000–270.000 / tahun |

---

## 2. Pilih nama domain (saran untuk Anda)

| Domain | Estimasi harga/tahun | Catatan |
|---|---|---|
| `suportsystem.id` | **Rp 219.000 – 273.000** | paling pas untuk citra perusahaan |
| `suportsystem.my.id` | **Rp 9.900 – 35.000** | paling hemat, resmi PANDI, cukup KTP |
| `suportsystem.web.id` | ± Rp 9.900 – 55.000 | alternatif murah |
| `suportsystem.co.id` | ± Rp 300.000 – 350.000 | perlu dokumen usaha (NIB/akta) |

Harga registrasi & perpanjangan **pertahun** (data 2026 dari DomaiNesia, IndoWebsite, DomainMurah):

- `.id` — daftar **Rp 219.000**, perpanjang **Rp 249.000** ([DomaiNesia](https://www.domainesia.com/tips/domain-murah/))
- `.id` — daftar **Rp 230.000** ([IndoWebsite](https://www.indowebsite.co.id/domain))
- `.my.id` — daftar **Rp 9.900**, perpanjang **Rp 35.000** ([DomaiNesia](https://www.domainesia.com/tips/domain-murah/))
- `.my.id` — promo **Rp 1.500** tahun pertama, perpanjang **Rp 13.000** ([DomainMurah](https://domainmurah.net/domain-my-id-murah))

**Rekomendasi saya:** mulai dari **`suportsystem.my.id`** (± Rp 10–35 rb) untuk uji pasar.
Kalau pesanan sudah rutin, naik ke **`suportsystem.id`** — tinggal ganti domain, isi website tidak perlu dibuat ulang.

---

## 3. Beli domain — langkah demi langkah

1. Buka registrar (pilih salah satu):
   - **DomaiNesia** — domaiNesia.com (support Bahasa Indonesia, DNS mudah)
   - **Niagahoster** — niagahoster.co.id
   - **IndoWebsite** — indowebsite.co.id (harga `.id` transparan)
   - **Cloudflare Registrar** — cloudflare.com (hanya `.com`/`.net`, harga modal, DNS tercepat)
2. Cari nama: `suportsystem.id` / `suportsystem.my.id` → **Cek**.
3. Kalau tersedia → **Keranjang** → pilih durasi **1 tahun** (jangan langsung 5 tahun).
4. Isi profil pemilik:
   - Untuk `.my.id`: cukup **KTP** (verifikasi PANDI)
   - Untuk `.id`: siapkan **KTP + swafoto/verifikasi**
   - Untuk `.co.id`: siapkan **dokumen usaha**
5. **Jangan beli add-on** yang tidak perlu (hosting, email premium, SSL berbayar) — GitHub sudah memberi **HTTPS gratis**.
6. Bayar (QRIS/transfer/kartu) → domain aktif biasanya **< 10 menit**.
7. Catat: **username & password panel DNS** registrar.

> ⚠️ **Penting:** aktifkan **Auto Renew** dan pastikan email pemilik aktif.
> Domain yang lupa diperpanjang bisa diambil orang lain, dan seluruh tautan website Anda mati.

---

## 4. Arahkan domain ke GitHub Pages

Masuk **panel DNS domain** di registrar, lalu tambahkan record berikut (hapus record `A`/`CNAME` bawaan yang bentrok):

### Untuk domain utama tanpa `www` (rekomendasi)

| Type | Name / Host | Value | TTL |
|---|---|---|---|
| `A` | `@` | `185.199.108.153` | 3600 |
| `A` | `@` | `185.199.109.153` | 3600 |
| `A` | `@` | `185.199.110.153` | 3600 |
| `A` | `@` | `185.199.111.153` | 3600 |
| `CNAME` | `www` | `dewap4682-max.github.io` | 3600 |

### Tambahan (opsional, IPv6)

| Type | Name | Value |
|---|---|---|
| `AAAA` | `@` | `2606:50c0:8000::153` |
| `AAAA` | `@` | `2606:50c0:8001::153` |
| `AAAA` | `@` | `2606:50c0:8002::153` |
| `AAAA` | `@` | `2606:50c0:8003::153` |

> Kalau registrar meminta **"Name"** tanpa `@`, isi kosong atau tulis domain penuh (`suportsystem.id`).
> **Jangan** membuat CNAME di `@` — itu akan menimpa A record.

---

## 5. Aktifkan di GitHub

1. Repo → **Settings** → **Pages**
2. Bagian **Custom domain** → isi `suportsystem.id` → **Save**
3. GitHub otomatis membuat file **`CNAME`** di repo (jangan hapus file ini!)
4. Tunggu **DNS check** berubah hijau — biasanya **5–30 menit**, maksimal 24 jam
5. Setelah hijau → centang **Enforce HTTPS** (sertifikat Let's Encrypt gratis, aktif otomatis)
6. Buka `https://suportsystem.id` — website tampil
7. `https://dewap4682-max.github.io/suport-system/` akan otomatis **dialihkan** ke domain baru

**Kalau DNS check gagal:** tunggu 1 jam lalu klik Save lagi; pastikan record A tepat 4 baris dan CNAME `www` mengarah ke `USERNAME.github.io` (tanpa `https://`, tanpa garis miring di akhir).

---

## 6. Sesuaikan isi website (saya sudah siapkan alatnya)

Setelah domain aktif, jalankan satu perintah di folder proyek:

```bash
python3 ganti-domain.py suportsystem.id
```

Yang otomatis berubah:

- `canonical`, `hreflang`, `og:url`, `og:image`, `twitter:image`
- seluruh `@id` / `url` / `image` pada **structured data JSON-LD**
- semua `<loc>` di **`sitemap.xml`**
- baris **Sitemap** di **`robots.txt`**
- file **`CNAME`** dibuat
- **`versi-satu-file.html`** ikut dibangun ulang

Ingin memakai `www.` sebagai alamat utama? Tambahkan `--www`:

```bash
python3 ganti-domain.py suportsystem.id --www
```

Setelah itu **commit & push** semua file (termasuk `CNAME`, `sitemap.xml`, `robots.txt`, `index.html`).

---

## 7. Setelah domain pindah — jangan lupa

1. **Google Search Console**
   - Tambah properti baru: `https://suportsystem.id` (Domain property juga bagus)
   - Submit ulang `https://suportsystem.id/sitemap.xml`
   - Properti lama `github.io` boleh dibiarkan (akan dialihkan otomatis)
2. **Google Business Profile** — perbarui URL website
3. **Instagram/Facebook/TikTok bio**, kartu nama, poster, dan pamflet APK — ganti tautan
4. **WhatsApp Business** — perbarui "Website" di profil bisnis
5. Uji di **search.google.com/test/rich-results** setelah 2–3 hari

---

## 8. Biaya total realistis

| Item | Biaya |
|---|---|
| Domain `.my.id` | Rp 10.000 – 35.000 / tahun |
| Domain `.id` | Rp 219.000 – 273.000 / tahun |
| Hosting GitHub Pages | **Rp 0** |
| HTTPS (SSL) | **Rp 0** |
| Email di domain sendiri | opsional, bisa gratis via Cloudflare Email Routing |
| **Total** | **mulai ± Rp 10.000 / tahun** |

---

## 9. Pertanyaan yang sering muncul

**Apakah website harus di-upload ulang setelah ganti domain?**
Tidak. Isi website tetap sama; yang berubah hanya alamat. Cukup isi Custom domain + file `CNAME`.

**Bisakah kembali ke `github.io`?**
Bisa. Hapus Custom domain di Settings → Pages, lalu jalankan `python3 ganti-domain.py dewap4682-max.github.io/suport-system` (atau kembalikan manual).

**Apakah perlu beli hosting lain?**
Tidak. GitHub Pages cukup untuk website statis seperti ini (gratis, cepat, HTTPS).

**Apakah `.my.id` bagus untuk usaha?**
Cukup untuk memulai dan tetap terlihat resmi karena berekstensi `.id` (resmi PANDI). Untuk citra perusahaan yang lebih kuat, `.id` lebih disarankan.

**Kalau saya beli domain di Niagahoster/DomaiNesia, apakah harus pakai hosting mereka?**
Tidak. Cukup pakai **DNS management**-nya saja, hosting tetap di GitHub Pages.
---

## 10. Ganti nama pengguna GitHub (`dewap4682-max` → nama lain)

Ini berbeda dari ganti domain, dan bisa dilakukan **sebelum atau tanpa** membeli domain.

**Penting:** `dewap4682-max` adalah **username** (bagian dari alamat URL).
Username GitHub **hanya boleh huruf, angka, dan tanda hubung** — jadi
`Web&Aplikasi Android` **tidak bisa** dipakai sebagai username (ada `&` dan spasi).
Nama itu dipakai sebagai **nama tampilan profil** (boleh bebas, ada `&` dan spasi).

### Dua hal yang berbeda

| | Username (URL) | Nama tampilan |
|---|---|---|
| Contoh | `web-aplikasi-android` | `Web & Aplikasi Android` |
| Mengubah alamat website | **Ya** → `web-aplikasi-android.github.io/suport-system/` | Tidak |
| Tempat mengatur | Settings → Account → **Change username** | Settings → **Public profile** → Name |

### Langkah

1. Buka **github.com/settings/admin** → **Change username**
2. Isi `web-aplikasi-android` (atau nama lain yang masih tersedia) → konfirmasi
3. **Settings → Public profile → Name** → isi `Web & Aplikasi Android`
4. Di folder proyek jalankan:
   ```bash
   python3 ganti-username.py web-aplikasi-android
   ```
   Skrip memperbarui canonical, `og:url`, `og:image`, seluruh JSON-LD, `sitemap.xml`,
   `robots.txt`, dokumen, dan membangun ulang `versi-satu-file.html`.
5. Upload ulang berkas yang berubah ke repo (branch `main`)
6. Settings → Pages → pastikan alamat baru tampil; buka `https://web-aplikasi-android.github.io/suport-system/`
7. Search Console → tambah properti baru + submit `sitemap.xml` yang baru

### Yang perlu diketahui sebelum memutuskan

- Repo lama **dialihkan** oleh GitHub untuk sementara, tetapi **alamat halaman (Pages) tidak selalu ikut dialihkan** → tautan lama bisa mati.
- Properti Search Console lama tidak otomatis pindah; harus didaftarkan ulang.
- Tautan yang sudah tersebar (bio Instagram, poster, chat pelanggan) menunjuk alamat lama.
- Nama lama bisa saja **diklaim orang lain** setelah dilepas.

**Saran saya:** kalau tujuannya hanya agar terlihat profesional di mata pelanggan,
cukup ganti **nama tampilan** (langkah 3) — gratis, tanpa risiko tautan mati.
Ganti username hanya jika Anda memang ingin alamatnya berubah, dan sebaiknya
**sekaligus** dengan membeli domain sendiri (bagian 1–7) supaya tidak dua kali kerja.
