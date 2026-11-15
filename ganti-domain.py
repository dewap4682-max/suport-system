#!/usr/bin/env python3
"""Ganti domain Suport System ke domain sendiri, sekali jalan.

Pakai:
    python3 ganti-domain.py suportsystem.id
    python3 ganti-domain.py suportsystem.id --www

Yang diubah:
  - index.html   : canonical, hreflang, og:url, og:image, twitter:image, JSON-LD @id/url/image/logo/item
  - sitemap.xml  : semua <loc> dan image:loc
  - robots.txt   : komentar domain + baris Sitemap
  - CNAME        : dibuat/diperbarui (wajib untuk GitHub Pages + domain sendiri)
  - jpg/svg di README tidak disentuh

Setelah itu skrip menjalankan build-onefile.py agar versi satu file ikut rapi.
"""
import re
import subprocess
import sys
from pathlib import Path

DEFAULT_OLD = "https://dewap4682-max.github.io/suport-system"


def base_sekarang(root: Path) -> str:
    """Alamat yang sedang dipakai, dibaca dari canonical index.html."""
    html = (root / "index.html").read_text(encoding="utf-8")
    m = re.search(r'<link rel="canonical" href="([^"]+)"', html)
    return (m.group(1).rstrip("/") if m else DEFAULT_OLD)

def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if not args:
        print(__doc__)
        sys.exit(1)

    domain = args[0].strip().lower()
    domain = re.sub(r"^https?://", "", domain).strip("/")
    domain = re.sub(r"^www\.", "", domain)
    if "." not in domain:
        print(f"✗ '{domain}' bukan domain yang valid (contoh: suportsystem.id)")
        sys.exit(1)
    new = f"https://{domain}"
    use_www = "--www" in sys.argv
    canonical_base = f"https://www.{domain}" if use_www else new

    root = Path(__file__).parent
    OLD = base_sekarang(root)
    touched = []

    # ---------- index.html ----------
    p = root / "index.html"
    html = p.read_text(encoding="utf-8")
    before = html
    html = html.replace(OLD, canonical_base)
    if html != before:
        p.write_text(html, encoding="utf-8")
        touched.append("index.html")

    # ---------- sitemap.xml ----------
    p = root / "sitemap.xml"
    if p.exists():
        x = p.read_text(encoding="utf-8")
        if OLD in x:
            p.write_text(x.replace(OLD, canonical_base), encoding="utf-8")
            touched.append("sitemap.xml")

    # ---------- robots.txt ----------
    p = root / "robots.txt"
    if p.exists():
        r = p.read_text(encoding="utf-8")
        r2 = re.sub(r"(Sitemap:\s*)\S+", r"\g<1>" + canonical_base + "/sitemap.xml", r)
        r2 = re.sub(r"(#\s*Suport System —\s*)\S+", r"\g<1>" + canonical_base + "/", r2)
        if r2 != r:
            p.write_text(r2, encoding="utf-8")
            touched.append("robots.txt")

    # ---------- CNAME (wajib untuk GitHub Pages) ----------
    (root / "CNAME").write_text(("www." + domain if use_www else domain) + "\n", encoding="utf-8")
    touched.append("CNAME")

    # ---------- versi satu file ----------
    try:
        subprocess.run([sys.executable, str(root / "build-onefile.py")], check=True, cwd=root)
    except Exception as e:  # noqa: BLE001
        print("! build-onefile.py gagal:", e)

    print("\n✔ Domain diganti ke:", canonical_base)
    print("   File diperbarui:", ", ".join(touched))
    print("""
Langkah selanjutnya (di GitHub):
  1. Commit & push semua file, termasuk CNAME.
  2. Settings → Pages → Custom domain → isi: %s → Save
  3. Tunggu DNS check hijau, lalu centang Enforce HTTPS.
  4. Settings → Pages sudah tidak menampilkan URL github.io sebagai alamat utama.

DNS di registrar (lihat DOMAIN-SENDIRI.md):
  A     @    185.199.108.153
  A     @    185.199.109.153
  A     @    185.199.110.153
  A     @    185.199.111.153
  CNAME www  %s.github.io
""" % (("www." + domain) if use_www else domain, "USERNAME"))

if __name__ == "__main__":
    main()
