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
  "\n;globalThis.__k = { ANALYTICS, analyticsUrl, OFFER, offerActive, offerNote, offerUntil, SCENT_PROFILES, SCENT_MATCH, matchPerfume, NOTE_GLOSSARY, ACCORDS, SCENT_FAMILIES, products, SECTIONS, PRICE_TIERS, STD_PRICE, PERFUME_SIZES, WA_NUMBER, orderMessage, basketEntries, sanitizeBasket, parseRoute, collectionHash, money, toAr, priceRange, priceLabel, fromPrice, defaultSize };";
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
    "#/p/horus", "#/p/horus?size=s30", "#/p/w-hams", "#/p/nope", "#/collection/unisex", "#sec-lotion", "#sec-nope", "#/whatever"]) {
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

await test("site icons, manifest and shop details for search engines are valid", async () => {
  const html = await read("index.html");
  for (const m of html.matchAll(/<link rel="(?:icon|apple-touch-icon|manifest)" href="([^"]+)"/g)) await access(path.join(root, m[1]));
  const manifest = JSON.parse(await read("site.webmanifest"));
  for (const icon of manifest.icons) await access(path.join(root, icon.src));
  const ld = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/)[1]);
  assert.equal(ld["@type"], "Store");
  assert.equal(ld.telephone, "+" + K.WA_NUMBER);
  assert.ok(ld.address.streetAddress && !/[٠-٩]/.test(ld.address.streetAddress), "address digits should be 0-9");
});

await test("non-perfume products, sizes and sections match the original site (perfumes come from the shop's stock list)", async () => {
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
  const strip = (arr) => arr.filter((p) => !p.sized).map((p) => ({ id: p.id, section: p.section, name: p.name }));
  assert.deepEqual(JSON.parse(JSON.stringify(strip(K.products))), JSON.parse(JSON.stringify(strip(L.products))));
  assert.equal(K.STD_PRICE, L.SIZE_PRICES.std.value);
  assert.deepEqual(JSON.parse(JSON.stringify(K.PERFUME_SIZES)), JSON.parse(JSON.stringify(L.PERFUME_SIZES)));
  // The original sections, in order; "للجنسين" was added for the new stock.
  const added = ["unisex"];
  assert.equal(JSON.stringify(K.SECTIONS.filter((s) => !added.includes(s.id)).map((s) => [s.id, s.title])), JSON.stringify(L.SECTIONS.map((s) => [s.id, s.title])));
  assert.equal(K.WA_NUMBER, L.WA_NUMBER);
});

await test("WhatsApp order message keeps the original format", () => {
  const msg = K.orderMessage(K.basketEntries({ "horus:s50": 2, "rotab:s30": 1, "ms-white:std": 1 }));
  assert.equal(msg, [
    "أهلاً، عايز أطلب من كيميت:",
    "• حورس ٥٠ مل × ٢ = ١٠٠٠ جنيه",
    "• رطب ٣٠ مل × ١ = ٢٥٠ جنيه",
    "• مسك أبيض × ١ = ١٠٠ جنيه",
    "الإجمالي: ١٣٥٠ جنيه",
  ].join("\n"));
});

