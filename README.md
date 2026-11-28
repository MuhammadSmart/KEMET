# KEMET — عطور كيميت

A static Arabic (RTL) storefront for KEMET perfumes. Customers browse, pick a
size, build a basket, and send the order as a ready-made **WhatsApp message**
to the shop (`wa.me/201154615084`). The site takes no payment.

## Deploy

Upload these files to any static host, keeping them side by side:
`index.html`, `main.js`, `main.css`, `assets/`, `fonts/`.
Opening `index.html` directly from disk also works (the site uses `#/` URLs).

## Preview locally

```
node scripts/serve.mjs 8080 .
```

Then open http://localhost:8080. This needs Node 22 or newer and installs nothing.

## Edit → build → check

The deployed `main.js` and `main.css` are **generated**. Edit the files in `src/`, then run:

```
node scripts/build.mjs     # writes main.js + main.css
node scripts/check.mjs     # catalog, prices, WhatsApp message format, router
```

| What you want to change | File |
|---|---|
| Products, prices, sizes, WhatsApp number, homepage picks | `src/catalog.js` |
| Scent families, notes and "character" (add them only from the real product sheet) | `src/catalog.js` (optional fields are documented at the top) |
| Colors, fonts, spacing, radii | `src/styles/tokens.css` (display font: Reem Kufi, SIL OFL, in `fonts/`) |
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

`index.html` also contains a small static copy of the header and hero. It paints
the homepage before `main.js` finishes loading. If you change the hero text in
`src/pages.js`, update it there too.

### Why there is no npm/bundler

There is no npm or bundler because the original site was delivered as a prebuilt
bundle, without its source. `vendor/kit-runtime.head.js` is that bundle's
React 18 runtime, kept byte-for-byte. The build wraps the readable app code in
`src/` between `head` and `tail`. Moving to a standard React + Vite setup would
shrink the 865 KB `main.js` a lot. That is the main remaining performance
opportunity.

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
