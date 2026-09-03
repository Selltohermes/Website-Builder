#!/usr/bin/env sh
# Swap the placeholder crest for your real logo file.
#
#   sh scripts/set-logo.sh ~/Downloads/sth-logo.png
#
# Use a transparent PNG (or SVG) of the full winged crest. It replaces the
# large footer logo. The small header mark stays as logo-mark.svg unless you
# also supply a cropped, wordmark-free version as a second argument:
#
#   sh scripts/set-logo.sh full-crest.png header-crest.png
set -e
cd "$(dirname "$0")/.."

[ -z "$1" ] && { echo "Usage: sh scripts/set-logo.sh <logo-file> [header-mark-file]"; exit 1; }
[ -f "$1" ] || { echo "No such file: $1"; exit 1; }

ext="${1##*.}"
cp "$1" "assets/img/logo.$ext"
[ "$ext" != "svg" ] && rm -f assets/img/logo.svg
sed -i.bak "s|assets/img/logo\.svg|assets/img/logo.$ext|g" ./*.html

if [ -n "$2" ] && [ -f "$2" ]; then
  mext="${2##*.}"
  cp "$2" "assets/img/logo-mark.$mext"
  [ "$mext" != "svg" ] && rm -f assets/img/logo-mark.svg
  sed -i.bak "s|assets/img/logo-mark\.svg|assets/img/logo-mark.$mext|g" ./*.html
fi

rm -f ./*.html.bak
echo "Done. Open index.html and check the header and footer sizing."