await test("basket sanitizer drops unknown products/sizes and clamps quantities", () => {
  const b = K.sanitizeBasket({ "horus:s30": 3, "nope:s30": 1, "w-hams:s50": 1, "horus:s75": 1, "ms-white:s50": 1, "l-rose:std": 250, "f-car:std": -2 });
  assert.deepEqual(JSON.parse(JSON.stringify(b)), { "horus:s30": 3, "l-rose:std": 99 });
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

await test("scent profiles: known products, accords and families, every note explained", () => {
  const families = K.SCENT_FAMILIES.map((f) => f.id);
  for (const [id, prof] of Object.entries(K.SCENT_PROFILES)) {
    assert.ok(K.products.some((p) => p.id === id), `${id}: no such product`);
    assert.ok(families.includes(prof.family), `${id}: unknown family ${prof.family}`);
    for (const [acc, strength] of prof.accords || []) {
      assert.ok(K.ACCORDS[acc], `${id}: unknown accord ${acc}`);
      assert.ok(strength > 0 && strength <= 100, `${id}: accord strength ${strength}`);
    }
    assert.ok(prof.character, `${id}: a profile needs at least a scent line`);
    const n = prof.notes || {};
    const notes = [].concat(n.top || [], n.heart || [], n.base || []);
    const missing = notes.filter((n) => !K.NOTE_GLOSSARY[n]);
    assert.deepEqual(missing, [], `${id}: notes without a plain-language description`);
  }
});

await test("perfume matching: hashed keys only, real products, everyday words match nothing", () => {
  for (const [key, value] of Object.entries(K.SCENT_MATCH)) {
    assert.match(key, /^[0-9a-f]{12}$/, `${key}: keys are hashes, never readable names`);
    for (const id of value.replace(/^[*]/, "").split(" "))
      assert.ok(K.products.some((p) => p.id === id && p.sized), `${key}: no such perfume ${id}`);
  }
  // Our own names, every note and scent word, and everyday requests (exact or one
  // letter off) must not be mistaken for a famous perfume.
  const everyday = [
    "", "عطر حلو", "عايز حاجة فريش للصيف", "بدور على عطر رجالي", "عايز هدية لمراتي", "عندكم عطر ثابت وفواح؟",
    "ريحة نضيفة للشغل", "حاجة تقيلة للشتا", "عطر للسهرة", "بكام الزجاجة", "سعر ١٠٠ مل", "توصيل لحد البيت",
    "مسك", "عود", "عنبر", "ورد", "فانيليا", "دهن عود", "بخور", "مسك الطهارة", "معطر جو", "بودي سبلاش", "لوشن",
    "perfume", "fresh", "sweet", "oud", "musk", "vanilla", "gift", "summer", "winter", "men", "women",
    ...K.products.map((p) => p.name),
    ...Object.keys(K.NOTE_GLOSSARY),
    ...Object.values(K.ACCORDS).map((a) => a.title),
    ...K.SCENT_FAMILIES.map((f) => f.title),
  ];
  for (const text of everyday) {
    const r = K.matchPerfume(text);
    assert.equal(r, null, `"${text}" should not match (got ${r && r.items.map((p) => p.id)})`);
  }
});

await test("opening offer: shows until its end date and adds a line to orders", () => {
  const saved = K.OFFER.endsOn;
  try {
    K.OFFER.endsOn = "2026-12-31";
    assert.equal(K.offerActive(new Date(2026, 11, 31, 23, 0)), true);
    assert.equal(K.offerActive(new Date(2027, 0, 1, 0, 30)), false);
    assert.equal(K.offerUntil(), "لحد ٣١ ديسمبر");
    K.OFFER.endsOn = null;
    assert.equal(K.offerActive(new Date(2030, 0, 1)), K.OFFER.percent > 0);
  } finally { K.OFFER.endsOn = saved; }
  if (K.offerActive()) assert.match(K.offerNote(), /^\n.+خصم ٢٠٪ على كل المنتجات$/);
});

await test("prices: two tiers, every perfume in one, default size", () => {
  assert.deepEqual(JSON.parse(JSON.stringify(K.PRICE_TIERS)), {
    basic: { title: "أساسي", s30: 250, s50: 350, s100: 650 },
    legend: { title: "أسطوري", s30: 350, s50: 500, s100: 800 },
  });
  for (const p of K.products.filter((x) => x.sized)) assert.ok(K.PRICE_TIERS[p.tier], `${p.id}: no price tier`);
  const byId = (id) => K.products.find((p) => p.id === id);
  assert.equal(K.priceLabel(byId("rotab"), "s100"), "٦٥٠ جنيه");
  assert.equal(K.priceLabel(byId("horus"), "s30"), "٣٥٠ جنيه");
  assert.equal(K.fromPrice(byId("horus")), 350);
  assert.equal(K.priceLabel(byId("ms-white"), "std"), "١٠٠ جنيه");
  assert.equal(K.defaultSize(K.products[0]), "s50");
  assert.equal(K.money(350, 400), "٣٥٠ - ٤٠٠ جنيه");
});

console.log(`\n${passed} passed, ${failures.length} failed${skipped ? `, ${skipped} skipped` : ""}`);
if (failures.length) process.exit(1);
