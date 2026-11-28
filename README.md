# KEMET — عطور كيميت

A static Arabic (RTL) storefront for KEMET perfumes. Customers browse, pick a
size, build a basket, and send the order as a ready-made **WhatsApp message**
to the shop (`wa.me/201154615084`). The site takes no payment.

## Deploy

The site is published with **GitHub Pages** from the `main` branch:
https://muhammadsmart.github.io/kemet-perfumes/

1. On GitHub: **Settings → Pages → Build and deployment → Deploy from a branch**,
   then pick `main` and `/ (root)`, and save. (Free accounts need a public repo.)
2. Every push to `main` republishes the site within a minute or two.

`.nojekyll` tells Pages to serve the files as they are.

Any other static host works too: upload `index.html`, `main.js`, `main.css`,
`assets/` and `fonts/`, keeping them side by side. Opening `index.html` directly
from disk also works, because the site uses `#/` URLs.

If the address changes (another host or your own domain), update `og:url` and
`og:image` in `index.html`. WhatsApp and Facebook need that full address to show
the preview picture when someone shares the link.

## Visitor statistics

Visits are counted with [Umami](https://cloud.umami.is), without cookies and
without personal data. Open the Umami dashboard to see visitors, countries,
devices, where they came from (WhatsApp, Instagram, Google…) and these events:

| Event | When | Details sent |
|---|---|---|
| page view | every page opened | page path, e.g. `/p/w-hams` (no search text, no size) |
| `add-to-basket` | Add to basket | product, size, quantity |
| `open-basket` | basket opened | — |
| `search` | visitor stops typing in search | the words (first 40 characters), number of results |
| `whatsapp-order` | "Send order" in the basket, or "Order just this" on a product | basket or product, items, price range |
| `whatsapp-question` | any other WhatsApp button | topic (scent, availability, sets, no results, general) and page |

Settings are in `src/analytics.js`: the Website ID, and `domains`, which limits
counting to the published site, so local previews don't count. If the site
address changes, update `domains`. Clear the Website ID and rebuild to turn
statistics off.

## Preview locally

```
node scripts/serve.mjs 8080 .
```

Then open http://localhost:8080. This needs Node 22 or newer and installs nothing.

## Edit → build → check

The deployed `main.js`, `main.css` and the first-paint part of `index.html` are
**generated**. Edit the files in `src/`, then run:

```
node scripts/build.mjs     # writes main.js, main.css and the shell inside index.html
node scripts/check.mjs     # build is fresh, catalog, prices, WhatsApp message format, router
```

| What you want to change | File |
|---|---|
| Products, prices, sizes, WhatsApp number, homepage picks | `src/catalog.js` |
| Scent families, notes and "character" (add them only from the real product sheet) | `src/catalog.js` (optional fields are documented at the top) |
| Colors, fonts, spacing, radii | `src/styles/tokens.css` (headings: El Messiri; the Latin "KEMET": Marcellus; both SIL OFL, licenses in `fonts/`. Each `.woff` is made from its `.ttf` with `node scripts/ttf-to-woff.mjs <in.ttf> <out.woff>`) |
| Cartouche around the logo, engraved-gold story heading | `src/styles/layout.css` (`.cartouche`), `src/styles/pages.css` (`.story-copy h2`) |
| What shows before `main.js` loads (first paint) | `src/shell.js` (see below) |
| Header, menu, footer, drawers, sticky basket bar, breakpoints | `src/styles/layout.css` |
| Buttons, filter chips, cards, size picker, basket lines, divider | `src/styles/components.css` |
| Hero, story, collection, product page layouts | `src/styles/pages.css` |
| Page content and structure | `src/pages.js` |
| Shared UI pieces | `src/components.js` |
| Emblem, product drawings, chevron-to-wave divider, lotus | `src/art.js` |
| Prices, messages, basket, routing helpers | `src/lib.js` |

Breakpoints are mobile-first:

- 360 px: size options go from stacked to side by side
- 480 px: quantity and Add button sit in one row
- 720 px: tablet grid and the two-column hero
- 900 px: the product page splits into two columns
- 1024 px: desktop nav, 4-column grid, and the sticky basket bar is replaced by the header basket
- 1280 px: 5-column grid, so each 5-product section fits on one row

### First paint

`main.js` is large, so `index.html` carries a light copy of the top of each page
that shows while it downloads. The build renders the header and homepage hero
from the app's own components, so you never edit them twice. On a product link,
`src/shell.js` draws the photo, name and price, and starts the photo download
early. On a collection link it draws the title. React replaces it all with
identical layout, so nothing jumps. Don't edit between the `<!-- build:... -->`
markers in `index.html`; the build rewrites them.

### Why there is no npm/bundler

There is no npm or bundler because the original site was delivered as a prebuilt
bundle, without its source. `vendor/kit-runtime.head.js` is that bundle's
React 18 runtime, kept byte-for-byte. The build wraps the readable app code in
`src/` between `head` and `tail`. Moving to a standard React + Vite setup would
shrink the 870 KB `main.js` a lot. That is the main remaining performance
opportunity: collection pages still wait for it before showing products.

Make sure your host compresses `.js`, `.css` and `.html` (gzip or Brotli). Most
static hosts do this by default; `main.js` goes from 870 KB to about 230 KB.

## URLs

| URL | Page |
|---|---|
| `/` or `#/` | Home (`#/?s=story`, `#/?s=order` jump to sections) |
| `#/collection` | All products (`/women`, `/men`, `/lotion`, … to filter; `?q=` search; `?family=` scent family) |
| `#/p/<product-id>` | Product (`?size=s30\|s50\|s100`) |
| `#sec-women` etc. | Links from the old one-page site still land on the matching section |

## Testing UI states

```
node scripts/build.mjs --fixtures
```

This writes `fixtures.html`, which uses demo data: a very long product name, an
unavailable 100 ml size, a fully unavailable product, and placeholder scent notes
and families. It is git-ignored. **Never deploy it.**

## Screenshots

`docs/screenshots/before` shows the original site. `docs/screenshots/after` shows
the redesign at 390 px and 1440 px. To regenerate them with headless Edge or
Chrome, run this with the preview server running:

```
node scripts/screenshots.mjs http://localhost:8080/ docs/screenshots/after "home=#/" "collection=#/collection" "product=#/p/w-nefertari"
```

In Git Bash, prefix the command with `MSYS_NO_PATHCONV=1`.

## Brand story sources

The brand story is based on these sources:

- The Met, *Amphora-shaped perfume bottle*, 26.7.1177 (cobalt glass with chevron and festoon trails).
- Griffith Institute, Carter no. 210: Tutankhamun's calcite perfume vase.
- Smithsonian, "Kemet, or black land".

The site uses the winged ankh from the existing brand. It uses no hieroglyphic inscriptions.
