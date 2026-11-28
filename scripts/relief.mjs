// Draws the page background: columns of gold hieroglyph-style signs, cut lightly into the
// alabaster like the inscribed stelae in the Egyptian Museum. Every sign is drawn
// here from simple strokes (no copied artwork). Writes assets/img/relief.svg.
//   node scripts/relief.mjs
import { writeFileSync } from "node:fs";

// Each sign in a 24x24 box, stroked (no fill unless noted).
const SIGNS = {
  ankh: '<ellipse cx="12" cy="6.5" rx="3.6" ry="4.6"/><path d="M12 11.2V23M5.5 13.2h13"/>',
  wedjat: '<path d="M3 6.5Q12 2.5 21 6.5M4 11Q12 5.5 20 11Q12 15 4 11Z"/><circle cx="12" cy="10.6" r="2"/><path d="M10.5 14.2 9.2 21.5M13.6 14.4q1.6 6 6.4 5.2q1.2-2.6-1.4-3.2"/>',
  scarab: '<ellipse cx="12" cy="14.5" rx="5" ry="6.2"/><path d="M8.2 9.2Q12 5.8 15.8 9.2M12 9v11.6M7 12.5 3.5 10.5M17 12.5l3.5-2M7 16l-3.5 1M17 16l3.5 1M8.5 19.5l-2.5 2.5M15.5 19.5l2.5 2.5"/><circle cx="12" cy="3.6" r="2.4"/>',
  djed: '<path d="M9.5 23V9.5M14.5 23V9.5M7 4.5h10M7 7h10M7 9.5h10M8 2h8M7.5 23h9"/>',
  was: '<path d="M12 23V5.5M12 5.5 15.8 3.2l1 2.3-4.8 1M12 23l-2.2-2.4M12 23l2.2-2.4"/>',
  lotus: '<path d="M12 19C10 13.5 10 9 12 4.5C14 9 14 13.5 12 19ZM12 19C8 16 5.5 13 4.5 8.5C8.5 10 11 13.5 12 19ZM12 19C16 16 18.5 13 19.5 8.5C15.5 10 13 13.5 12 19ZM7.5 21.5h9"/>',
  feather: '<path d="M12.4 22.5C8.5 15.5 8.6 7.5 13.6 1.8C15.6 8 15.3 15 12.4 22.5ZM12.6 6.5v16"/>',
  water: '<path d="M2 9.5l2.5-2.5 2.5 2.5 2.5-2.5 2.5 2.5 2.5-2.5 2.5 2.5 2.5-2.5 2.5 2.5M2 15.5l2.5-2.5 2.5 2.5 2.5-2.5 2.5 2.5 2.5-2.5 2.5 2.5 2.5-2.5 2.5 2.5"/>',
  sun: '<circle cx="12" cy="11" r="5.2"/><path d="M17.2 11c2.6 0 3.4 2.4 1.8 3.8M6.8 11c-2.6 0-3.4 2.4-1.8 3.8M7.5 20.5h9"/>',
  reed: '<path d="M11.6 22.5C9.6 15.5 9.8 8.2 12.8 1.8C14.2 8.5 14 15.5 11.6 22.5Z"/>',
  loaf: '<path d="M4.5 17Q12 6 19.5 17ZM4 17h16"/>',
  cartouche: '<rect x="6.5" y="2" width="11" height="18" rx="5.5"/><path d="M6 22.5h12M9.5 7.5h5M12 10.5v5"/>',
  vulture: '<path d="M5 21.5c1-5 3-9 7-10.5c3-1 3.6-4.6 2.2-6.4c2.5 0 4 1.6 3.6 3.6l-1.8.6M11.5 12c-1 3.5-.5 6.5 1.5 9.5M8 21.5h7.5"/>',
  djeser: '<path d="M4 20h16M6 20V9.5h12V20M9 9.5V6.5h6v3"/>',
};
const ORDER = ["ankh", "wedjat", "scarab", "djed", "lotus", "feather", "was", "sun", "reed", "cartouche", "water", "vulture", "loaf", "djeser"];

const COL = 44, ROW = 50, COLS = 7, ROWS = 8;          // tile 308 x 400
const W = COL * COLS, H = ROW * ROWS, SIZE = 26;
let uses = "";
for (let c = 0; c < COLS; c++) {
  for (let r = 0; r < ROWS; r++) {
    const name = ORDER[(r * 3 + c * 5) % ORDER.length];
    const x = c * COL + (COL - SIZE) / 2, y = r * ROW + (ROW - SIZE) / 2 + (c % 2 ? ROW / 2 : 0);
    uses += `<use href="#${name}" x="${x}" y="${(y % H).toFixed(1)}"/>`;
  }
}
// Column rules, like the lines between inscription columns on a stela.
let rules = "";
for (let c = 0; c <= COLS; c++) rules += `<path d="M${c * COL} 0V${H}"/>`;

const symbols = Object.entries(SIGNS).map(([k, v]) => `<symbol id="${k}" viewBox="0 0 24 24" width="${SIZE}" height="${SIZE}" overflow="visible">${v}</symbol>`).join("");
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
  `<defs>${symbols}<g id="signs">${uses}</g></defs>` +
  // Sunken relief: a light edge below-right, the cut itself above it.
  `<g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5">` +
  `<use href="#signs" transform="translate(.7 .7)" stroke="#ffffff" stroke-opacity=".55"/>` +
  `<use href="#signs" stroke="#b8913f" stroke-opacity=".34"/>` +
  `</g><g stroke="#b8913f" stroke-opacity=".16" stroke-width="1">${rules}</g></svg>`;
writeFileSync("assets/img/relief.svg", svg);
console.log(`assets/img/relief.svg: ${W}x${H}, ${svg.length} bytes`);
