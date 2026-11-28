# Mobile load timing (same conditions, back to back)

Measured with `scripts/screenshots.mjs` (headless Edge): 390×844 at 2× DPR,
150 ms RTT, 1.6 Mbps down, 4× CPU slowdown, cache disabled, homepage.

| | First contentful paint | Largest contentful paint | Load event | Requests | Transfer |
|---|---|---|---|---|---|
| Before (original site) | 5.7 s | 7.5 s | 7.4 s | 7 | 1.35 MB |
| After (redesign) | 1.2 s | 1.25 s | 6.3 s | 9 | 1.47 MB |

The first screen (brand, headline, product photo and the "اكتشف العطور" button) now
paints from static HTML, a 33 KB stylesheet (down from 105 KB) and a preloaded 50 KB WebP
hero, before the 865 KB React runtime finishes downloading. Total bytes are similar
because that runtime is unchanged and the display font adds 127 KB. Moving to a standard
React/Vite build is the next big win.
