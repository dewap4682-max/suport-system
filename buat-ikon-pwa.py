#!/usr/bin/env python3
"""Buat ikon PWA dari logo asli.

Hasil (di assets/img/):
  icon-192.png            — "any" (latar krem, sudut membulat)
  icon-512.png            — "any"
  icon-maskable-192.png   — "maskable" (latar gelap penuh, logo di zona aman)
  icon-maskable-512.png

Jalankan:  python3 buat-ikon-pwa.py
"""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).parent
IMG = ROOT / "assets" / "img"

KREM = (246, 242, 234, 255)      # --ivory
GELAP = (13, 20, 23, 255)        # --ink


def tempel(kanvas: Image.Image, logo: Image.Image, tinggi_rasio: float) -> None:
    """Tempel logo di tengah, tinggi = tinggi_rasio × sisi kanvas."""
    sisi = kanvas.size[0]
    h = round(sisi * tinggi_rasio)
    w = round(logo.width * h / logo.height)
    kecil = logo.resize((w, h), Image.LANCZOS)
    kanvas.alpha_composite(kecil, ((sisi - w) // 2, (sisi - h) // 2))


def sudut_membulat(im: Image.Image, radius_rasio: float = 0.2) -> Image.Image:
    from PIL import ImageDraw
    mask = Image.new("L", im.size, 0)
    d = ImageDraw.Draw(mask)
    r = round(im.size[0] * radius_rasio)
    d.rounded_rectangle([0, 0, im.size[0] - 1, im.size[1] - 1], radius=r, fill=255)
    out = Image.new("RGBA", im.size, (0, 0, 0, 0))
    out.paste(im, (0, 0), mask)
    return out


def main() -> None:
    gelap_logo = Image.open(IMG / "logo-mark.png").convert("RGBA")       # untuk latar terang
    putih_logo = Image.open(IMG / "logo-mark-white.png").convert("RGBA")  # untuk latar gelap

    # ---- "any": latar krem + logo gelap ----
    for sisi in (192, 512):
        kanvas = Image.new("RGBA", (sisi, sisi), KREM)
        tempel(kanvas, gelap_logo, 0.66)
        sudut_membulat(kanvas).save(IMG / f"icon-{sisi}.png", optimize=True)

    # ---- "maskable": latar gelap penuh + logo putih di zona aman (60%) ----
    for sisi in (192, 512):
        kanvas = Image.new("RGBA", (sisi, sisi), GELAP)
        tempel(kanvas, putih_logo, 0.56)
        kanvas.convert("RGB").save(IMG / f"icon-maskable-{sisi}.png", optimize=True)

    # apple-touch-icon: iOS memakai sudut membulat sendiri → jangan dibulatkan
    kanvas = Image.new("RGBA", (180, 180), KREM)
    tempel(kanvas, gelap_logo, 0.66)
    kanvas.convert("RGB").save(IMG / "apple-touch-icon.png", optimize=True)

    for f in sorted(IMG.glob("icon-*.png")):
        im = Image.open(f)
        print(f"✔ {f.name:26s} {im.size[0]}×{im.size[1]}")


if __name__ == "__main__":
    main()
