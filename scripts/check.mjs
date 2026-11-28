// Zero-dependency checks: node scripts/check.mjs
// - main.js, main.css and index.html's first-paint shell match a fresh build of src/
// - the shell's route parsing and breadcrumbs match the app's
// - catalog integrity (unique IDs, sections, prices, photo files exist)
// - IDs, names, sections and prices match the original site (from git history)
// - WhatsApp basket message keeps the original format
// - router parses every public URL form, including legacy #sec-* anchors
import { readFile, access } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import vm from "node:vm";
import path from "node:path";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { buildAll } from "./build.mjs";
import { buildShell } from "./shell.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFile(path.join(root, p), "utf8");
let passed = 0;
let skipped = 0;
const failures = [];
const SKIP = Symbol("skip");
async function test(name, fn) {
  try {
    if ((await fn()) === SKIP) { skipped++; console.log(`  --  ${name} (skipped)`); return; }
    passed++; console.log(`  ok  ${name}`);
  }
  catch (e) { failures.push(name); console.log(`  FAIL ${name}\n       ${e.message.split("\n").join("\n       ")}`); }
}

// Load catalog + lib into a sandbox (they are plain scripts sharing one scope).
const sandbox = {
  window: { localStorage: { _s: {}, getItem(k) { return this._s[k] ?? null; }, setItem(k, v) { this._s[k] = String(v); } } },
  URLSearchParams, encodeURIComponent, decodeURIComponent, console,
  // lib.js references these React hooks only inside useRoute (not called here).
  useSyncExternalStore: () => "", useMemo: (f) => f(),
};
vm.createContext(sandbox);
const code = (await read("src/catalog.js")) + "\n" + (await read("src/lib.js")) + "\n" + (await read("src/analytics.js")) +
  "\n;globalThis.__k = { ANALYTICS, analyticsUrl, products, SECTIONS, SIZE_PRICES, PERFUME_SIZES, WA_NUMBER, orderMessage, basketEntries, sanitizeBasket, parseRoute, collectionHash, money, toAr, priceRange, perMlLabel, defaultSize };";
vm.runInContext(code, sandbox);
const K = sandbox.__k;

console.log("KEMET checks");

await test("main.js, main.css and index.html match a fresh build of src/", async () => {
  execFileSync(process.execPath, ["--check", path.join(root, "main.js")]);
  const built = await buildAll();
  const lf = (t) => t.replace(/\r\n/g, "\n");
  for (const [file, want] of [["main.js", built.js], ["main.css", built.css], ["index.html", built.html]]) {
    assert.ok(lf(await read(file)) === lf(want), `${file} is stale — run node scripts/build.mjs`);
  }
});

// The first-paint shell (src/shell.js) runs before main.js, so it has its own
// small router and breadcrumb markup. Check both agree with the app.
const shellBuild = await buildShell(root);
const shellBox = {
  location: { hash: "#/" },
  document: { head: { appendChild() {} }, createElement: () => ({ setAttribute() {} }) },
  decodeURIComponent,
};
shellBox.window = shellBox;
vm.createContext(shellBox);
vm.runInContext((await read("src/shell.js")).replace("__SHELL_HEAD__", JSON.stringify(shellBuild.head)).replace("__SHELL_DATA__", JSON.stringify(shellBuild.data)), shellBox);
const S = shellBox.__kemetShell;

await test("first-paint shell routes and breadcrumbs match the app", () => {
  assert.equal(S.crumbs([{ to: "#/", label: "الرئيسية" }, { label: "X" }]), shellBuild.crumbSample);
  const kind = (r) => (r.name === "product" && !K.products.some((p) => p.id === r.id) ? "notfound" : r.name);
  for (const hash of ["", "#/", "#/?s=story", "#/collection", "#/collection/men", "#/collection/nope", "#/collection?q=x",
    "#/p/w-hams", "#/p/w-hams?size=s30", "#/p/nope", "#sec-lotion", "#sec-nope", "#/whatever"]) {
    const shell = S.parse(hash).name;
    assert.equal(shell === "other" ? "notfound" : shell, kind(K.parseRoute(hash)), `shell and app disagree on "${hash}"`);
  }
});

await test("product IDs are unique and sections exist", () => {
  const ids = K.products.map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length, "duplicate product id");
  for (const p of K.products) assert.ok(K.SECTIONS.some((s) => s.id === p.section), `${p.id}: unknown section ${p.section}`);
});

await test("every product photo file exists", async () => {
  for (const p of K.products.filter((x) => x.photo)) {
    for (const f of [p.photo.w320, p.photo.w640, p.photo.jpg]) await access(path.join(root, f));
  }
});

