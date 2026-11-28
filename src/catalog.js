// ===== src/catalog.js =====
// THE place to edit products, prices and the WhatsApp number.
// IDs, names, sizes and prices are carried over unchanged from the original site.
//
// Optional per-product fields (the UI shows them automatically when present):
//   family:      one of SCENT_FAMILIES ids, e.g. "floral"  -> enables the scent filter
//   character:   short phrase, e.g. "زهري ناعم بلمسة مسك"   -> shown on cards & product page
//   notes:       { top: ["برغموت"], heart: ["ياسمين"], base: ["مسك"] }
//   accords:     [["woody", 100], ["amber", 70]]  -> "الاتفاقات الرئيسية" bars (ids from ACCORDS, strength 0-100)
//   unavailable: ["s100"]  -> that size shows as "غير متاح حاليًا"
//   available:   false     -> whole product can't be added to the basket
// Only add these from the real product sheet - the site never guesses them.

var WA_NUMBER = "201154615084";

// The published site's address. Used in the shop details for search engines;
// if it changes (own domain), also update og:url and og:image in index.html.
var SITE_URL = "https://muhammadsmart.github.io/kemet-perfumes/";

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

// Main accords, drawn as coloured bars on the product page (like Fragrantica's
// "الاتفاقات الرئيسية"). Colour = what the accord evokes; the label colour is
// picked automatically for contrast.
var ACCORDS = {
  citrus: { title: "حمضي", color: "#f2d43d" },
  fresh: { title: "منعش", color: "#9fd8ea" },
  aquatic: { title: "مائي", color: "#3f9fd6" },
  green: { title: "عشبي", color: "#2f7a3c" },
  aromatic: { title: "أروماتك", color: "#3d8b79" },
  fresh_spicy: { title: "تابلي منعش", color: "#86b34a" },
  warm_spicy: { title: "توابل دافية", color: "#b5482a" },
  floral: { title: "زهري", color: "#f48fb1" },
  white_floral: { title: "زهور بيضا", color: "#f3ecdc" },
  rose: { title: "وردي", color: "#d81b60" },
  fruity: { title: "فاكهي", color: "#e8743b" },
  sweet: { title: "حلو", color: "#e57ba0" },
  vanilla: { title: "فانيليا", color: "#e9dbb0" },
  powdery: { title: "بودري", color: "#e6d5e3" },
  musky: { title: "مسكي", color: "#bdb4cc" },
  amber: { title: "عنبري", color: "#c8741f" },
  woody: { title: "خشبي", color: "#7a4e2d" },
  oud: { title: "عود", color: "#4b2c1c" },
  leather: { title: "جلدي", color: "#5b3a2e" },
  tobacco: { title: "تبغ", color: "#8a5a2b" },
  smoky: { title: "مدخّن", color: "#6b6b6b" },
  balsamic: { title: "بلسمي", color: "#9a6a3a" },
  coffee: { title: "قهوة", color: "#5a3a24" },
  cacao: { title: "كاكاو", color: "#6b3e26" },
  cinnamon: { title: "قرفة", color: "#a0522d" },
  soft_spicy: { title: "توابل ناعمة", color: "#c98a5e" },
  lavender: { title: "لافندر", color: "#9b80c8" },
  iris: { title: "سوسن", color: "#b8a5d1" },
  violet: { title: "بنفسج", color: "#8e6bbd" },
  tuberose: { title: "تيوبروز", color: "#f5e3c3" },
  patchouli: { title: "باتشولي", color: "#5d4a2f" },
  earthy: { title: "ترابي", color: "#6b5a3e" },
  salty: { title: "مالح", color: "#a9c9d6" },
  animalic: { title: "حيواني", color: "#7d5a4f" },
  metallic: { title: "معدني", color: "#9aa3ab" }
};

