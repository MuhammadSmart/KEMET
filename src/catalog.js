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

// Names a shopper might type for the perfume each KEMET perfume resembles, as
// hashes -> KEMET product id (see matchPerfume in src/lib.js). The names are not
// stored on the site; add more with: node scripts/match-key.mjs <id> "name" ...
var SCENT_MATCH = {
"09008149": "m-saqr",
  "4211bfaf": "m-saqr",
  "392e4b16": "m-saqr",
  "3a61487e": "m-saqr",
  "07cc79d8": "m-saqr",
  "312e3e7e": "m-saqr",
  "405fdb34": "m-saqr",
  "4da5eecd": "w-nefertari",
  "2cf9a1ff": "w-nefertari",
  "d132f2e8": "w-nefertari",
  "f5371b06": "w-nefertari",
  "223761dd": "w-nefertari",
  "02372f7d": "w-nefertari",
  "796b1ccc": "w-nefertari",
  "2c202930": "m-malaki",
  "32f16b65": "m-malaki",
  "52719e77": "m-malaki",
  "dde38616": "m-malaki",
  "1ad48c3d": "m-malaki",
  "793c5762": "m-malaki",
  "feaa02d8": "m-malaki",
  "16991423": "m-malaki",
  "af6f705b": "m-fares",
  "fcc8641e": "m-fares",
  "dccd289e": "m-fares",
  "d4d9b980": "m-fares",
  "23a7afd8": "m-fares",
  "9a385b03": "m-fares",
  "4067b212": "m-fares",
  "cff1a52f": "m-fares",
  "2f9f068a": "w-lotus",
  "d5c53dd2": "w-lotus",
  "1943c156": "w-lotus",
  "608b21d2": "w-lotus",
  "fe407c85": "w-hams",
  "25082ab0": "w-hams",
  "d4a0cdb1": "w-hams",
  "427c76e1": "w-hams",
  "d0d4a2c8": "w-hams",
  "4aa37fce": "w-hams",
  "ef4762b4": "w-dalal",
  "e2fbe89a": "w-dalal",
  "1f157ca5": "w-dalal",
  "6da9f73f": "w-dalal",
  "329ec1a4": "w-qamar",
  "f3e24276": "w-qamar",
  "afd08c3d": "w-qamar",
  "ecfc46ba": "w-qamar",
  "2d7b06c3": "w-qamar",
  "5b5767c9": "w-qamar",
  "604f1a6c": "m-anbar",
  "f9316cf4": "m-anbar",
  "dcb812e7": "m-anbar",
  "c9f19133": "m-anbar",
  "fc19e2cf": "m-anbar",
  "a29d3035": "kemet-edp",
  "fc871e29": "kemet-edp",
  "f0260b7b": "kemet-edp",
  "a16a6c33": "kemet-edp",
  "bc016d6c": "kemet-edp",
  "3054fc43": "kemet-edp",
  "f5445014": "kemet-edp",
  "f56695b2": "kemet-edp",
  "899b876c": "kemet-edp"
};
