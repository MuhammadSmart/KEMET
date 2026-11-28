// Rebuilds SCENT_MATCH in src/catalog.js from the private name list, so the
// names of other brands' perfumes never need to be written into the site.
//
//   node scripts/match-key.mjs [private/scent-names.txt]
//
// The list is plain text (private/ is not committed):
//   m-saqr: name | another spelling | ...      a perfume -> our closest perfume
//   * m-saqr w-lotus: brand | ...              a brand -> our closest men's/women's
//   ? m-saqr: what a shopper might type        a test ("-" = must match nothing)
// Lines starting with # are comments. The script stops on conflicting names and
// failed tests, and leaves catalog.js untouched then.
import { readFile, writeFile } from "node:fs/promises";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const listFile = path.resolve(process.argv[2] || path.join(root, "private/scent-names.txt"));
const catalogFile = path.join(root, "src/catalog.js");

const loadApp = async (catalog) => {
  const box = { window: { location: { hash: "" } }, URLSearchParams, encodeURIComponent, decodeURIComponent, console };
  vm.createContext(box);
  vm.runInContext(catalog + "\n" + (await readFile(path.join(root, "src/lib.js"), "utf8")) +
    "\n;globalThis.__m = { matchHash, matchWords, matchEdits, matchPerfume, productById, products };", box);
  return box.__m;
};

const catalog = (await readFile(catalogFile, "utf8")).replace(/\r\n/g, "\n");
let M = await loadApp(catalog);

const entries = new Map(); // canonical key -> { value, name }
const tests = [];
const problems = [];
for (const [n, raw] of (await readFile(listFile, "utf8")).replace(/\r\n/g, "\n").split("\n").entries()) {
  const line = raw.trim();
  if (!line || line.startsWith("#")) continue;
  const m = line.match(/^([?*])?\s*([a-z0-9 -]+?)\s*:\s*(.+)$/);
  if (!m) { problems.push(`line ${n + 1}: can't read "${line}"`); continue; }
  const [, mark, ids, rest] = m;
  if (mark === "?") { tests.push({ expect: ids, text: rest.trim(), line: n + 1 }); continue; }
  const idList = ids.split(/\s+/);
  for (const id of idList) if (!M.productById(id)) problems.push(`line ${n + 1}: unknown product id ${id}`);
  const value = (mark === "*" ? "*" : "") + idList.join(" ");
  for (const name of rest.split("|").map((s) => s.trim()).filter(Boolean)) {
    const key = M.matchWords(name).join("");
    if (!key) continue;
    if (key.length < 3) problems.push(`line ${n + 1}: "${name}" is too short to match safely`);
    const old = entries.get(key);
    if (old && old.value !== value) problems.push(`line ${n + 1}: "${name}" is also "${old.name}" (${old.value})`);
    else if (!old) entries.set(key, { value, name });
  }
}

// Names one letter apart that point to different perfumes would be ambiguous.
for (const [key, e] of entries) {
  if (key.length < 5) continue;
  for (const edit of new Set(M.matchEdits(key))) {
    const other = entries.get(edit);
    if (other && other.value !== e.value && other.value[0] !== "*" && e.value[0] !== "*" && key < edit)
      console.warn(`  note: "${e.name}" and "${other.name}" are one letter apart`);
  }
}

const sorted = [...entries.entries()].sort((a, b) => (a[1].value + a[0]).localeCompare(b[1].value + b[0]));
const body = sorted.map(([key, e]) => `  "${M.matchHash(key)}": "${e.value}"`).join(",\n");
const re = /var SCENT_MATCH = \{[\s\S]*?\n\};\n?/;
if (!re.test(catalog)) problems.push("src/catalog.js has no `var SCENT_MATCH = {...};` block");
if (problems.length) { console.error(problems.join("\n")); process.exit(1); }
const next = catalog.replace(re, `var SCENT_MATCH = {\n${body}\n};\n`);

M = await loadApp(next);
let failed = 0;
for (const t of tests) {
  const r = M.matchPerfume(t.text);
  const got = r ? r.items[0].id : "-";
  if (got !== t.expect) { failed++; console.error(`  FAIL line ${t.line}: "${t.text}" -> ${got}, expected ${t.expect}`); }
}
if (failed) { console.error(`${failed} of ${tests.length} tests failed; src/catalog.js not changed`); process.exit(1); }
await writeFile(catalogFile, next);
console.log(`SCENT_MATCH: ${entries.size} names -> ${new Set(sorted.map(([, e]) => e.value)).size} results; ${tests.length} tests passed`);
