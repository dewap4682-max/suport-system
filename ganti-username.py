#!/usr/bin/env python3
"""Ganti nama pengguna (username) GitHub pada seluruh isi proyek, sekali jalan.

Pakai:
    python3 ganti-username.py web-aplikasi-android

Yang diubah:
  - index.html      : canonical, hreflang, og:url, og:image, twitter:image,
                      seluruh @id/url/image/logo/item di JSON-LD
  - sitemap.xml     : semua <loc> dan image:loc
  - robots.txt      : komentar domain + baris Sitemap
  - ganti-domain.py : konstanta OLD
  - README.md, PANDUAN-EDIT.md, SEO-GOOGLE.md, DOMAIN-SENDIRI.md
  - versi-satu-file.html dibangun ulang lewat build-onefile.py

Catatan penting:
  * Username GitHub hanya boleh huruf, angka, dan tanda hubung (-).
    Karakter '&' dan spasi TIDAK DIIZINKAN.
  * Nama tampilan profil (yang muncul sebagai "Web & Aplikasi Android")
    diatur terpisah di Settings → Public profile → Name — tidak mengubah URL.
"""
import re
import subprocess
import sys
from pathlib import Path

OLD_USER = "dewap4682-max"
REPO = "suport-system"

DOC_FILES = [
    "README.md",
    "PANDUAN-EDIT.md",
    "SEO-GOOGLE.md",
    "DOMAIN-SENDIRI.md",
    "UPLOAD-GITHUB.md",
]

USER_RE = re.compile(r"^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$")


def old_base(root: Path) -> str:
    """Ambil alamat dasar yang sedang dipakai dari canonical index.html."""
    html = (root / "index.html").read_text(encoding="utf-8")
    m = re.search(r'<link rel="canonical" href="([^"]+)"', html)
    return (m.group(1).rstrip("/") if m else f"https://{OLD_USER}.github.io/{REPO}")


def main() -> None:
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if not args:
        print(__doc__)
        sys.exit(1)

    user = args[0].strip().lstrip("@")
    if not USER_RE.match(user):
        print(f"✗ '{user}' bukan username GitHub yang valid.")
        print("  Aturan: hanya huruf, angka, dan tanda hubung (-); maksimal 39 karakter;")
        print("  tidak boleh diawali/diakhiri tanda hubung; '&' dan spasi tidak diizinkan.")
        print("  Contoh yang benar: web-aplikasi-android")
        sys.exit(1)

    root = Path(__file__).parent
    new_base = f"https://{user}.github.io/{REPO}"
    old = old_base(root)

    if old == new_base:
        print("Tidak ada yang perlu diubah — alamat website sudah", new_base)
        return

    touched: list[str] = []

    def swap(path: Path, old_s: str, new_s: str) -> None:
        if not path.exists():
            return
        text = path.read_text(encoding="utf-8")
        if old_s not in text:
            return
        path.write_text(text.replace(old_s, new_s), encoding="utf-8")
        touched.append(path.name)

    # ---------- alamat lengkap (canonical, sitemap, robots, docs) ----------
    for name in ["index.html", "sitemap.xml", "robots.txt", *DOC_FILES]:
        swap(root / name, old, new_base)
    # versi satu file dibangun ulang di bawah, tapi disapu dulu untuk kebersihan
    swap(root / "versi-satu-file.html", old, new_base)

    # ---------- ganti-domain.py: konstanta OLD ----------
    p = root / "ganti-domain.py"
    if p.exists():
        s = p.read_text(encoding="utf-8")
        s2 = re.sub(r'^OLD\s*=\s*".*?"', f'OLD = "{new_base}"', s, count=1, flags=re.M)
        if s2 != s:
            p.write_text(s2, encoding="utf-8")
            touched.append("ganti-domain.py")

    # ---------- sisa sebutan username saja (mis. teks di panduan) ----------
    for name in [*DOC_FILES, "index.html"]:
        p = root / name
        if p.exists():
            s = p.read_text(encoding="utf-8")
            if OLD_USER in s:
                p.write_text(s.replace(OLD_USER, user), encoding="utf-8")
                if name not in touched:
                    touched.append(name)

    # ---------- versi satu file ----------
    try:
        subprocess.run([sys.executable, str(root / "build-onefile.py")], check=True, cwd=root)
    except Exception as e:  # noqa: BLE001
        print("! build-onefile.py gagal:", e)

    print(f"\n✔ Username diganti: {OLD_USER} → {user}")
    print(f"  Alamat website baru : {new_base}/")
    print("  File diperbarui     :", ", ".join(dict.fromkeys(touched)) or "(tidak ada)")
    print(f"""
Langkah selanjutnya di GitHub:
  1. Buka https://github.com/settings/admin  (Settings → Account → Change username)
  2. Isi: {user}  → Change username → konfirmasi.
  3. Settings → Public profile → Name: isi "Web & Aplikasi Android" (nama tampilan bebas, boleh ada '&').
  4. Upload ulang berkas yang sudah diperbarui: index.html, sitemap.xml, robots.txt,
     versi-satu-file.html, ganti-domain.py, README.md, PANDUAN-EDIT.md,
     SEO-GOOGLE.md, DOMAIN-SENDIRI.md.
  5. Settings → Pages: pastikan Source = branch main / root, lalu buka alamat baru.
  6. Search Console: tambah properti "{new_base}/" dan submit
     "{new_base}/sitemap.xml".
""")


if __name__ == "__main__":
    main()
