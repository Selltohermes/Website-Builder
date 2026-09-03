#!/usr/bin/env sh
# Lists every remaining placeholder in the site so nothing fake goes live.
# Usage:  sh scripts/check-placeholders.sh
set -e
cd "$(dirname "$0")/.."

echo "Scanning for unfilled placeholders…"
echo

if grep -rn --include='*.html' -E '\[[A-Za-z][^]]*\]|PLACEHOLDER' . ; then
  echo
  echo "^^ Fill these in before launch."
  exit 1
else
  echo "Clean. No placeholders left."
fi
