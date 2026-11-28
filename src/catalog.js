// ===== src/catalog.js =====
// THE place to edit products, prices and the WhatsApp number.
// IDs, names, sizes and prices are carried over unchanged from the original site.
//
// Optional per-product fields (the UI shows them automatically when present):
//   family:      one of SCENT_FAMILIES ids, e.g. "floral"  -> enables the scent filter
//   character:   short phrase, e.g. "زهري ناعم بلمسة مسك"   -> shown on cards & product page
//   notes:       { top: ["برغموت"], heart: ["ياسمين"], base: ["مسك"] }
//   unavailable: ["s100"]  -> that size shows as "غير متاح حاليًا"
//   available:   false     -> whole product can't be added to the basket
// Only add these from the real product sheet - the site never guesses them.

var WA_NUMBER = "201154615084";

// The shop's address (footer and the homepage contact card).
var SHOP_ADDRESS = "٢٧٩د حدائق الأهرام، البوابة الثانية الجديدة";
// Where "افتح على الخريطة" goes. For now a Google Maps search for the address;
// for the exact spot, paste the shop's own pin link here (Google Maps: Share →
// Copy link).
var SHOP_MAPS_URL = "https://www.google.com/maps/search/?api=1&query=" +
  encodeURIComponent("279د حدائق الأهرام البوابة الثانية الجديدة، الجيزة");

// Opening offer. Announced on the homepage and in the basket, and added as a line
// to every WhatsApp order; prices on the site stay as they are and the shop takes
// the discount off when it replies. `endsOn` = the last day it applies
// ("YYYY-MM-DD"); after it the offer disappears by itself (null = no end date).
// Set percent to 0 to turn it off.
var OFFER = { label: "عرض الافتتاح", percent: 20, endsOn: null };

var SIZE_PRICES = {
  s30: { label: "٢٠٠ جنيه", value: 200 },
  s50: { label: "٣٥٠ - ٤٠٠ جنيه", value: 350, max: 400 },
  s100: { label: "٥٠٠ جنيه", value: 500 },
  std: { label: "١٠٠ جنيه", value: 100 } // سعر مؤقت
};

var PERFUME_SIZES = [
  { key: "s30", label: "٣٠ مل", ml: 30 },
  { key: "s50", label: "٥٠ مل", ml: 50 },
  { key: "s100", label: "١٠٠ مل", ml: 100 }
];
var DEFAULT_SIZE = "s50";

var SECTIONS = [
  { id: "women", title: "بيرفيوم حريمي", short: "حريمي" },
  { id: "men", title: "بيرفيوم رجالي", short: "رجالي" },
  { id: "lotion", title: "لوشن", short: "لوشن" },
  { id: "musk", title: "مسك", short: "مسك" },
  { id: "freshener", title: "معطرات", short: "معطرات" },
  { id: "makhmaria", title: "مخمرية", short: "مخمرية" },
  { id: "splash", title: "بودي سبلاش", short: "سبلاش" },
  { id: "sets", title: "الأطقم", short: "أطقم" }
];

// Shared scent vocabulary for filters, cards and product pages.
// Used only for products that have a `family` field.
var SCENT_FAMILIES = [
  { id: "floral", title: "زهري" },
  { id: "amber", title: "عنبري شرقي" },
  { id: "woody", title: "خشبي" },
  { id: "fresh", title: "منعش" },
  { id: "gourmand", title: "حلو" },
  { id: "musky", title: "مسكي" }
];

// Placeholder for products without their own description. Product pages don't
// show it (the "اسأل عن الريحة" box below covers that); kept for the data.
var GENERIC_DESC = "منتج من كيميت، اسأل عن التفاصيل على واتساب.";

// A photo = assets/<code>.jpg plus its WebP copies assets/img/<code>-320.webp and -640.webp.
function photoSet(code) {
  return {
    w320: "./assets/img/" + code + "-320.webp",
    w640: "./assets/img/" + code + "-640.webp",
    jpg: "./assets/" + code + ".jpg"
  };
}

// Which photo each perfume shows. All ten photos show the same bottle with a
// different Pharaonic piece beside it, so each perfume gets the piece that fits
// its name. Temporary until the new shoot (one photo per perfume).
var PERFUME_PHOTOS = {
  "w-hams": photoSet("AIGQQVZY"),      // winged scarab
  "w-nefertari": photoSet("XVYQC4Q3"), // cobra: the uraeus on royal crowns
  "w-lotus": photoSet("IKSPV5TU"),     // pyramids
  "w-qamar": photoSet("3S6CFY2F"),     // Eye of Horus: the left eye stood for the moon
  "w-dalal": photoSet("UPLPPC2X"),     // obelisk
  "kemet-edp": photoSet("6LDHZZDF"),   // jackal-headed figure (also the homepage photo)
  "m-malaki": photoSet("WSJWFZYL"),    // Tutankhamun's mask: royal
  "m-fares": photoSet("IGZKQG2K"),     // sphinx: strength and guard
  "m-anbar": photoSet("P5GJTFHN"),     // jackal-headed canopic jar, dark tones
  "m-saqr": photoSet("6AIGJKZ2")       // Horus as a falcon
};

