#!/usr/bin/env python3
"""Siapkan Notaku POS agar bisa dipasang sebagai PWA di /suport-system/notaku/.

Yang dilakukan:
  1. Ambil ikon 192 & 512 dari manifest inline di notaku.html → notaku/icons/*.png
     (seluruh edisi memakai ikon yang sama).
  2. Ganti manifest inline (data URI ±97 KB per berkas) dengan berkas
     manifest-<edisi>.webmanifest yang punya identitas sendiri-sendiri.
     → tiap edisi bisa dipasang terpisah dan tidak saling menimpa.
  3. Buat manifest untuk halaman depan (daftar edisi).

Jalankan:  python3 siapkan-manifest.py
"""
import base64
import json
import re
from pathlib import Path

HERE = Path(__file__).parent
ICONS = HERE / "icons"

# berkas → (slug, nama edisi, keterangan)
EDISI = {
    "notaku.html":             ("sembako",    "Sembako",              "Kelontong & toko umum: barang harian, stok, dan nota penjualan."),
    "notaku-listrik.html":     ("listrik",    "Toko Listrik",         "Komponen listrik, lampu, kabel, dan perlengkapan."),
    "notaku-atk.html":         ("atk",        "ATK",                  "Alat tulis kantor, kertas, printer, dan perlengkapan kantor."),
    "notaku-bangunan.html":    ("bangunan",   "Toko Bangunan",        "Semen, besi, pasir, cat, dan material bangunan."),
    "notaku-warmindo.html":    ("warmindo",   "Warmindo",             "Warung makan & minuman, menu cepat saji."),
    "notaku-mukena.html":      ("mukena",     "Mukena & Busana",      "Mukena, gamis, dan busana muslim."),
    "notaku-barbershop.html":  ("barbershop", "Barbershop",           "Pangkas rambut, cukur, dan grooming."),
    "notaku-salon-spa.html":   ("salon-spa",  "Salon & Spa",          "Perawatan rambut, wajah, spa, dan creambath."),
    "notaku-pkk.html":         ("pkk",        "Kas & Iuran PKK",      "Kas iuran, kas dawis, kas ronda, dan dana sosial."),
}

POLA_MANIFEST = re.compile(
    r'<link rel="manifest" href="data:application/manifest\+json;base64,[^"]+">')


def ambil_ikon() -> None:
    """Simpan ikon dari manifest inline notaku.html ke berkas PNG.

    Catatan: isi manifest asli memakai src tanpa awalan "data:" —
    formatnya langsung "image/png;base64,....".
    """
    ICONS.mkdir(exist_ok=True)
    sumber = None
    for kandidat in (HERE / "notaku.html", HERE.parent.parent / "uploads" / "notaku.html"):
        if kandidat.exists() and POLA_MANIFEST.search(kandidat.read_text(encoding="utf-8")):
            sumber = kandidat
            break
    if sumber is None:                      # manifest inline sudah diganti sebelumnya
        ada = sorted(ICONS.glob("icon-*.png"))
        print("  manifest inline sudah tidak ada; ikon dipertahankan:",
              ", ".join(a.name for a in ada) or "(kosong!)")
        return
    html = sumber.read_text(encoding="utf-8")
    data = json.loads(base64.b64decode(POLA_MANIFEST.search(html).group(0)
                                        .split("base64,")[1].rstrip('">')))
    for ikon in data["icons"]:
        b64 = ikon["src"].split("base64,")[-1]
        nama = "icon-%s.png" % ikon["sizes"].split("x")[0]
        (ICONS / nama).write_bytes(base64.b64decode(b64))
        print("  ikon →", nama, f"({len(base64.b64decode(b64))//1024} KB)")


def tulis_manifest(path: Path, isi: dict) -> None:
    path.write_text(json.dumps(isi, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    print("1) mengambil ikon")
    ambil_ikon()

    ikon = [
        {"src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any"},
        {"src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any"},
        {"src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"},
    ]

    print("2) menulis manifest per edisi")
    for berkas, (slug, nama, ket) in EDISI.items():
        p = HERE / berkas
        html = p.read_text(encoding="utf-8")
        if not POLA_MANIFEST.search(html):
            print("  ! tidak ada manifest inline:", berkas)
            continue
        isi = {
            "id": f"notaku-pos-{slug}",
            "name": f"Notaku POS — {nama}",
            "short_name": f"Notaku {nama}",
            "description": ket,
            "lang": "id",
            "start_url": f"./{berkas}",
            "scope": "./",
            "display": "standalone",
            "display_override": ["standalone", "minimal-ui", "browser"],
            "background_color": "#17102a",
            "theme_color": "#7c3aed",
            "categories": ["business", "productivity"],
            "icons": ikon,
        }
        nama_manifest = f"manifest-{slug}.webmanifest"
        tulis_manifest(HERE / nama_manifest, isi)

        baru = html.replace(
            POLA_MANIFEST.search(html).group(0),
            f'<link rel="manifest" href="{nama_manifest}">', 1)
        p.write_text(baru, encoding="utf-8")
        print(f"  {berkas:26s} → {nama_manifest:28s} (hemat {(len(html)-len(baru))//1024} KB)")

    print("3) manifest halaman depan")
    tulis_manifest(HERE / "manifest.webmanifest", {
        "id": "notaku-pos",
        "name": "Notaku POS — Kasir untuk Semua Jenis Usaha",
        "short_name": "Notaku POS",
        "description": "9 edisi aplikasi kasir siap pakai: sembako, listrik, ATK, bangunan, warmindo, "
                       "mukena, barbershop, salon & spa, serta kas & iuran PKK.",
        "lang": "id",
        "start_url": "./",
        "scope": "./",
        "display": "standalone",
        "background_color": "#150b24",
        "theme_color": "#7c3aed",
        "categories": ["business", "productivity", "shopping"],
        "icons": ikon,
    })
    print("  manifest.webmanifest")
    print("\n✔ selesai")


if __name__ == "__main__":
    main()