await test("catalog matches the original site (IDs, names, sections, sizes, prices; descriptions may be edited)", async () => {
  let legacy;
  try {
    legacy = execFileSync("git", ["show", "413e16e:main.js"], { cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  } catch {
    return SKIP; // original commit 413e16e not available (e.g. a copy without git history)
  }
  const start = legacy.indexOf("var SIZE_PRICES");
  const end = legacy.indexOf("function toAr");
  const box = { theme: 0 };
  vm.createContext(box);
  const stubs = legacy.slice(legacy.indexOf("var WA_NUMBER"), legacy.indexOf("// src/App.tsx", legacy.indexOf("var WA_NUMBER")))
    + "\nvar import_jsx_runtime = {};\n";
  vm.runInContext(stubs + legacy.slice(start, end) + "\n;globalThis.__l = { products, SIZE_PRICES, PERFUME_SIZES, SECTIONS, WA_NUMBER };", box);
  const L = box.__l;
  // Descriptions are shop copy the owner rewrites (e.g. "من المحل" dropped), so they aren't compared.
  const strip = (arr) => arr.map((p) => ({ id: p.id, section: p.section, name: p.name, sized: p.sized }));
  assert.deepEqual(JSON.parse(JSON.stringify(strip(K.products))), JSON.parse(JSON.stringify(strip(L.products))));
  assert.deepEqual(JSON.parse(JSON.stringify(K.SIZE_PRICES)), JSON.parse(JSON.stringify(L.SIZE_PRICES)));
  assert.deepEqual(JSON.parse(JSON.stringify(K.PERFUME_SIZES)), JSON.parse(JSON.stringify(L.PERFUME_SIZES)));
  assert.equal(JSON.stringify(K.SECTIONS.map((s) => [s.id, s.title])), JSON.stringify(L.SECTIONS.map((s) => [s.id, s.title])));
  assert.equal(K.WA_NUMBER, L.WA_NUMBER);
});

await test("WhatsApp order message keeps the original format", () => {
  const msg = K.orderMessage(K.basketEntries({ "w-hams:s50": 2, "ms-white:std": 1 }));
  assert.equal(msg, [
    "أهلاً، عايز أطلب من كيميت:",
    "• همس الليل ٥٠ مل × ٢ = ٧٠٠ - ٨٠٠ جنيه",
    "• مسك أبيض × ١ = ١٠٠ جنيه",
    "الإجمالي: ٨٠٠ - ٩٠٠ جنيه",
  ].join("\n"));
});

await test("basket sanitizer drops unknown products/sizes and clamps quantities", () => {
  const b = K.sanitizeBasket({ "w-hams:s30": 3, "nope:s30": 1, "w-hams:s75": 1, "ms-white:s50": 1, "l-rose:std": 250, "f-car:std": -2 });
  assert.deepEqual(JSON.parse(JSON.stringify(b)), { "w-hams:s30": 3, "l-rose:std": 99 });
});

await test("router handles home, collection, product, legacy anchors and unknown paths", () => {
  const r = (h) => JSON.parse(JSON.stringify(K.parseRoute(h)));
  assert.equal(r("").name, "home");
  assert.equal(r("#/").name, "home");
  assert.equal(r("#/?s=story").scrollTo, "story");
  assert.deepEqual(r("#/collection"), { name: "collection", section: null, q: "", family: null });
  assert.deepEqual(r("#/collection/men?q=%D9%81%D8%A7%D8%B1%D8%B3"), { name: "collection", section: "men", q: "فارس", family: null });
  assert.deepEqual(r("#sec-women"), { name: "collection", section: "women", q: "", family: null });
  assert.deepEqual(r("#/p/w-hams?size=s30"), { name: "product", id: "w-hams", size: "s30" });
  assert.equal(r("#/collection/unknown").name, "notfound");
  assert.equal(r("#/whatever").name, "notfound");
  assert.equal(K.collectionHash("women", "مسك", null), "#/collection/women?q=%D9%85%D8%B3%D9%83");
});

await test("statistics: page URLs leave out search text and sizes", () => {
  assert.equal(K.analyticsUrl(""), "/");
  assert.equal(K.analyticsUrl("#/"), "/");
  assert.equal(K.analyticsUrl("#/?s=story"), "/?s=story");
  assert.equal(K.analyticsUrl("#/p/w-hams?size=s30"), "/p/w-hams");
  assert.equal(K.analyticsUrl("#/collection/men?q=abc&family=floral"), "/collection/men?family=floral");
  assert.equal(K.analyticsUrl("#sec-men"), "/collection/men");
  assert.match(K.ANALYTICS.umamiWebsiteId, /^$|^[0-9a-f-]{36}$/, "Umami Website ID should be empty or a UUID");
});

await test("prices: default size, ranges, per-ml labels", () => {
  assert.equal(K.defaultSize(K.products[0]), "s50");
  assert.equal(K.money(350, 400), "٣٥٠ - ٤٠٠ جنيه");
  assert.equal(K.perMlLabel("s100"), "٥ جنيه للملّي");
  assert.equal(K.perMlLabel("s50"), "٧ - ٨ جنيه للملّي");
});

console.log(`\n${passed} passed, ${failures.length} failed${skipped ? `, ${skipped} skipped` : ""}`);
if (failures.length) process.exit(1);