// Plain-language meaning of each note, shown under a product's notes so a
// shopper can imagine the scent. Key = the note as written in "notes".
var NOTE_GLOSSARY = {
  "برغموت": "حمضيات منعشة زي قشر الليمون والبرتقال مع مرارة خفيفة",
  "ليمون": "حامض ومنعش زي عصرة ليمون",
  "ليم": "حامض ومنعش زي عصرة ليمون",
  "برتقال": "ريحة قشر البرتقال، حلوة ومنعشة",
  "يوسفي": "ريحة قشر اليوسفي، حلوة ومنعشة",
  "جريب فروت": "حمضي فيه مرارة خفيفة",
  "نيرولي": "زهر النارنج المقطّر، منعش ونضيف",
  "بيتيجرين": "ورق وفروع النارنج، أخضر وحمضي",
  "زهر البرتقال": "زهرة بيضا حلوة زي مية الزهر",
  "كشمش أسود": "فاكهة توتية حامضة شوية",
  "كمثرى": "فاكهة عصيرية حلوة",
  "تفاح": "فاكهة منعشة",
  "تفاح أخضر": "فاكهة منعشة فيها حموضة",
  "أناناس": "فاكهة استوائية حلوة حامضة",
  "خوخ": "فاكهة صيفي حلوة ناعمة",
  "مشمش": "فاكهة صيفي حلوة ناعمة",
  "شمام": "فاكهة مايّة منعشة",
  "لافندر": "عشب بنفسجي نضيف زي ريحة الغسيل",
  "نعناع": "منعش وبارد",
  "مريمية": "عشب جاف دافي",
  "روزماري": "عشب أخضر حاد",
  "ريحان": "أخضر ومنعش زي ريحان البلكونة",
  "حب العرعر": "ريحة صنوبرية منعشة",
  "جيرانيوم": "ورق أخضر بريحة ورد خفيفة",
  "فلفل": "حار ناشف",
  "فلفل أسود": "حار ناشف",
  "فلفل وردي": "حار خفيف وفيه لمحة فاكهة",
  "زنجبيل": "حار منعش",
  "قرفة": "حلوة دافية زي الحلويات",
  "جوزة الطيب": "بهار دافي",
  "زعفران": "دافي فيه إحساس جلدي ومعدني خفيف",
  "ياسمين": "زهر أبيض حلو وقوي",
  "فل": "زهر أبيض حلو وقوي",
  "تيوبروز": "زهر أبيض كريمي تقيل (مسك الروم)",
  "ورد": "ريحة الورد البلدي",
  "سوسن": "بودري ناعم زي البودرة",
  "زنبق الوادي": "زهر أخضر نضيف",
  "فاوانيا": "ورد خفيف منعش",
  "بنفسج": "زهر بودري",
  "يلانج يلانج": "زهر استوائي حلو تقيل",
  "نفحات بحرية": "ريحة بحر ونسيم",
  "ملح": "إحساس جلد بعد البحر",
  "أمبروكسان": "عنبري مسكي زي ريحة جلد نضيف، وفواح",
  "قهوة": "ريحة البن المحمّص",
  "كاكاو": "شوكولاتة",
  "لوز": "ريحة المارزيبان",
  "برالين": "سكر محمّص بالمكسرات",
  "فانيليا": "حلوة دافية زي الكيك",
  "تونكا": "فانيليا فيها لوز وتبن",
  "بخور": "دخاني نضيف زي البخور",
  "لبان": "دخاني نضيف زي البخور",
  "عنبر": "دافي حلو بودري",
  "عنبر رمادي": "مالح مسكي فيه دفء",
  "لادن": "راتنج عنبري جلدي",
  "مسك": "ريحة جلد نضيف وغسيل",
  "مسك أبيض": "ريحة جلد نضيف وغسيل",
  "باتشولي": "ترابي خشبي غامق",
  "فيتيفر": "جذور ترابية مدخّنة",
  "أرز": "خشب ناشف زي برادة القلم الرصاص",
  "صندل": "خشب كريمي ناعم",
  "خشب الكشمير": "خشب دافي ناعم مسكي",
  "طحلب البلوط": "أخضر ترابي زي الغابة",
  "جلد": "ريحة جلد الشنط والجزم الجديدة",
  "بتولا": "خشب مدخّن جلدي",
  "عود": "خشب شرقي تقيل ودخاني",
  "هيل": "بهار منعش دافي زي القهوة بالحبهان",
  "جاردينيا": "زهرة بيضا كريمية حلوة زي الفل",
  "فراولة": "فاكهة حلوة زي مربى الفراولة",
  "توت": "توت حلو حامض",
  "داتورا": "زهرة بيضا بتفتح بالليل، كريمية وحلوة",
  "طحلب": "أخضر ترابي زي الشجر بعد المطر",
  "شاي الياسمين": "شاي أخضر بالياسمين، خفيف ونضيف",
  "خشب الجواياك": "خشب دافي فيه لمسة دخان خفيفة",
  "يانسون نجمي": "بهار حلو ريحته زي الينسون",
  "زهر الزيتون": "زهرة بيضا خفيفة ريحتها نضيفة",
  "تبغ": "ورق دخان ناشف، حلو ودافي",
  "صوان": "إحساس حجر ناشف ومعدني زي الشرارة",
  "بنزوين": "راتنج حلو فيه فانيليا"
};

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

