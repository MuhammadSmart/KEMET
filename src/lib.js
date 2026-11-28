// ===== src/lib.js =====
// Pure helpers: numbers, prices, catalog lookups, WhatsApp messages, basket, routing.

function toAr(n) {
  return String(n).replace(/\d/g, function (d) { return "٠١٢٣٤٥٦٧٨٩"[+d]; });
}

var normalizeAr = function (s) {
  return s.replace(/[ً-ْٰـ]/g, "").replace(/[أإآٱ]/g, "ا").replace(/ى/g, "ي")
    .replace(/ؤ/g, "و").replace(/ئ/g, "ي").replace(/ة/g, "ه").toLowerCase().trim();
};

function money(lo, hi) {
  return lo === hi ? toAr(lo) + " جنيه" : toAr(lo) + " - " + toAr(hi) + " جنيه";
}

var AR_MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
function offerActive(now) {
  if (!OFFER || !OFFER.percent) return false;
  if (!OFFER.endsOn) return true;
  var d = now || new Date();
  var pad = function (n) { return (n < 10 ? "0" : "") + n; };
  return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) <= OFFER.endsOn;
}
// "عرض الافتتاح: خصم ٢٠٪ على كل المنتجات"
function offerTitle() {
  return OFFER.label + ": خصم " + toAr(OFFER.percent) + "٪ على كل المنتجات";
}
// "لحد ٣١ ديسمبر" (empty when there is no end date)
function offerUntil() {
  if (!OFFER.endsOn) return "";
  var parts = OFFER.endsOn.split("-");
  return "لحد " + toAr(+parts[2]) + " " + AR_MONTHS[+parts[1] - 1];
}
// Line added to WhatsApp orders while the offer runs, so the shop applies it.
function offerNote() {
  return offerActive() ? "\n" + offerTitle() : "";
}

// The shop's number for display ("+20 115 461 5084") and for tap-to-call.
function phoneDisplay() {
  return "+" + WA_NUMBER.slice(0, 2) + " " + WA_NUMBER.slice(2, 5) + " " + WA_NUMBER.slice(5, 8) + " " + WA_NUMBER.slice(8);
}
function telLink() {
  return "tel:+" + WA_NUMBER;
}

function waLink(text) {
  return "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(text);
}

