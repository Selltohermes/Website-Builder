# Sell To Hermes website

A fast, conversion-focused single-page site for **Sell To Hermes**, a Palm Beach, FL
cash home buyer. Static HTML/CSS/JS with no build step, no dependencies and no framework.
Drop the folder on any host and it runs.

```
├── index.html          Main landing page (hero form, how it works, comparison,
│                       situations, reviews, about, FAQ, CTA, footer)
├── thank-you.html      Post-submission page (also your ad conversion page)
├── privacy.html        Privacy policy
├── terms.html          Terms & conditions
├── 404.html            Not-found page
├── robots.txt          Search engine directives
├── sitemap.xml         Sitemap
├── netlify.toml        Netlify config: security headers + asset caching
├── assets/
│   ├── css/styles.css  Whole design system (colors, type, components)
│   ├── js/main.js      Form, FAQ, mobile menu, scroll reveal
│   └── img/            Logo + favicon (SVG)
└── scripts/
    └── check-placeholders.sh   Lists anything still unfilled
```

## 1. Point the form at somewhere real (do this first)

Out of the box the form opens the visitor's email client addressed to
`Hermes@Selltohermes.com`. That works, but it loses leads on mobile. Pick a real
endpoint and set it once, at the top of `assets/js/main.js`:

```js
var FORM_ENDPOINT = '';   // ← paste your endpoint here
```

| Option | What to paste | Notes |
|---|---|---|
| **Formspree** (easiest) | `https://formspree.io/f/xxxxxxxx` | Free tier, emails you each lead |
| **Netlify Forms** | `/`, and also add `netlify` and a hidden `form-name` input to the `<form>` | Free if you host on Netlify |
| **Zapier / Make webhook** | Your webhook URL | Push straight into a CRM or Google Sheet |
| **Your own API** | Your URL | Receives JSON |

The JSON payload includes the property details, the contact details, and the
UTM/gclid/fbclid parameters so you can tell which ads actually produce sellers.

## 2. Swap in your real logo file

`assets/img/logo.svg` (full winged crest, used large in the footer) and
`assets/img/logo-mark.svg` (simplified shield, used small in the header) are
**hand-drawn stand-ins** built to match your STH Property Solutions crest. They are
close, but they are not your actual artwork, and the "STH" letters render in whatever
serif the visitor has installed. Replace them with your real file:

```sh
sh scripts/set-logo.sh path/to/your-logo.png
```

Use a transparent PNG or an SVG. Two notes on sizing:

- The full crest carries fine feather detail that turns to mush below about 70px, which
  is why the header uses the simplified mark instead. If you have a cropped version of
  the crest without the "PROPERTY SOLUTIONS" wordmark, pass it as a second argument and
  the header will use it too.
- Your source file is square with a lot of transparent padding. Trim that padding before
  using it, or the logo will look small next to the wordmark.

## 3. Fill in the placeholders

Everything not confirmed is bracketed, e.g. `[XXX]+`. Run:

```sh
sh scripts/check-placeholders.sh
```

It exits non-zero and lists every one. The list:

- **`index.html`, homes bought stat.** Replace `[XXX]+` with your real number, or delete that tile.
- **`index.html`, three testimonials.** These are marked `[REPLACE WITH A REAL REVIEW]`.
  **Do not publish the samples.** Use real Google/Facebook reviews or written
  testimonials you have permission to use. Fabricated reviews are an FTC problem.
- **`index.html`, about photo.** Add `assets/img/hermes.jpg` and swap the placeholder block
  (the comment above it shows the exact `<img>` to use).
- **`index.html`, about paragraph.** Two or three sentences in your own voice: how long
  you've bought in Palm Beach County, why you started, what sellers should know.
- **`index.html`, social links.** Point them at your real profiles or delete them.
- **`index.html`, service-area list.** Trim to the cities you actually buy in.
- **`privacy.html` and `terms.html`**: set the "Last updated" date, and disclose any
  analytics/pixel you install. **Have an attorney review both before launch.**

## 4. Add an OG image

Social/text-message previews look for `assets/img/og-image.jpg` (1200×630). Until you
add one, shared links show no preview image.

## 5. Deploy

Any static host works. Drag the folder into **Netlify** (`netlify.toml` is already set up
with security headers and asset caching), or use Vercel, Cloudflare Pages or GitHub Pages.

Then point `selltohermes.com` at it and confirm the canonical URL in `index.html`
matches the live domain.

## Notes on how it's built

- **Palette:** ink navy `#0A1A2F` + Hermes gold `#D4A537` on warm off-white. The navy
  carries over from the existing site's footer; the gold is the new accent.
- **Type:** Plus Jakarta Sans for headings, Inter for body, loaded from Google Fonts.
- **The form is three short steps, not one long one.** Property → situation → contact.
  Asking for a phone number last, after someone has already invested two steps, measurably
  beats asking for it up front.
- **Mobile puts the form directly under the headline** and pins a call/offer bar to the
  bottom of the screen. Most cash-offer traffic is mobile.
- **Accessibility:** keyboard-operable throughout, visible focus rings, ARIA on the
  accordion and menu, and all motion respects `prefers-reduced-motion`.
- **No trackers are installed.** If you add Google Ads or a Meta Pixel, fire the
  conversion on `thank-you.html` and disclose it in `privacy.html`.

## Honest-claims checklist

The copy makes specific promises. Make sure each is true for you before launch, and edit
any that isn't:

- "Cash offer in 24 hours"
- "Close in as little as 7 days"
- "No fees, no commissions, we cover normal closing costs"
- "We buy as-is / any condition"

The footer disclaimer already states that you're an investor rather than an agent, that
offers are non-binding until signed, and that you typically buy below retail in exchange
for speed. Keep it. That is what keeps aggressive marketing claims defensible.
