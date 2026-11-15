# 🚀 Cara unggah PS Rent POS ke GitHub (GitHub Pages)

Panduan ini dibuat untuk pengguna yang **belum pernah memakai GitHub**. Ikuti berurutan, sekali saja.
Hasil akhir: aplikasi bisa dibuka di alamat `https://<username>.github.io/<nama-repo>/` dan dipasang di HP.

---

## 1. Siapkan akun & repositori

1. Buat akun di **https://github.com** (gratis) bila belum punya.
2. Klik tombol **+** di kanan atas → **New repository**.
3. Isi:
   - **Repository name**: `ps-rent-pos` (huruf kecil, tanpa spasi)
   - **Visibility**: **Public** (wajib bila akun GitHub Anda gratis dan ingin memakai Pages)
   - **Jangan** centang “Add a README file”, “Add .gitignore”, atau “Choose a license” — kita akan mengunggah berkas sendiri.
4. Klik **Create repository**.

---

## 2A. Unggah lewat browser (paling mudah, tanpa aplikasi tambahan)

1. Setelah repositori dibuat, klik **Add file → Upload files**.
2. Buka folder **`ps-rent-pos-pwa`** dari file ZIP yang Anda terima, lalu **pilih semua isinya**
   (termasuk folder `icons`, `assets`, dan berkas `.nojekyll`), lalu **tarik ke halaman GitHub**.
   > ❗ Unggah **isinya**, bukan folder luarnya — `index.html` harus berada di halaman paling atas repositori.
3. Di kotak **Commit changes** tulis `Versi 3.0 — PS Rent POS`, lalu klik **Commit changes**.
4. Bila ada berkas yang belum terunggah (GitHub membatasi 100 berkas per unggahan), ulangi
   **Add file → Upload files** untuk sisanya.

> Berkas `.nojekyll` diawali titik sehingga mungkin tidak terlihat di Windows Explorer
> (aktifkan *View → Hidden items*). Berkas ini penting agar GitHub Pages tidak “menyaring” folder
> yang diawali garis bawah. Kalau terlewat, unggah manual lewat **Add file → Create new file** dengan nama `.nojekyll` (isi boleh kosong).

## 2B. Unggah lewat Git (lebih cepat bila sudah biasa)

```bash
cd ps-rent-pos-pwa
git init
git add .
git commit -m "PS Rent POS v3.0"
git branch -M main
git remote add origin https://github.com/<username>/ps-rent-pos.git
git push -u origin main
```

---

## 3. Aktifkan GitHub Pages

1. Buka repositori → tab **Settings** → menu kiri **Pages**.
2. Bagian **Build and deployment**:
   - **Source**: **Deploy from a branch**
   - **Branch**: **main** · folder **/ (root)** → klik **Save**.
3. Tunggu 1–3 menit, lalu muat ulang halaman **Pages**.
   Akan muncul tulisan: *Your site is live at* `https://<username>.github.io/<nama-repo>/`.

> Alternatif: repo ini sudah menyertakan `.github/workflows/pages.yml`.
> Bila Anda memilih **Source: GitHub Actions**, situs akan dideploy otomatis setiap kali ada
> perubahan di branch `main` (lihat tab **Actions**). Pilih salah satu, jangan dua-duanya.

---

## 4. Pasang di HP / komputer

Buka alamat situs (contoh `https://namasaya.github.io/ps-rent-pos/`) lalu:

| Perangkat | Langkah |
|---|---|
| **Android (Chrome)** | Menu **⋮** → **Instal aplikasi** / **Tambahkan ke layar utama** |
| **iPhone/iPad (Safari)** | Tombol **Bagikan** → **Add to Home Screen** |
| **Windows/macOS (Chrome/Edge)** | Klik ikon **Install** di bilah alamat |

Setelah terpasang, ikon PlayStation muncul di layar utama dan aplikasi **bisa dibuka tanpa internet**.
Login awal: **Pemilik PIN 1234**, **Penjaga PIN 5678** — langsung ganti di **Setelan → Akun & Hak Akses**.

---

## 5. Memperbarui aplikasi (setelah ada perubahan)

1. Ganti berkas yang berubah di repositori (**Add file → Upload files** → timpa berkas lama).
2. **Penting:** bila yang berubah `app.js`, `styles.css`, atau `index.html`, naikkan versi cache di `sw.js`:
   ```js
   const VERSION = 'pspos-v1.6.2';   // ganti angkanya, mis. menjadi 'pspos-v1.6.3'
   ```
   Tanpa ini, HP pengguna masih memakai berkas lama dari cache.
3. Buka aplikasi di HP → tarik layar ke bawah / tutup-buka aplikasi agar memperbarui.

---

## 6. Bila ada masalah

| Gejala | Penyebab & solusi |
|---|---|
| Halaman **404** | `index.html` tidak berada di root repo, atau Pages belum selesai build. Cek **Settings → Pages** dan tunggu 1–3 menit. |
| Muncul tampilan README, bukan aplikasi | Ada `README.md` di root — normal. Akses langsung `.../index.html`, atau jadikan `index.html` satu-satunya halaman root (README tetap tampil di halaman repo, bukan di situs). |
| Tampilan lama terus muncul | Cache service worker. Naikkan `VERSION` di `sw.js`, atau di Chrome: **Setelan situs → Hapus data**. |
| Tombol **Install** tidak muncul | Pastikan alamat memakai **https** (Pages otomatis https), dibuka di Chrome/Edge/Safari (bukan browser dalam aplikasi WhatsApp/Facebook). |
| Ikon aplikasi kosong | Pastikan folder `icons/` ikut terunggah lengkap. |
| Data hilang setelah ganti HP | Data tersimpan per perangkat. Unduh cadangan di HP lama (**Setelan → Data & Cadangan**), lalu pulihkan di HP baru. |
| Repo Private tapi Pages minta upgrade | Pages untuk repo privat memerlukan akun berbayar. Gunakan **Public**. |

---

## 7. Checklist sebelum dibagikan ke kasir

- [ ] Situs terbuka di `https://<username>.github.io/<nama-repo>/`
- [ ] Ikon PlayStation tampil di tab browser & layar utama
- [ ] Aplikasi tetap terbuka saat mode pesawat aktif
- [ ] Identitas toko, logo, unit PS, dan tarif sudah diisi
- [ ] Data contoh sudah dihapus (**Setelan → Data & Cadangan**)
- [ ] PIN Pemilik & Penjaga sudah diganti
- [ ] Printer thermal sudah diuji (58 mm / 80 mm)
- [ ] Lisensi diaktifkan sebelum masa demo 30 hari habis

---

Butuh bantuan, aktivasi lisensi, atau penyesuaian tampilan? WhatsApp **0813-9239-9300** (Bolangcorp).
