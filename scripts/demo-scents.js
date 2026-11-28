// ===== scripts/demo-scents.js (DEMO ONLY — included by `node scripts/build.mjs --demo`) =====
// Shows how the shop looks once perfumes carry their own names, scent lines,
// families, notes and accords. Names are the proposals from the
// "أشهر ٢٠ عطر في مصر وتوناتهم" doc; notes and accords come from the public
// pyramids of the perfumes each one resembles (Fragrantica, via search results).
// Accord strengths are approximate (strongest first). The photos are the current
// ten, reused. Never deploy demo.html / demo.js.
(function () {
  var PHOTOS = ["AIGQQVZY", "XVYQC4Q3", "IKSPV5TU", "3S6CFY2F", "UPLPPC2X", "6LDHZZDF", "WSJWFZYL", "IGZKQG2K", "P5GJTFHN", "6AIGJKZ2"];
  var S = [100, 82, 68, 56, 46, 38];
  var acc = function (ids) { return ids.map(function (id, i) { return [id, S[i] || 30]; }); };

  var WOMEN = [
    { id: "w-nefertari", name: "نفرتاري", family: "floral", character: "زهور بيضا على لافندر وفانيليا، أنثوي وجريء",
      notes: { top: ["لافندر", "يوسفي", "كشمش أسود", "بيتيجرين"], heart: ["لافندر", "زهر البرتقال", "ياسمين"], base: ["فانيليا", "مسك", "أرز", "عنبر رمادي"] },
      accords: acc(["white_floral", "citrus", "lavender", "vanilla", "aromatic", "sweet"]) },
    { id: "w-hathor", name: "حتحور", family: "gourmand", character: "حلو زي الحلويات، برالين وفانيليا بلمسة سوسن",
      notes: { top: ["كشمش أسود", "كمثرى"], heart: ["سوسن", "ياسمين", "زهر البرتقال"], base: ["برالين", "فانيليا", "باتشولي", "تونكا"] },
      accords: acc(["sweet", "vanilla", "fruity", "patchouli", "woody", "white_floral"]) },
    { id: "w-nut", name: "نوت", family: "gourmand", character: "قهوة وفانيليا، دافي وحلو للسهرات",
      notes: { top: ["كمثرى", "فلفل وردي", "زهر البرتقال"], heart: ["قهوة", "ياسمين", "لوز"], base: ["فانيليا", "باتشولي", "خشب الكشمير", "أرز"] },
      accords: acc(["vanilla", "coffee", "sweet", "white_floral", "warm_spicy", "soft_spicy"]) },
    { id: "w-thebes", name: "سحر طيبة", family: "gourmand", character: "فل ومسك الروم على كاكاو وتونكا، حلو وتقيل",
      notes: { top: ["لوز", "قهوة", "برغموت", "ليمون"], heart: ["تيوبروز", "فل", "زهر البرتقال", "ورد"], base: ["تونكا", "كاكاو", "فانيليا", "صندل", "مسك"] },
      accords: acc(["sweet", "white_floral", "vanilla", "warm_spicy", "amber", "cacao"]) },
    { id: "w-nilerose", name: "وردة النيل", family: "floral", character: "ورد بودري ناعم بفانيليا، رقيق وشيك",
      notes: { top: ["سوسن", "فاوانيا", "زنبق الوادي"], heart: ["ورد", "مشمش", "خوخ"], base: ["فانيليا", "مسك", "تونكا", "صندل"] },
      accords: acc(["powdery", "vanilla", "rose", "floral", "fruity", "sweet"]) },
    { id: "w-merit", name: "ميريت", family: "floral", character: "باقة زهور بيضا وفواكه، منعش وأنيق",
      notes: { top: ["كمثرى", "شمام", "خوخ", "يوسفي", "برغموت"], heart: ["ياسمين", "زنبق الوادي", "تيوبروز", "ورد"], base: ["مسك", "فانيليا", "أرز"] },
      accords: acc(["white_floral", "floral", "fruity", "sweet", "fresh", "citrus"]) },
    { id: "w-siwa", name: "ملح سيوة", family: "gourmand", character: "فانيليا مالحة زي ريحة البحر على جلد دافي",
      notes: { top: ["ياسمين", "يوسفي", "زنجبيل"], heart: ["فانيليا", "ملح"], base: ["خشب الكشمير", "عنبر رمادي", "صندل"] },
      accords: acc(["vanilla", "salty", "white_floral", "woody", "amber", "powdery"]) },
    { id: "w-tiye", name: "تيي", family: "woody", character: "حمضيات وباتشولي مع ورد، كلاسيكي ونضيف",
      notes: { top: ["برتقال", "يوسفي", "برغموت", "زهر البرتقال"], heart: ["ورد", "ياسمين", "يلانج يلانج"], base: ["باتشولي", "مسك أبيض", "فانيليا", "فيتيفر", "تونكا"] },
      accords: acc(["citrus", "woody", "patchouli", "sweet", "white_floral", "rose"]) },
    { id: "w-lotus", name: "زهرة اللوتس", family: "floral", character: "زهور بيضا ومسك أبيض، نضيف ومريح",
      notes: { top: ["زهر البرتقال", "برغموت"], heart: ["تيوبروز", "ياسمين"], base: ["فانيليا", "مسك أبيض", "أرز"] },
      accords: acc(["white_floral", "tuberose", "citrus", "animalic", "vanilla"]) },
    { id: "w-nubia", name: "ذهب النوبة", family: "amber", character: "عنبري خشبي بزعفران وسكر محروق، فخم وفواح",
      notes: { top: ["زعفران", "ياسمين"], heart: ["عنبر", "عنبر رمادي"], base: ["أرز"] },
      accords: acc(["woody", "amber", "warm_spicy", "metallic", "fresh_spicy", "aromatic"]) }
  ];
  var MEN = [
    { id: "m-saqr", name: "صقر", family: "fresh", character: "فريش حار، برغموت وفلفل على عنبر، شبابي وفواح",
      notes: { top: ["برغموت", "فلفل"], heart: ["فلفل وردي", "لافندر", "فيتيفر", "باتشولي", "جيرانيوم"], base: ["أمبروكسان", "أرز", "لادن"] },
      accords: acc(["fresh_spicy", "amber", "citrus", "aromatic", "musky", "woody"]) },
    { id: "m-hapi", name: "حابي", family: "fresh", character: "حمضيات وبخور وخشب، شيك ومناسب للشغل",
      notes: { top: ["جريب فروت", "ليمون", "نعناع", "برغموت", "فلفل وردي"], heart: ["زنجبيل", "ياسمين", "جوزة الطيب", "شمام"], base: ["بخور", "عنبر", "أرز", "صندل", "باتشولي"] },
      accords: acc(["citrus", "amber", "woody", "fresh_spicy", "aromatic", "warm_spicy"]) },
    { id: "m-malaki", name: "ملكي", family: "amber", character: "حلو حار بالقرفة والجلد، للسهرة",
      notes: { top: ["يوسفي", "جريب فروت", "نعناع"], heart: ["قرفة", "ورد"], base: ["عنبر", "جلد", "باتشولي"] },
      accords: acc(["warm_spicy", "cinnamon", "citrus", "amber", "woody", "leather"]) },
    { id: "m-fanar", name: "فنار", family: "fresh", character: "بحري منعش بليمون، صيفي ونضيف",
      notes: { top: ["ليم", "ليمون", "برغموت", "برتقال", "نيرولي"], heart: ["نفحات بحرية", "ياسمين", "روزماري", "خوخ"], base: ["مسك أبيض", "أرز", "طحلب البلوط", "باتشولي", "عنبر"] },
      accords: acc(["citrus", "aromatic", "aquatic", "fresh_spicy", "floral", "woody"]) },
    { id: "m-fares", name: "فارس", family: "woody", character: "أناناس مدخّن على خشب ومسك، فخم",
      notes: { top: ["كشمش أسود", "برغموت", "تفاح", "أناناس"], heart: ["ورد", "بتولا", "ياسمين", "باتشولي"], base: ["مسك", "طحلب البلوط", "عنبر رمادي", "فانيليا"] },
      accords: acc(["fruity", "sweet", "woody", "leather", "citrus", "smoky"]) },
    { id: "m-aten", name: "آتون", family: "gourmand", character: "نعناع وتفاح أخضر على فانيليا، حلو منعش وفواح",
      notes: { top: ["نعناع", "تفاح أخضر", "ليمون"], heart: ["تونكا", "أمبروكسان", "جيرانيوم"], base: ["فانيليا", "أرز", "فيتيفر", "طحلب البلوط"] },
      accords: acc(["vanilla", "aromatic", "green", "fresh_spicy", "amber", "citrus"]) },
    { id: "m-amun", name: "آمون", family: "woody", character: "سوسن بودري على خشب، راقي ودافي للشتا",
      notes: { top: ["لافندر"], heart: ["سوسن", "كمثرى"], base: ["أرز", "فيتيفر"] },
      accords: acc(["iris", "woody", "powdery", "earthy", "aromatic", "violet"]) },
    { id: "m-memphis", name: "منف", family: "fresh", character: "تفاح وزنجبيل ومريمية، منعش ومودرن",
      notes: { top: ["تفاح", "زنجبيل", "برغموت"], heart: ["مريمية", "حب العرعر", "جيرانيوم"], base: ["فيتيفر", "أرز", "تونكا", "لبان"] },
      accords: acc(["aromatic", "fresh_spicy", "woody", "fruity", "fresh", "amber"]) },
    { id: "m-punt", name: "بونت", family: "woody", character: "خشبي جلدي ببرغموت وفيتيفر، يومي وعملي",
      notes: { top: ["برغموت", "فلفل وردي", "مريمية"], heart: ["فيتيفر", "جلد"], base: ["أمبروكسان", "باتشولي", "كاكاو"] },
      accords: acc(["woody", "citrus", "aromatic", "amber", "musky", "fresh_spicy"]) },
    { id: "m-khulud", name: "خلود", family: "fresh", character: "عشبي نضيف بلافندر وحمضيات، كلاسيكي",
      notes: { top: ["لافندر", "ليمون", "برغموت", "يوسفي"], heart: ["مريمية", "حب العرعر", "ريحان", "جيرانيوم", "ياسمين"], base: ["صندل", "مسك", "فيتيفر", "عنبر"] },
      accords: acc(["aromatic", "citrus", "fresh_spicy", "woody", "lavender", "white_floral"]) }
  ];

  var make = function (section) {
    return function (d, i) {
      var p = perfume(d.id, section, d.name);
      p.photo = photoSet(PHOTOS[(i + (section === "men" ? 5 : 0)) % PHOTOS.length]);
      p.family = d.family; p.character = d.character; p.notes = d.notes; p.accords = d.accords;
      return p;
    };
  };
  var others = products.filter(function (p) { return !p.sized; });
  products.length = 0;
  Array.prototype.push.apply(products, WOMEN.map(make("women")));
  Array.prototype.push.apply(products, MEN.map(make("men")));
  Array.prototype.push.apply(products, others);
  FEATURED_IDS.length = 0;
  Array.prototype.push.apply(FEATURED_IDS, ["w-hathor", "w-nefertari", "m-saqr", "m-hapi"]);
})();