var HERO_PHOTO = {
  mobile: "./assets/img/hero-mobile-500.webp",
  desktop: "./assets/img/6LDHZZDF-640.webp",
  jpg: "./assets/6LDHZZDF.jpg"
};

var perfume = function (id, section, name, desc) {
  return { id: id, section: section, name: name, desc: desc || GENERIC_DESC, sized: true, art: { kind: "perfume" }, photo: PERFUME_PHOTOS[id] };
};
var single = function (id, section, name, art, desc) {
  return { id: id, section: section, name: name, desc: desc || GENERIC_DESC, sized: false, art: art };
};

var products = [
  // بيرفيوم حريمي — أسماء مؤقتة لحد ما الأسماء الحقيقية تتأكد
  perfume("w-hams", "women", "همس الليل"),
  perfume("w-nefertari", "women", "نفرتاري"),
  perfume("w-lotus", "women", "زهرة اللوتس"),
  perfume("w-qamar", "women", "قمر ١٤"),
  perfume("w-dalal", "women", "دلال"),
  // بيرفيوم رجالي
  perfume("kemet-edp", "men", "عطر كيميت", "عطر كيميت الأصلي."),
  perfume("m-malaki", "men", "ملكي"),
  perfume("m-fares", "men", "فارس"),
  perfume("m-anbar", "men", "عنبر بلاك"),
  perfume("m-saqr", "men", "صقر"),
  // لوشن
  single("l-sunsilk", "lotion", "بودي لوشن صن سيلك", { kind: "lotion", accent: "#f2d878" }),
  single("l-vanilla", "lotion", "بودي لوشن دارك فانيليا", { kind: "lotion", accent: "#a8842e" }),
  single("l-rose", "lotion", "بودي لوشن روز", { kind: "lotion", accent: "#e6c765" }),
  single("l-luna", "lotion", "بودي لوشن لونا", { kind: "lotion", accent: "#c9a227" }),
  single("l-coco", "lotion", "بودي لوشن كوكو", { kind: "lotion", accent: "#8a6a2a" }),
  // مسك
  single("ms-white", "musk", "مسك أبيض", { kind: "shape", shape: "musk", accent: "#f2d878" }),
  single("ms-black", "musk", "مسك أسود", { kind: "shape", shape: "musk", accent: "#a8842e" }),
  single("ms-gel", "musk", "مسك جل", { kind: "shape", shape: "musk", accent: "#e6c765" }),
  single("ms-cream", "musk", "مسك كريمي", { kind: "shape", shape: "musk", accent: "#c9a227" }),
  single("ms-conc", "musk", "مسك مركز", { kind: "shape", shape: "musk", accent: "#8a6a2a" }),
  // معطرات
  single("f-room", "freshener", "معطر جو", { kind: "shape", shape: "freshener", accent: "#f2d878" }),
  single("f-car", "freshener", "معطر سيارة", { kind: "shape", shape: "freshener", accent: "#a8842e" }),
  single("f-linen", "freshener", "معطر مفارش", { kind: "shape", shape: "freshener", accent: "#e6c765" }),
  single("f-fawaha", "freshener", "فواحة", { kind: "shape", shape: "freshener", accent: "#c9a227" }),
  single("f-spray", "freshener", "رش معطر", { kind: "shape", shape: "freshener", accent: "#8a6a2a" }),
  // مخمرية
  single("mk-small", "makhmaria", "مخمرية صغيرة", { kind: "shape", shape: "makhmaria", accent: "#f2d878" }),
  single("mk-big", "makhmaria", "مخمرية كبيرة", { kind: "shape", shape: "makhmaria", accent: "#a8842e" }),
  single("mk-copper", "makhmaria", "مبخرة نحاس", { kind: "shape", shape: "makhmaria", accent: "#e6c765" }),
  single("mk-bakhoor", "makhmaria", "بخور معطر", { kind: "shape", shape: "makhmaria", accent: "#c9a227" }),
  single("mk-roll", "makhmaria", "مخمرية رول", { kind: "shape", shape: "makhmaria", accent: "#8a6a2a" }),
  // بودي سبلاش
  single("sp-fresh", "splash", "سبلاش فريش", { kind: "shape", shape: "splash", accent: "#f2d878" }),
  single("sp-sweet", "splash", "سبلاش سويت", { kind: "shape", shape: "splash", accent: "#a8842e" }),
  single("sp-morning", "splash", "سبلاش صباحي", { kind: "shape", shape: "splash", accent: "#e6c765" }),
  single("sp-evening", "splash", "سبلاش مسائي", { kind: "shape", shape: "splash", accent: "#c9a227" }),
  single("sp-cool", "splash", "سبلاش كول", { kind: "shape", shape: "splash", accent: "#8a6a2a" })
];

// Products shown on the homepage, in order.
var FEATURED_IDS = ["w-hams", "w-nefertari", "kemet-edp", "m-malaki"];