// "بتحب عطر معين؟": what a shopper types is matched against SCENT_MATCH.
// Words are reduced to a spelling-neutral form (Arabic letter forms, ص/س, ق/ك,
// ch/sh, c/k, doubled letters...), every run of 1-3 words is tried, and if no
// name matches exactly, one wrong, missing, extra or swapped letter is allowed
// in names of 5+ letters. Keys are hashes, so the names never appear in the site.
var MATCH_AR = { "ص": "س", "ث": "س", "ط": "ت", "ذ": "ز", "ظ": "ز", "ض": "د", "ق": "ك", "گ": "ك", "چ": "ج", "ڤ": "ف", "پ": "ب", "ء": "" };
var MATCH_LETTERS = { ar: "ابتجحخدرزسشعغفكلمنهوي", la: "abdefghijklmnoprstuv" };
function matchHash(s) {
  var a = 0x811c9dc5, b = 0x811c9dc5, n = s.length;
  for (var i = 0; i < n; i++) {
    a ^= s.charCodeAt(i); a = Math.imul(a, 0x01000193) >>> 0;
    b ^= s.charCodeAt(n - 1 - i); b = Math.imul(b, 0x01000193) >>> 0;
  }
  return ("0000000" + a.toString(16)).slice(-8) + ("0000000" + b.toString(16)).slice(-4);
}
function matchCanon(word) {
  var w = word.replace(/sch|ch/g, "sh").replace(/ph/g, "f").replace(/ck/g, "k").replace(/[cq]/g, "k")
    .replace(/z/g, "s").replace(/y/g, "i").replace(/w/g, "v").replace(/x/g, "ks")
    .replace(/[صثطذظضقگچڤپء]/g, function (c) { return MATCH_AR[c]; });
  return w.replace(/(.)\1+/g, "$1");
}
function matchWords(text) {
  var plain = normalizeAr(String(text).normalize("NFD").replace(/[̀-ͯ]/g, ""))
    .replace(/[٠-٩]/g, function (d) { return "٠١٢٣٤٥٦٧٨٩".indexOf(d); });
  return plain.split(/[^0-9a-zء-يپچڤگ]+/).filter(Boolean).map(matchCanon);
}
// Every spelling one letter away from w (substituted, inserted, deleted, swapped).
function matchEdits(w) {
  var A = /[a-z]/.test(w) ? MATCH_LETTERS.la : MATCH_LETTERS.ar, out = [], i, j;
  for (i = 0; i <= w.length; i++) {
    for (j = 0; j < A.length; j++) {
      out.push(w.slice(0, i) + A[j] + w.slice(i));
      if (i < w.length) out.push(w.slice(0, i) + A[j] + w.slice(i + 1));
    }
    if (i < w.length && w.length >= 6) out.push(w.slice(0, i) + w.slice(i + 1));
    if (i < w.length - 1) out.push(w.slice(0, i) + w[i + 1] + w[i] + w.slice(i + 2));
  }
  return out;
}
// -> { items: [product, ...], brand: bool } or null. A perfume name beats a brand
// name, an exact match beats a near one, and a longer name beats a shorter one.
function matchPerfume(text) {
  var words = matchWords(text), runs = [], seen = {}, i, j;
  for (i = 0; i < words.length; i++) {
    for (j = i + 1; j <= Math.min(words.length, i + 3); j++) {
      var r = words.slice(i, j).join("");
      if (!seen[r]) { seen[r] = j - i; runs.push(r); }
    }
  }
  var best = null, bestScore = -1;
  var consider = function (value, run, exact) {
    var brand = value.charAt(0) === "*";
    var score = (brand ? 0 : 2000) + (exact ? 1000 : 0) + run.length;
    if (score > bestScore) { bestScore = score; best = value; }
  };
  runs.forEach(function (r) { var v = SCENT_MATCH[matchHash(r)]; if (v) consider(v, r, true); });
  // Near matches only for short entries (a name, or "زي + name"), to stay fast while typing.
  if (bestScore < 2000 && words.length <= 6) {
    runs.forEach(function (r) {
      if (r.length < 5 || r.length > 16 || seen[r] > 2) return;
      var edits = matchEdits(r);
      for (var k = 0; k < edits.length; k++) { var v = SCENT_MATCH[matchHash(edits[k])]; if (v) { consider(v, r, false); break; } }
    });
  }
  if (!best) return null;
  var items = best.replace(/^\*/, "").split(" ").map(productById).filter(Boolean);
  return items.length ? { items: items, brand: best.charAt(0) === "*" } : null;
}

function productById(id) {
  return products.find(function (p) { return p.id === id; }) || null;
}
function sectionById(id) {
  return SECTIONS.find(function (s) { return s.id === id; }) || null;
}
function sectionTitle(id) {
  var s = sectionById(id);
  return s ? s.title : "";
}
function familyById(id) {
  return SCENT_FAMILIES.find(function (f) { return f.id === id; }) || null;
}
function productsIn(sectionId) {
  return products.filter(function (p) { return p.section === sectionId; });
}

