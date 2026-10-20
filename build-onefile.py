#!/usr/bin/env python3
"""Gabungkan index.html + css + js + gambar menjadi satu berkas HTML mandiri.

Jalankan:  python3 build-onefile.py
Hasil:     versi-satu-file.html
"""
import base64, pathlib, re

ROOT = pathlib.Path(__file__).parent
html = (ROOT / "index.html").read_text(encoding="utf-8")

# 1) inline stylesheet (@import fonts.css ikut digabung)
css = (ROOT / "css" / "styles.css").read_text(encoding="utf-8")
fonts = (ROOT / "css" / "fonts.css").read_text(encoding="utf-8")
css = css.replace('@import url("fonts.css");', fonts)
html = html.replace(
    '<link rel="stylesheet" href="css/styles.css">',
    "<style>\n" + css + "\n</style>",
)

# 2) inline javascript
js = (ROOT / "js" / "app.js").read_text(encoding="utf-8")
html = html.replace(
    '<script src="js/app.js" defer></script>',
    "<script>\n" + js + "\n</script>",
)

# 3) inline images (png/svg) sebagai data URI
def to_data_uri(match):
    rel = match.group(1)
    path = ROOT / rel
    if not path.exists():
        return match.group(0)
    mime = "image/svg+xml" if path.suffix == ".svg" else "image/png"
    data = base64.b64encode(path.read_bytes()).decode()
    return 'src="data:%s;base64,%s"' % (mime, data)

html = re.sub(r'src="(assets/img/[^"]+\.(?:png|svg))"', to_data_uri, html)

out = ROOT / "versi-satu-file.html"
out.write_text(html, encoding="utf-8")
print("✔ %s  (%.0f KB)" % (out.name, out.stat().st_size / 1024))