// The real 100 ml bottle, cut out (from private/photos/KEMET-100mL-4K-transparent.png, 256 px tall).
var SIZE_BOTTLE = { webp: "./assets/img/bottle-100.webp", png: "./assets/img/bottle-100.png", ratio: 181 / 256 };

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

// Scent profiles: family, scent line, notes and main accords per perfume. Taken
// from the public pyramid of the perfume each one resembles (the shop confirmed
// the match) and reviewed by the shop before going live. Accord strengths are
// approximate, strongest first. A perfume listed here gets its scent line on
// cards, the scent-family filter, and the "الريحة" section on its page.
var SCENT_PROFILES = {
  "w-hams": {"family":"amber","character":"بهارات دافية وجاردينيا على صندل وعنبر، غامق وأنثوي","notes":{"top":["فلفل","هيل","زنجبيل"],"heart":["جاردينيا","زهر البرتقال","فاوانيا"],"base":["صندل","مسك","عنبر"]},"accords":[["warm_spicy",100],["woody",82],["fresh_spicy",68],["white_floral",56],["powdery",46],["musky",38]]},
  "w-dalal": {"family":"floral","character":"فراولة وتوت على ياسمين وباتشولي، حلو ومنعش","notes":{"top":["فراولة","توت","كمثرى","برتقال","برغموت"],"heart":["فاوانيا","ياسمين","داتورا","زهر البرتقال"],"base":["باتشولي","مسك أبيض","فانيليا","أمبروكسان","أرز"]},"accords":[["fruity",100],["sweet",82],["fresh",68],["white_floral",56],["patchouli",46],["citrus",38]]},
  "w-qamar": {"family":"amber","character":"ياسمين وفانيليا على خشب، دافي وناعم","notes":{"top":["كشمش أسود","فلفل وردي","برغموت"],"heart":["ياسمين","شاي الياسمين"],"base":["فانيليا","خشب الكشمير","خشب الجواياك"]},"accords":[["woody",100],["vanilla",82],["fruity",68],["white_floral",56],["soft_spicy",46],["powdery",38]]},
  "m-anbar": {"family":"amber","character":"ليمون ويانسون على تونكا وجلد، دافي وأنيق","notes":{"top":["ليمون","برغموت"],"heart":["يانسون نجمي","زهر الزيتون","خشب الجواياك"],"base":["جلد","تونكا","تبغ"]},"accords":[["citrus",100],["leather",82],["soft_spicy",68],["floral",56],["tobacco",46],["sweet",38]]},
  "kemet-edp": {"family":"woody","character":"برتقال وفلفل على خشب وفيتيفر، ترابي ورجولي","notes":{"top":["برتقال","جريب فروت"],"heart":["فلفل","جيرانيوم","صوان"],"base":["فيتيفر","أرز","باتشولي","بنزوين"]},"accords":[["citrus",100],["woody",82],["fresh_spicy",68],["aromatic",56],["earthy",46],["warm_spicy",38]]},
  "w-nefertari": {"family":"floral","character":"زهور بيضا على لافندر وفانيليا، أنثوي وجريء","notes":{"top":["لافندر","يوسفي","كشمش أسود","بيتيجرين"],"heart":["لافندر","زهر البرتقال","ياسمين"],"base":["فانيليا","مسك","أرز","عنبر رمادي"]},"accords":[["white_floral",100],["citrus",82],["lavender",68],["vanilla",56],["aromatic",46],["sweet",38]]},
  "w-lotus": {"family":"floral","character":"زهور بيضا ومسك أبيض، نضيف ومريح","notes":{"top":["زهر البرتقال","برغموت"],"heart":["تيوبروز","ياسمين"],"base":["فانيليا","مسك أبيض","أرز"]},"accords":[["white_floral",100],["tuberose",82],["citrus",68],["animalic",56],["vanilla",46]]},
  "m-saqr": {"family":"fresh","character":"فريش حار، برغموت وفلفل على عنبر، شبابي وفواح","notes":{"top":["برغموت","فلفل"],"heart":["فلفل وردي","لافندر","فيتيفر","باتشولي","جيرانيوم"],"base":["أمبروكسان","أرز","لادن"]},"accords":[["fresh_spicy",100],["amber",82],["citrus",68],["aromatic",56],["musky",46],["woody",38]]},
  "m-malaki": {"family":"amber","character":"حلو حار بالقرفة والجلد، للسهرة","notes":{"top":["يوسفي","جريب فروت","نعناع"],"heart":["قرفة","ورد"],"base":["عنبر","جلد","باتشولي"]},"accords":[["warm_spicy",100],["cinnamon",82],["citrus",68],["amber",56],["woody",46],["leather",38]]},
  "m-fares": {"family":"woody","character":"أناناس مدخّن على خشب ومسك، فخم","notes":{"top":["كشمش أسود","برغموت","تفاح","أناناس"],"heart":["ورد","بتولا","ياسمين","باتشولي"],"base":["مسك","طحلب البلوط","عنبر رمادي","فانيليا"]},"accords":[["fruity",100],["sweet",82],["woody",68],["leather",56],["citrus",46],["smoky",38]]}
};
products.forEach(function (p) {
  if (SCENT_PROFILES[p.id]) Object.assign(p, SCENT_PROFILES[p.id]);
});

