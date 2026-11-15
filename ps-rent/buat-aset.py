#!/usr/bin/env python3
"""Buat ikon PWA + gambar unit & produk untuk PS Rent POS.

Catatan: ikon dibuat ORISINAL (gamepad), bukan menyalin logo PlayStation
yang merupakan merek dagang Sony. Nuansa warna mengikuti tema aplikasi
(hitam pekat + hijau neon #00FF87).

Hasil:
  icons/favicon-32.png, favicon.png, icon-192/256/384/512.png,
  icon-maskable-192/512.png, apple-touch-icon.png
  assets/units/ps3.jpg, ps4.jpg, ps5.jpg            (1200×800)
  assets/products/air-mineral.jpg, teh-botol.jpg, kopi-sachet.jpg,
                  mie-instan.jpg, gorengan.jpg, rokok-ketengan.jpg  (600×600)

Jalankan: python3 buat-aset.py
"""
import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = Path(__file__).parent
NEON = (0, 255, 135)
LIME = (198, 255, 61)
DARK = (3, 8, 10)
CARD = (8, 23, 15)

F_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
F_REG = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"


def font(size: int, bold: bool = True) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(F_BOLD if bold else F_REG, size)


# ---------------------------------------------------------------- gamepad
def gamepad(d: ImageDraw.ImageDraw, cx: int, cy: int, w: int, warna) -> None:
    """Gambar gamepad sederhana (badan + dua pegangan + tombol)."""
    h = int(w * 0.62)
    x0, y0 = cx - w // 2, cy - h // 2
    r = int(h * 0.34)

    # badan: kapsul lebar
    d.rounded_rectangle([x0, y0, x0 + w, y0 + h], radius=int(h * 0.30), fill=warna)
    # pegangan bawah kiri & kanan
    gw = int(w * 0.30)
    d.rounded_rectangle([x0 - int(w * 0.02), y0 + int(h * 0.30), x0 + gw, y0 + int(h * 1.02)],
                        radius=int(gw * 0.52), fill=warna)
    d.rounded_rectangle([x0 + w - gw, y0 + int(h * 0.30), x0 + w + int(w * 0.02), y0 + int(h * 1.02)],
                        radius=int(gw * 0.52), fill=warna)

    # potongan pengganti (d-pad & tombol) memakai warna latar
    gelap = DARK
    # d-pad
    dp = int(w * 0.085)
    dx, dy = x0 + int(w * 0.26), y0 + int(h * 0.50)
    d.rounded_rectangle([dx - dp, dy - dp // 3, dx + dp, dy + dp // 3], radius=dp // 4, fill=gelap)
    d.rounded_rectangle([dx - dp // 3, dy - dp, dx + dp // 3, dy + dp], radius=dp // 4, fill=gelap)
    # 4 tombol kanan
    br = int(w * 0.052)
    bx, by = x0 + int(w * 0.735), y0 + int(h * 0.50)
    for ax, ay in ((0, -1), (1, 0), (0, 1), (-1, 0)):
        px, py = bx + ax * int(w * 0.085), by + ay * int(w * 0.085)
        d.ellipse([px - br, py - br, px + br, py + br], fill=gelap)
    # dua tombol tengah kecil
    for ax in (-1, 1):
        px = cx + ax * int(w * 0.055)
        d.rounded_rectangle([px - br // 2, y0 + int(h * 0.20),
                             px + br // 2, y0 + int(h * 0.20) + br],
                            radius=br // 3, fill=gelap)


def ikon(sisi: int, maskable: bool = False, sudut: bool = True) -> Image.Image:
    S = sisi * 4                                   # gambar besar lalu diperkecil (anti-alias)
    im = Image.new("RGBA", (S, S), DARK + (255,))
    d = ImageDraw.Draw(im)

    # pendar neon di belakang
    glow = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse([int(S * .10), int(S * .10), int(S * .90), int(S * .90)],
               fill=(0, 255, 135, 60))
    glow = glow.filter(ImageFilter.GaussianBlur(S // 9))
    im.alpha_composite(glow)

    # gamepad; maskable → lebih kecil agar aman di zona 80%
    w = int(S * (0.52 if maskable else 0.64))
    gamepad(d, S // 2, int(S * 0.47), w, NEON)

    # garis aksen "timer" di bawah
    d.rounded_rectangle([int(S * .30), int(S * .86), int(S * .70), int(S * .885)],
                        radius=S // 90, fill=LIME)

    im = im.resize((sisi, sisi), Image.LANCZOS)
    if sudut and not maskable:                     # sudut membulat khas ikon aplikasi
        mask = Image.new("L", (sisi, sisi), 0)
        ImageDraw.Draw(mask).rounded_rectangle([0, 0, sisi - 1, sisi - 1],
                                               radius=int(sisi * 0.22), fill=255)
        out = Image.new("RGBA", (sisi, sisi), (0, 0, 0, 0))
        out.paste(im, (0, 0), mask)
        return out
    return im


# ---------------------------------------------------------------- unit PS
def foto_unit(nama: str, label: str, warna) -> Image.Image:
    W, H = 1200, 800
    im = Image.new("RGB", (W, H), DARK)
    d = ImageDraw.Draw(im)

    # pendar warna di tengah
    glow = Image.new("RGB", (W, H), DARK)
    gd = ImageDraw.Draw(glow)
    gd.ellipse([W // 2 - 380, H // 2 - 260, W // 2 + 380, H // 2 + 300], fill=warna)
    glow = glow.filter(ImageFilter.GaussianBlur(120))
    im = Image.blend(im, glow, 0.35)
    d = ImageDraw.Draw(im)

    # bodi konsol: kotak membulat tipis
    bw, bh = 520, 300
    x0, y0 = (W - bw) // 2, (H - bh) // 2 - 30
    d.rounded_rectangle([x0, y0, x0 + bw, y0 + bh], radius=34,
                        fill=(16, 24, 20), outline=(60, 90, 74), width=3)
    # celah disk
    d.rounded_rectangle([x0 + 40, y0 + 48, x0 + bw - 40, y0 + 76], radius=14, fill=(7, 14, 11))
    d.rounded_rectangle([x0 + 40, y0 + 92, x0 + bw - 40, y0 + 108], radius=8, fill=(7, 14, 11))
    # garis aksen & lampu daya
    d.rounded_rectangle([x0 + 40, y0 + bh - 66, x0 + 40 + 120, y0 + bh - 58], radius=4, fill=warna)
    d.ellipse([x0 + bw - 74, y0 + bh - 76, x0 + bw - 58, y0 + bh - 60], fill=warna)

    # label besar
    f1 = font(150)
    tw = d.textlength(label, font=f1)
    d.text(((W - tw) / 2, y0 + bh + 44), label, font=f1, fill=(240, 255, 248))

    f2 = font(34, bold=False)
    sub = "UNIT RENTAL"
    tw2 = d.textlength(sub, font=f2)
    d.text(((W - tw2) / 2, y0 + bh + 210), sub, font=f2, fill=(127, 161, 146))
    return im


# ---------------------------------------------------------------- produk
PRODUK = [
    ("air-mineral", "Air Mineral", (120, 205, 255), "botol"),
    ("teh-botol", "Teh Botol", (255, 196, 92), "botol"),
    ("kopi-sachet", "Kopi Sachet", (196, 152, 120), "sachet"),
    ("mie-instan", "Mie Instan", (255, 150, 90), "pack"),
    ("gorengan", "Gorengan", (255, 210, 120), "snack"),
    ("rokok-ketengan", "Rokok Ketengan", (200, 200, 205), "sachet"),
]


def gambar_produk(nama: str, label: str, warna, bentuk: str) -> Image.Image:
    S = 600
    im = Image.new("RGB", (S, S), (10, 18, 14))
    glow = Image.new("RGB", (S, S), (10, 18, 14))
    gd = ImageDraw.Draw(glow)
    gd.ellipse([S // 2 - 190, S // 2 - 190, S // 2 + 190, S // 2 + 190], fill=warna)
    glow = glow.filter(ImageFilter.GaussianBlur(95))
    im = Image.blend(im, glow, 0.30)
    d = ImageDraw.Draw(im)

    cx, cy = S // 2, int(S * 0.42)

    if bentuk == "botol":
        d.rounded_rectangle([cx - 58, cy - 130, cx + 58, cy + 130], radius=34, fill=warna)
        d.rounded_rectangle([cx - 26, cy - 176, cx + 26, cy - 118], radius=14, fill=warna)
        d.rounded_rectangle([cx - 30, cy - 186, cx + 30, cy - 168], radius=8, fill=(240, 248, 244))
        d.rounded_rectangle([cx - 58, cy - 30, cx + 58, cy + 30], radius=6, fill=(250, 252, 251))
    elif bentuk == "sachet":
        d.rounded_rectangle([cx - 92, cy - 128, cx + 92, cy + 128], radius=16, fill=warna)
        d.rounded_rectangle([cx - 92, cy - 128, cx + 92, cy - 104], radius=8, fill=(250, 250, 250))
        d.rounded_rectangle([cx - 92, cy + 104, cx + 92, cy + 128], radius=8, fill=(250, 250, 250))
        d.ellipse([cx - 42, cy - 42, cx + 42, cy + 42], fill=(255, 255, 255))
    elif bentuk == "pack":
        d.rounded_rectangle([cx - 110, cy - 118, cx + 110, cy + 118], radius=18, fill=warna)
        d.ellipse([cx - 74, cy - 74, cx + 74, cy + 74], fill=(255, 246, 236))
        d.ellipse([cx - 46, cy - 46, cx + 46, cy + 46], fill=warna)
    else:  # snack / gorengan
        for i, (ox, oy, r) in enumerate(((-52, -30, 54), (26, -46, 46), (46, 24, 50), (-24, 40, 44))):
            d.ellipse([cx + ox - r, cy + oy - r, cx + ox + r, cy + oy + r],
                      fill=warna if i % 2 == 0 else (222, 168, 92))

    # label
    f = font(34)
    tw = d.textlength(label, font=f)
    d.rounded_rectangle([(S - tw) / 2 - 22, S - 132, (S + tw) / 2 + 22, S - 70],
                        radius=16, fill=(0, 0, 0, 120))
    d.text(((S - tw) / 2, S - 122), label, font=f, fill=(240, 255, 248))
    return im


def main() -> None:
    ikon_dir = HERE / "icons"
    ikon_dir.mkdir(exist_ok=True)

    for sisi in (32, 96, 180, 192, 256, 384, 512):
        nama = {32: "favicon-32.png", 96: "favicon.png", 180: "apple-touch-icon.png"}.get(
            sisi, f"icon-{sisi}.png")
        ikon(sisi, sudut=(sisi != 180)).save(ikon_dir / nama, optimize=True)
        print(f"  ikon → {nama:24s} {sisi}×{sisi}")

    for sisi in (192, 512):
        ikon(sisi, maskable=True, sudut=False).convert("RGB").save(
            ikon_dir / f"icon-maskable-{sisi}.png", optimize=True)
        print(f"  ikon → icon-maskable-{sisi}.png  {sisi}×{sisi} (zona aman 80%)")

    unit_dir = HERE / "assets" / "units"
    unit_dir.mkdir(parents=True, exist_ok=True)
    for nama, label, warna in (("ps3", "PS3", (90, 140, 255)),
                               ("ps4", "PS4", (120, 200, 255)),
                               ("ps5", "PS5", (0, 255, 135))):
        foto_unit(nama, label, warna).save(unit_dir / f"{nama}.jpg", quality=88, optimize=True)
        print(f"  unit → assets/units/{nama}.jpg")

    prod_dir = HERE / "assets" / "products"
    prod_dir.mkdir(parents=True, exist_ok=True)
    for nama, label, warna, bentuk in PRODUK:
        gambar_produk(nama, label, warna, bentuk).save(
            prod_dir / f"{nama}.jpg", quality=88, optimize=True)
        print(f"  produk → assets/products/{nama}.jpg")


if __name__ == "__main__":
    main()
