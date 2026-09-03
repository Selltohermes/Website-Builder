#!/usr/bin/env sh
# Run this after adding your real logo at assets/img/logo.png
#
#   sh scripts/install-logo.sh
#
# It trims the transparent padding off the source file, writes a header-sized
# crop of the crest, and points every page at the real artwork.
set -e
cd "$(dirname "$0")/.."

SRC="assets/img/logo.png"
[ -f "$SRC" ] || { echo "Put your logo at $SRC first, then re-run this."; exit 1; }

python3 - <<'PY'
from PIL import Image
im = Image.open("assets/img/logo.png").convert("RGBA")

# Trim fully transparent (or pure white) borders so the mark fills its box.
bg = Image.new("RGBA", im.size, (0, 0, 0, 0))
box = Image.alpha_composite(bg, im).getbbox()
if box:
    im = im.crop(box)
im.save("assets/img/logo.png")
print("trimmed to", im.size)

# Header mark: the crest only, dropping the wordmark underneath it. The crest
# occupies roughly the top 72% of the lockup.
w, h = im.size
crest = im.crop((0, 0, w, int(h * 0.72)))
crest = crest.crop(crest.getbbox() or (0, 0, w, int(h * 0.72)))
crest.save("assets/img/logo-mark.png")
print("header mark", crest.size)
PY

sed -i.bak "s|assets/img/logo-mark\.svg|assets/img/logo-mark.png|g" ./*.html
rm -f ./*.html.bak assets/img/logo.svg assets/img/logo-mark.svg
echo "Done. The drawn stand-ins are removed and every page now uses your artwork."