// Size keys a product can be bought in ("std" for unsized items).
function sizeKeys(p) {
  return p.sized ? PERFUME_SIZES.map(function (s) { return s.key; }) : ["std"];
}
function sizeInfo(key) {
  return PERFUME_SIZES.find(function (s) { return s.key === key; }) || null;
}
function isSizeAvailable(p, key) {
  if (p.available === false) return false;
  return !(p.unavailable || []).includes(key);
}
function defaultSize(p) {
  if (!p.sized) return "std";
  if (isSizeAvailable(p, DEFAULT_SIZE)) return DEFAULT_SIZE;
  return sizeKeys(p).find(function (k) { return isSizeAvailable(p, k); }) || DEFAULT_SIZE;
}
// Price of one piece: perfumes by their tier and size (PRICE_TIERS), the rest STD_PRICE.
function unitPrice(p, key) {
  return p.sized ? PRICE_TIERS[p.tier][key] : STD_PRICE;
}
// { lo, hi } so basket totals can still carry a range; every price is exact today.
function priceRange(p, key, qty) {
  var v = unitPrice(p, key) * (qty == null ? 1 : qty);
  return { lo: v, hi: v };
}
function priceLabel(p, key) {
  return money(unitPrice(p, key), unitPrice(p, key));
}
// Lowest price across a product's sizes, for "from" labels on cards.
function fromPrice(p) {
  return Math.min.apply(null, sizeKeys(p).map(function (k) { return unitPrice(p, k); }));
}
function tierTitle(p) {
  return p.sized && PRICE_TIERS[p.tier] ? PRICE_TIERS[p.tier].title : null;
}
function unitName(p, key) {
  if (!p.sized) return p.name;
  return p.name + " " + sizeInfo(key).label;
}
function hasAccords(p) {
  return !!(p.accords && p.accords.some(function (a) { return ACCORDS[a[0]]; }));
}
// Dark or light label for a bar colour, whichever reads better.
function labelColorFor(hex) {
  var c = hex.replace("#", "");
  var lin = [0, 2, 4].map(function (i) {
    var v = parseInt(c.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  var L = 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
  return (L + 0.05) / 0.05 > 1.05 / (L + 0.05) ? "#231c14" : "#ffffff";
}
function hasNotes(p) {
  var n = p.notes;
  return !!(n && ((n.top && n.top.length) || (n.heart && n.heart.length) || (n.base && n.base.length)));
}

// ---- WhatsApp messages (basket format is unchanged from the original site) ----
function orderMessage(entries) {
  var totals = basketTotals(entries);
  return [
    "أهلاً، عايز أطلب من كيميت:"
  ].concat(entries.map(function (e) {
    return "• " + e.unit + " × " + toAr(e.q) + " = " + money(e.lo, e.hi);
  })).concat([
    "الإجمالي: " + money(totals.lo, totals.hi)
  ]).join("\n");
}
function scentQuestion(p) {
  return "أهلاً، عايز أعرف ريحة " + p.name + " عاملة إزاي، والنوتات بتاعته إيه؟";
}
function availabilityQuestion(p, key) {
  return "أهلاً، " + unitName(p, key) + " هيتوفر إمتى؟";
}
var SETS_MESSAGE = "أهلاً، عايز أسأل عن أطقم كيميت وعروضها";
var GENERAL_MESSAGE = "أهلاً، عندي استفسار عن منتجات كيميت";

// ---- Basket: { "<productId>:<sizeKey>": qty } — same keys as the original ----
var BASKET_STORAGE_KEY = "kemet-basket-v1";

function sanitizeBasket(raw) {
  var out = {};
  if (!raw || typeof raw !== "object") return out;
  Object.keys(raw).forEach(function (key) {
    var parts = key.split(":");
    var p = productById(parts[0]);
    var q = Math.floor(Number(raw[key]));
    if (p && sizeKeys(p).includes(parts[1]) && q > 0) out[key] = Math.min(99, q);
  });
  return out;
}
function loadBasket() {
  try {
    return sanitizeBasket(JSON.parse(window.localStorage.getItem(BASKET_STORAGE_KEY) || "{}"));
  } catch (e) {
    return {};
  }
}
function saveBasket(basket) {
  try {
    window.localStorage.setItem(BASKET_STORAGE_KEY, JSON.stringify(basket));
  } catch (e) {
    // Private mode / storage full: the basket still works for this visit.
  }
}
function basketEntries(basket) {
  var entries = [];
  products.forEach(function (p) {
    sizeKeys(p).forEach(function (key) {
      var q = basket[p.id + ":" + key] || 0;
      if (q > 0) {
        var r = priceRange(p, key, q);
        entries.push({
          key: p.id + ":" + key, product: p, size: key, q: q,
          unit: unitName(p, key), lo: r.lo, hi: r.hi,
          available: isSizeAvailable(p, key)
        });
      }
    });
  });
  return entries;
}
function basketTotals(entries) {
  return entries.reduce(function (s, e) {
    return { qty: s.qty + e.q, lo: s.lo + e.lo, hi: s.hi + e.hi };
  }, { qty: 0, lo: 0, hi: 0 });
}

// ---- Hash routing (works on any static host and when opening index.html directly) ----
//   #/                     home         (#/?s=story or #/?s=order scrolls to a home section)
//   #/collection[/<sec>]   collection   (?q=search&family=floral)
//   #/p/<productId>        product      (?size=s30|s50|s100)
function parseRoute(hash) {
  var raw = (hash || "").replace(/^#/, "");
  var legacy = raw.match(/^sec-([a-z]+)$/); // anchors from the old one-page site
  if (legacy) return { name: "collection", section: sectionById(legacy[1]) ? legacy[1] : null, q: "", family: null };
  if (raw === "" || raw === "/" || raw.indexOf("/?") === 0) {
    var hp = new URLSearchParams(raw.split("?")[1] || "");
    return { name: "home", scrollTo: hp.get("s") };
  }
  var split = raw.split("?");
  var parts = split[0].split("/").filter(Boolean).map(function (x) {
    try { return decodeURIComponent(x); } catch (e) { return x; }
  });
  var params = new URLSearchParams(split[1] || "");
  if (parts[0] === "collection") {
    var sec = parts[1] && sectionById(parts[1]) ? parts[1] : null;
    if (parts[1] && !sec) return { name: "notfound" };
    var fam = params.get("family");
    return { name: "collection", section: sec, q: params.get("q") || "", family: familyById(fam || "") ? fam : null };
  }
  if (parts[0] === "p" && parts[1]) {
    return { name: "product", id: parts[1], size: params.get("size") };
  }
  return { name: "notfound" };
}
function collectionHash(section, q, family) {
  var params = new URLSearchParams();
  if (q) params.set("q", q);
  if (family) params.set("family", family);
  var qs = params.toString();
  return "#/collection" + (section ? "/" + section : "") + (qs ? "?" + qs : "");
}
function productHash(id) {
  return "#/p/" + encodeURIComponent(id);
}

var ROUTE_EVENT = "kemet:route";
var navState = { push: false };

function subscribeRoute(cb) {
  window.addEventListener("hashchange", cb);
  window.addEventListener(ROUTE_EVENT, cb);
  return function () {
    window.removeEventListener("hashchange", cb);
    window.removeEventListener(ROUTE_EVENT, cb);
  };
}
function getHash() {
  return window.location.hash;
}
function useRoute() {
  var hash = useSyncExternalStore(subscribeRoute, getHash, getHash);
  return useMemo(function () { return Object.assign(parseRoute(hash), { hash: hash }); }, [hash]);
}
// Mark the next route change as a forward navigation (scroll to top + move focus).
function markPush() {
  navState.push = true;
  navState.y = window.scrollY; // remembered for the Back button
}
function navigate(hash, opts) {
  if (opts && opts.replace) {
    window.history.replaceState(window.history.state, "", hash);
    window.dispatchEvent(new Event(ROUTE_EVENT));
  } else {
    markPush();
    window.location.hash = hash;
  }
}
// Scroll position per page (path without query), used when going back.
function routeKey(hash) {
  return (hash || "#/").split("?")[0] || "#/";
}
