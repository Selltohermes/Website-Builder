#!/usr/bin/env python3
"""
Generates a GoHighLevel-ready version of the site into ghl/.

GHL cannot take a whole HTML document. It wants the pieces separately:
head code, body markup, and footer code. This splits index.html accordingly,
rewrites the internal links to GHL funnel paths, and inlines the logo files
as data URIs so there is no media-library step.

    python3 scripts/build-ghl.py
"""
import base64
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "ghl"
OUT.mkdir(exist_ok=True)

GHL_RESET = """
/* ------------------------------------------------------------------------
   GoHighLevel container reset.
   GHL wraps every element in section / row / column shells that add their own
   padding and max-width. This page manages its own widths through .wrap, so
   those shells are neutralised. If you still see stray gaps, inspect the page
   and add the offending GHL class to this list.
   ------------------------------------------------------------------------ */
.c-section, .c-row, .c-column, .c-wrapper, .fullEditor,
.hl_page-preview--content .section,
.hl_page-preview--content .row,
.hl_page-preview--content .col,
.hl_page-preview--content .inner {
  padding: 0 !important;
  margin: 0 !important;
  max-width: none !important;
  width: 100% !important;
}
.c-column, .c-wrapper { flex: 1 1 100% !important; }
"""

html = (ROOT / "index.html").read_text(encoding="utf-8")
css = (ROOT / "assets/css/styles.css").read_text(encoding="utf-8")
js = (ROOT / "assets/js/main.js").read_text(encoding="utf-8")


def data_uri(rel):
    raw = (ROOT / rel).read_bytes()
    mime = "image/jpeg" if rel.lower().endswith((".jpg", ".jpeg")) else "image/png"
    return f"data:{mime};base64," + base64.b64encode(raw).decode()


def inline_images(markup):
    """Embed every local image. GHL has no assets/ directory to serve them."""
    for rel in ("assets/img/logo-mark.png", "assets/img/logo.png", "assets/img/hermes.jpg"):
        markup = markup.replace(f'src="{rel}"', f'src="{data_uri(rel)}"')
    return markup


# ---------------------------------------------------------------- head code --
fonts = re.search(r'<link href="https://fonts\.googleapis[^>]+>', html).group(0)
schemas = re.findall(r'<script type="application/ld\+json">.*?</script>', html, re.S)

head = f"""<!-- ============================================================
     Sell To Hermes: GoHighLevel HEAD code
     Paste into: Funnel/Website > Settings > Head Tracking Code
     ============================================================ -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
{fonts}

{chr(10).join(schemas)}

<style>
{GHL_RESET}
{css}
</style>
"""
(OUT / "1-head-code.html").write_text(head, encoding="utf-8")

# ---------------------------------------------------------------- body code --
body = re.search(r"<body>(.*)</body>", html, re.S).group(1)
body = re.sub(r'<script src="assets/js/main\.js" defer></script>\s*', "", body)

# GHL serves funnel steps at clean paths, not .html files.
links = {
    'href="index.html"': 'href="/"',
    'href="privacy.html"': 'href="/privacy-policy"',
    'href="terms.html"': 'href="/terms-and-conditions"',
}
for old, new in links.items():
    body = body.replace(old, new)

# Inline every image so there is no media-library upload step.
body = inline_images(body)

banner = """<!-- ============================================================
     Sell To Hermes: GoHighLevel PAGE BODY
     Paste into: a full-width Custom Code / HTML element on the page.
     The logos are embedded, so nothing needs uploading first.
     ============================================================ -->
"""
(OUT / "2-page-body.html").write_text(banner + body.strip() + "\n", encoding="utf-8")

# -------------------------------------------------------------- footer code --
js_ghl = js.replace("var THANK_YOU_URL = 'thank-you.html';", "var THANK_YOU_URL = '/thank-you';")
footer = f"""<!-- ============================================================
     Sell To Hermes: GoHighLevel FOOTER code
     Paste into: Funnel/Website > Settings > Footer Tracking Code
     Set FORM_ENDPOINT below to your GHL inbound webhook URL.
     ============================================================ -->
<script>
{js_ghl}
</script>
"""
(OUT / "3-footer-code.html").write_text(footer, encoding="utf-8")

# ------------------------------------------------------------------ SEO copy --
title = re.search(r"<title>(.*?)</title>", html, re.S).group(1).strip()
desc = re.search(r'<meta name="description" content="(.*?)">', html, re.S).group(1).strip()
og_t = re.search(r'<meta property="og:title" content="(.*?)">', html, re.S).group(1).strip()
og_d = re.search(r'<meta property="og:description" content="(.*?)">', html, re.S).group(1).strip()

seo = f"""Sell To Hermes: SEO fields
Paste these into Funnel/Website > Settings > SEO Meta Data.
Do not paste them as code; they are form fields in GHL.

PAGE TITLE
{title}

META DESCRIPTION
{desc}

SOCIAL SHARE TITLE
{og_t}

SOCIAL SHARE DESCRIPTION
{og_d}

FAVICON
Upload assets/img/favicon.png under Settings > Favicon.

SOCIAL SHARE IMAGE
You do not have one yet. Make a 1200x630 image and upload it in the same panel,
or link previews will show no picture.
"""
(OUT / "4-seo-fields.txt").write_text(seo, encoding="utf-8")


# ------------------------------------------------- the other funnel steps --
# The footer links to these, so they need their own GHL steps. Each one is a
# body paste; they share the head and footer code with the main page.
OTHER = {
    "thank-you.html": ("5-thank-you-body.html", "/thank-you"),
    "privacy.html":   ("6-privacy-body.html",   "/privacy-policy"),
    "terms.html":     ("7-terms-body.html",     "/terms-and-conditions"),
}
for src, (out_name, path) in OTHER.items():
    page = (ROOT / src).read_text(encoding="utf-8")
    b = re.search(r"<body>(.*)</body>", page, re.S).group(1)
    b = re.sub(r'<script src="assets/js/main\.js" defer></script>\s*', "", b)
    for old, new in links.items():
        b = b.replace(old, new)
    b = inline_images(b)
    note = f"""<!-- ============================================================
     Sell To Hermes: GoHighLevel PAGE BODY for the {path} step
     Paste into a full-width Custom Code / HTML element on that step.
     ============================================================ -->
"""
    (OUT / out_name).write_text(note + b.strip() + "\n", encoding="utf-8")

for f in sorted(OUT.glob("*")):
    print(f"{f.name:24} {f.stat().st_size/1024:8.1f} KB")