// Famous perfume and brand names a shopper might type -> our closest perfume
// (by scent and notes). Keys are hashes of the names, so no other brand's name is
// written in the site. "*" marks a brand: it shows our closest men's and women's.
// Generated by `node scripts/match-key.mjs` from the private list
// private/scent-names.txt (not committed); see matchPerfume in src/lib.js.
var SCENT_MATCH = {
  "f4f698d6cc66": "*kemet-edp w-dalal",
  "b1f511e8be3a": "*kemet-edp w-dalal",
  "a78333a507c5": "*kemet-edp w-dalal",
  "58dc2b35e035": "*kemet-edp w-dalal",
  "4edd804e10e4": "*kemet-edp w-dalal",
  "4c983f48361c": "*kemet-edp w-dalal",
  "00d4747152a9": "*kemet-edp w-dalal",
  "046613776957": "*kemet-edp w-qamar",
  "a36c1a1d4219": "*kemet-edp w-qamar",
  "c79620c36eeb": "*kemet-edp",
  "23135df8039e": "*kemet-edp",
  "511880995fb1": "*kemet-edp",
  "64cb0dd1327d": "*kemet-edp",
  "67e440561b64": "*kemet-edp",
  "4aea5567b2bf": "*kemet-edp",
  "6e18831d062d": "*kemet-edp",
  "1b62e3926998": "*m-anbar w-hams",
  "90cb83588184": "*m-anbar w-hams",
  "f86d2816837e": "*m-anbar w-hams",
  "bf931d040ce0": "*m-anbar w-hams",
  "f561fe2f915f": "*m-anbar w-hams",
  "846482aa7850": "*m-anbar w-hams",
  "885fcc6d1a91": "*m-anbar w-hams",
  "e0d1482d6cfd": "*m-anbar w-hams",
  "0f19116d8235": "*m-anbar w-lotus",
  "279c31ed6cc5": "*m-anbar w-lotus",
  "0f9e7034d566": "*m-anbar w-lotus",
  "3da016fdc76d": "*m-anbar w-lotus",
  "eb526f036afb": "*m-anbar w-lotus",
  "90b877b9f381": "*m-anbar w-lotus",
  "e8d986502a9a": "*m-anbar w-lotus",
  "3a2b7df9c9b1": "*m-anbar w-lotus",
  "192045e58645": "*m-anbar w-lotus",
  "a6d267fa72ca": "*m-anbar w-lotus",
  "c7fc4f3a962a": "*m-anbar w-lotus",
  "31ddab5721b7": "*m-anbar w-lotus",
  "eda3a26250d8": "*m-anbar w-lotus",
  "6cb50507b14f": "*m-anbar w-lotus",
  "080839b2a45c": "*m-anbar w-lotus",
  "38bb623137c1": "*m-anbar w-lotus",
  "3ed2f93b988b": "*m-anbar w-lotus",
  "5ea66ae84cfa": "*m-anbar w-qamar",
  "aca944900b96": "*m-anbar w-qamar",
  "dfb5fec67954": "*m-anbar w-qamar",
  "5b113283f313": "*m-anbar w-qamar",
  "1455037aee1e": "*m-anbar w-qamar",
  "cf72b31efd1a": "*m-anbar",
  "4373cb5faddf": "*m-anbar",
  "edb0c229f721": "*m-fares w-dalal",
  "1a07f8a5614d": "*m-fares w-dalal",
  "76b29e71524d": "*m-fares w-dalal",
  "043a8d2e3d02": "*m-fares",
  "cb73bac96d81": "*m-fares",
  "b984ecf35b63": "*m-fares",
  "1787711ca010": "*m-fares",
  "4067b212819c": "*m-fares",
  "6f2a533fa737": "*m-fares",
  "5affb3aa53fa": "*m-fares",
  "f5d9214b93e3": "*m-malaki w-hams",
  "ecd2c3fd8021": "*m-malaki w-hams",
  "3891f4578ea7": "*m-malaki w-hams",
  "d2dce6f528d5": "*m-malaki w-lotus",
  "467c2bb6f01a": "*m-malaki w-lotus",
  "23a0c271f31d": "*m-malaki w-lotus",
  "f2ea734dd6e9": "*m-malaki w-lotus",
  "fc9e19908266": "*m-malaki w-qamar",
  "8442ef8d5591": "*m-malaki w-qamar",
  "2c0d6168e35e": "*m-malaki w-qamar",
  "65f3c7b349ab": "*m-malaki w-qamar",
  "11e3b91c97f4": "*m-malaki w-qamar",
  "b02f51c6b996": "*m-malaki w-qamar",
  "f58a8998b460": "*m-malaki w-qamar",
  "1f080ad7d25f": "*m-malaki",
  "6d8eb0d475c6": "*m-malaki",
  "e5eaaa6c5008": "*m-malaki",
  "4683212887e0": "*m-malaki",
  "3bc3fdce3084": "*m-malaki",
  "34d49d27fa67": "*m-malaki",
  "461b1db3f953": "*m-saqr w-lotus",
  "99a53ed418d4": "*m-saqr w-lotus",
  "271174b88ae8": "*m-saqr w-lotus",
  "6c4b10cefc22": "*m-saqr w-lotus",
  "b47fd0fa48d8": "*m-saqr w-lotus",
  "bc097b55f7b9": "*m-saqr w-lotus",
  "1e5048176517": "*m-saqr w-lotus",
  "ae87304de419": "*m-saqr w-lotus",
  "9c09db7bd813": "*m-saqr w-nefertari",
  "8805f5e830e2": "*m-saqr w-nefertari",
  "fa36890fd33f": "*m-saqr w-nefertari",
  "11ec1bf1bc39": "*m-saqr w-nefertari",
  "9ad7a2c3d0e3": "*m-saqr w-nefertari",
  "b74ab170df88": "*m-saqr",
  "72834786937a": "*m-saqr",
  "4e657fd93171": "*m-saqr",
  "7fafb164be52": "*m-saqr",
  "c9f81e260f06": "*m-saqr",
  "3642b7c13a21": "*m-saqr",
  "683d8f1779c7": "*m-saqr",
  "1e5fcaeaaae4": "*m-saqr",
  "98038980f586": "*w-dalal",
  "a78219b9c97d": "*w-dalal",
  "49be9cc617f4": "*w-dalal",
  "1889d45ce36e": "*w-qamar",
  "711e6404973a": "*w-qamar",
  "7860f600b010": "*w-qamar",
  "931ef32effdc": "*w-qamar",
  "7e57aa0a768c": "*w-qamar",
  "7a68dd98f2a6": "*w-qamar",
  "1f429a2b15e3": "kemet-edp",
  "e84958a0282a": "kemet-edp",
  "b78d0ccb4d43": "kemet-edp",
  "6e3ef4bf1e9f": "kemet-edp",
  "9525c632447c": "kemet-edp",
  "0744e0a70e3f": "kemet-edp",
  "0cd8067d19b9": "kemet-edp",
  "2a9075bcca9a": "kemet-edp",
  "935c7327ae37": "kemet-edp",
  "31255682566e": "kemet-edp",
  "7c40707de619": "kemet-edp",
  "955f228eaa40": "kemet-edp",
  "5f88eca91f0d": "kemet-edp",
  "c48c09fc6748": "kemet-edp",
  "a9dd2ea13b0d": "kemet-edp",
  "d241cd245c70": "kemet-edp",
  "c25c4c807408": "kemet-edp",
  "21ee06f6319a": "kemet-edp",
  "829d45acd6c2": "kemet-edp",
  "d67839e75407": "kemet-edp",
  "371b02a7cb0f": "kemet-edp",
  "e18de494c382": "m-anbar",
  "9542dd6ee7ce": "m-anbar",
  "499e6d58e06e": "m-anbar",
  "8493f63b8c4b": "m-anbar",
  "7e0a03fed31c": "m-anbar",
  "d59c9ad16fc9": "m-anbar",
  "5b90c923124b": "m-anbar",
  "b68601a62f86": "m-anbar",
  "3e0dd6181126": "m-anbar",
  "0f3896bf431f": "m-anbar",
  "af56ab48f712": "m-anbar",
  "2dfb05a4bcf2": "m-anbar",
  "067bca2ba55b": "m-anbar",
  "d1676f3c2dd2": "m-anbar",
  "e0233dbb1b93": "m-anbar",
  "dcb812e7ebd7": "m-anbar",
  "d002700d68f5": "m-anbar",
  "ef07db82c896": "m-anbar",
  "0ff6a02c7e96": "m-anbar",
  "60abe6d4e5ba": "m-anbar",
  "078ccafaf97a": "m-anbar",
  "88585ecf9937": "m-anbar",
  "a9bceb17a02f": "m-anbar",
  "242d5653d2a3": "m-anbar",
  "b837bb8cf0fc": "m-anbar",
  "5063d4ce8ebc": "m-anbar",
  "c55ccbd45902": "m-anbar",
  "02c7f41a67f6": "m-anbar",
  "fc19e2cfb5ef": "m-anbar",
  "b91713027a76": "m-anbar",
  "3544a899c205": "m-anbar",
  "af6f705b9883": "m-fares",
  "46b351ccdece": "m-fares",
  "b4ccf2fee410": "m-fares",
  "07e461d4b4d8": "m-fares",
  "6a91ea3f74e7": "m-fares",
  "17cdd4ca8e18": "m-fares",
  "d4d9b980f34e": "m-fares",
  "23a7afd8de70": "m-fares",
  "57acb44b181b": "m-fares",
  "cff1a52fde87": "m-fares",
  "a15da9d1fb29": "m-fares",
  "02aae61d00b5": "m-fares",
  "300aa29e8a88": "m-fares",
  "694573d839e4": "m-malaki",
  "693ef8b1c9e5": "m-malaki",
  "1699142396fb": "m-malaki",
  "827d0045f075": "m-malaki",
  "0106170e1d80": "m-malaki",
  "5f0485b197e1": "m-malaki",
  "883e21060f6a": "m-malaki",
  "4d50c77fc17f": "m-malaki",
  "f1634cce894a": "m-malaki",
  "1314f3d73bc7": "m-malaki",
  "3c58f250816c": "m-malaki",
  "10ad26a12811": "m-malaki",
  "95d88d87a667": "m-malaki",
  "3bc065406638": "m-malaki",
  "941da1856a19": "m-malaki",
  "e6a282c950c9": "m-malaki",
  "edb917ed7d09": "m-malaki",
  "bafe9e23ea43": "m-malaki",
  "db8f32290955": "m-malaki",
  "5a599f70b4da": "m-malaki",
  "b4842a159f99": "m-malaki",
  "d233dc2601b2": "m-malaki",
  "2056ccd4c1c2": "m-malaki",
  "04cb02c12641": "m-malaki",
  "06d4fe22235e": "m-malaki",
  "49ec77debde2": "m-malaki",
  "1ad48c3d04cd": "m-malaki",
  "793c57627b66": "m-malaki",
  "3743326da29d": "m-saqr",
  "a4f3d1693b55": "m-saqr",
  "a5877b39a959": "m-saqr",
  "4211bfaff4e7": "m-saqr",
  "735a0fdc58b4": "m-saqr",
  "520b6d40c80e": "m-saqr",
  "aace795014fe": "m-saqr",
  "b583dd56ea28": "m-saqr",
  "e14667c7df77": "m-saqr",
  "70e45f17e8c7": "m-saqr",
  "c4d2d8e4e586": "m-saqr",
  "59d44ba56245": "m-saqr",
  "b0f0bcb6d82a": "m-saqr",
  "fb6990781e42": "m-saqr",
  "727ab4217615": "m-saqr",
  "a89816d7c90f": "m-saqr",
  "09008149e029": "m-saqr",
  "0daed42e1708": "m-saqr",
  "fd0ff184c9aa": "m-saqr",
  "2ef3e07211a0": "m-saqr",
  "93bd5397b177": "m-saqr",
  "9310c17f8cc7": "m-saqr",
  "2f37ed075157": "m-saqr",
  "76fb75bd958d": "m-saqr",
  "7bfdf1ad21e5": "m-saqr",
  "d29075331d53": "m-saqr",
  "f32322bb6c3b": "m-saqr",
  "65ac068103a1": "m-saqr",
  "b8764c971187": "m-saqr",
  "405fdb341eac": "m-saqr",
  "b01dc26a9b1a": "m-saqr",
  "864cacb1bc81": "m-saqr",
  "392e4b1659b2": "m-saqr",
  "c08e613eb276": "m-saqr",
  "9006e186bc6c": "m-saqr",
  "460f4c2b7923": "m-saqr",
  "6ca1034471b4": "m-saqr",
  "f35cbdf70287": "m-saqr",
  "e96a938f818f": "m-saqr",
  "4ae1f68c8116": "m-saqr",
  "208216b8d1e4": "m-saqr",
  "6ee343e3e703": "w-dalal",
  "5ef9dbdc1822": "w-dalal",
  "72f6b9953349": "w-dalal",
  "5e6e6e8125c5": "w-dalal",
  "2ca5de1d05b5": "w-dalal",
  "1a52ccf26172": "w-dalal",
  "9a8dfdaa0fe2": "w-dalal",
  "4b629658d1d0": "w-dalal",
  "a338b504ce56": "w-dalal",
  "3b24ddb6ed32": "w-dalal",
  "ef4762b4abfe": "w-dalal",
  "28b5b0846322": "w-dalal",
  "87f8ebc908e5": "w-dalal",
  "cd821752c738": "w-dalal",
  "93f85e0bac4b": "w-dalal",
  "90e5de9c869a": "w-dalal",
  "e4802f8d8605": "w-dalal",
  "5427f5a230de": "w-dalal",
  "f9668d6316eb": "w-dalal",
  "f3d614de23c8": "w-dalal",
  "c65eab655859": "w-dalal",
  "c57c397c4656": "w-dalal",
  "61dd9e372c9f": "w-dalal",
  "bac559baca72": "w-dalal",
  "f46c99a0e52e": "w-dalal",
  "7f331b2fed07": "w-dalal",
  "dc8e6a1032b4": "w-dalal",
  "47e68d7dcfdd": "w-dalal",
  "d5e90fd88564": "w-dalal",
  "7fabe0e3a3cb": "w-dalal",
  "1f157ca5087d": "w-dalal",
  "f13ac48163f5": "w-dalal",
  "2e325f0f672f": "w-hams",
  "4509c5526f42": "w-hams",
  "7a9da1bb2dfb": "w-hams",
  "7208be7ba773": "w-hams",
  "9528669dfde1": "w-hams",
  "11bd30b06f4a": "w-hams",
  "351a8148ad38": "w-hams",
  "906e69ffe4f7": "w-hams",
  "570c29adde5d": "w-hams",
  "f2e0c0e9d979": "w-hams",
  "12cf97e59411": "w-hams",
  "18604a2834f0": "w-hams",
  "599bf8b96a0d": "w-hams",
  "d4a0cdb1cd01": "w-hams",
  "d0d4a2c8962c": "w-hams",
  "e335b8eb5f93": "w-hams",
  "6992185d4b8d": "w-hams",
  "6030e10c3368": "w-lotus",
  "804315213021": "w-lotus",
  "5b9dfef17b75": "w-lotus",
  "bb08d5fbd2c3": "w-lotus",
  "74c34138f8aa": "w-lotus",
  "c370be3bcd63": "w-lotus",
  "5321cfa0917c": "w-lotus",
  "50c2ab593111": "w-lotus",
  "7544a8045222": "w-lotus",
  "82a9d9dbcb9b": "w-lotus",
  "01cb1ee7dfd7": "w-lotus",
  "fc9e0e567886": "w-lotus",
  "45edc1daf306": "w-lotus",
  "608b21d2874c": "w-lotus",
  "cd31fd3e14ba": "w-lotus",
  "c1e3af47d23f": "w-lotus",
  "7b5543992fe5": "w-lotus",
  "ad5a73094f81": "w-lotus",
  "685681c2c8f4": "w-lotus",
  "a6e6877e3a92": "w-lotus",
  "5a3f777450dc": "w-lotus",
  "fcbf8864658c": "w-lotus",
  "10abf1c732df": "w-lotus",
  "a18d3b316361": "w-lotus",
  "a93c935c70d6": "w-lotus",
  "bb8478369d42": "w-lotus",
  "016ec69c3078": "w-lotus",
  "1943c1561708": "w-lotus",
  "42af6307996f": "w-lotus",
  "df0b4aefe1a7": "w-nefertari",
  "4da5eecd19b9": "w-nefertari",
  "e9f3b2c5d911": "w-nefertari",
  "d132f2e84e92": "w-nefertari",
  "6560ca1254a6": "w-nefertari",
  "bac2da5e6f5c": "w-nefertari",
  "f5371b06288a": "w-nefertari",
  "7812a1ddc72d": "w-qamar",
  "1bd6bc05b5d5": "w-qamar",
  "329ec1a45c3a": "w-qamar",
  "a0efaa3c8936": "w-qamar",
  "bd9c4d4f2def": "w-qamar",
  "3d518327ef0f": "w-qamar",
  "b2cf6046559a": "w-qamar",
  "1e8f37d454ea": "w-qamar",
  "280207ea27ca": "w-qamar",
  "46b8c82bf8c3": "w-qamar",
  "36d4f0713301": "w-qamar",
  "922b7ec229aa": "w-qamar",
  "c6f979484fe6": "w-qamar",
  "f7b5939ef808": "w-qamar",
  "8e69061920e1": "w-qamar",
  "ecfc46ba1258": "w-qamar",
  "e7d6238866cc": "w-qamar",
  "8ac6f9428280": "w-qamar",
  "b00c377faf47": "w-qamar",
  "f84a76360d2a": "w-qamar",
  "64e8daad24d5": "w-qamar",
  "084ca784a0f8": "w-qamar",
  "a4c1f286e548": "w-qamar",
  "9d8907633a53": "w-qamar",
  "920d91950a31": "w-qamar"
};
