// Prints the SCENT_MATCH lines for names a shopper might type, so the names
// themselves never need to be written into the site's files.
//
//   node scripts/match-key.mjs m-saqr "اسم العطر" "perfume name" ...
//
// Paste the printed lines into SCENT_MATCH in src/catalog.js and rebuild.
// A name of several words also matches when typed alone only if you list it
// alone too (e.g. list both "brand name" and "name").
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [, , id, ...names] = process.argv;
if (!id || !names.length) {
  console.error('usage: node scripts/match-key.mjs <product-id> "name" ["another spelling" ...]');
  process.exit(1);
}
const box = { window: { location: { hash: "" } }, URLSearchParams, encodeURIComponent, decodeURIComponent, console };
vm.createContext(box);
vm.runInContext((await readFile(path.join(root, "src/catalog.js"), "utf8")) + "\n" + (await readFile(path.join(root, "src/lib.js"), "utf8")) +
  "\n;globalThis.__m = { matchHash, matchWords, productById };", box);
const M = box.__m;
if (!M.productById(id)) { console.error(`unknown product id: ${id}`); process.exit(1); }
const seen = new Set();
for (const n of names) {
  const key = M.matchWords(n).join("");
  if (!key || seen.has(key)) continue;
  seen.add(key);
  console.log(`  "${M.matchHash(key)}": "${id}",`);
}
