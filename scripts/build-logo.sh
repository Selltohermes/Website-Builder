#!/usr/bin/env sh
# Regenerates the three web logo files from the master artwork in brand/.
# Run this if you ever replace or tweak the logo.
#
#   sh scripts/build-logo.sh
#
# Requires Pillow:  pip install Pillow
set -e
cd "$(dirname "$0")/.."

MASTER="brand/sell-to-hermes-logo-original.png"
[ -f "$MASTER" ] || { echo "Master artwork missing: $MASTER"; exit 1; }

python3 - "$MASTER" <<'PY'
import sys
from PIL import Image, ImageDraw

src = Image.open(sys.argv[1]).convert("RGBA")

def trim(im):
    b = im.getbbox()
    return im.crop(b) if b else im

def fit_h(im, h):
    return im.resize((round(im.width * h / im.height), h), Image.LANCZOS)

def save(im, path, colors=96):
    """The artwork is gold linework on transparency, so a small palette is
    visually identical and roughly fifteen times lighter than full RGBA."""
    q = im.quantize(colors=colors, method=Image.FASTOCTREE)
    q.save(path, optimize=True)

# Find the blank row band separating the crest from the PROPERTY SOLUTIONS
# wordmark, so the header can use the crest on its own.
a = src.split()[3].load()
w, h = src.size
split = h
run = 0
for y in range(int(h * 0.55), h):
    if not any(a[x, y] > 12 for x in range(0, w, 3)):
        run += 1
        if run >= 4:
            split = y - run + 1
            break
    else:
        run = 0

save(fit_h(trim(src), 320), "assets/img/logo.png")
crest = trim(src.crop((0, 0, w, split)))
save(fit_h(crest, 220), "assets/img/logo-mark.png")

# Favicon: crest on a navy tile, because fine gold lines vanish against a
# light browser tab at 16px.
F = 512
fav = Image.new("RGBA", (F, F), (0, 0, 0, 0))
tile = Image.new("RGBA", (F, F), (10, 26, 47, 255))
mask = Image.new("L", (F, F), 0)
ImageDraw.Draw(mask).rounded_rectangle([0, 0, F - 1, F - 1], radius=96, fill=255)
fav.paste(tile, (0, 0), mask)
c = fit_h(crest, int(F * 0.60))
if c.width > F * 0.86:
    c = c.resize((int(F * 0.86), round(c.height * F * 0.86 / c.width)), Image.LANCZOS)
fav.alpha_composite(c, ((F - c.width) // 2, (F - c.height) // 2))
save(fav, "assets/img/favicon.png", colors=64)

print("wrote logo.png, logo-mark.png, favicon.png (crest/wordmark split at y=%d)" % split)
PY
