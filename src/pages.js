// ===== src/pages.js =====
// Home, collection, product and not-found pages.

function PageHeading(props) {
  // Focus target after navigation (tabIndex -1 keeps it out of the tab order).
  return h("h1", { className: props.className, tabIndex: -1, "data-page-heading": "" }, props.children);
}

// ---------------- Home ----------------
// The three sizes side by side, each bottle drawn at its real relative size
// (height follows the cube root of the volume), with its price. The size with
// the lowest price per ml gets a "best value" tag.
function SizeShelf() {
  var perMl = function (s) { return priceRange(s.key, 1).hi / s.ml; };
  var best = PERFUME_SIZES.reduce(function (a, b) { return perMl(b) < perMl(a) ? b : a; }).key;
  var fill = useRef(appMounted).current;
  return h("div", { className: "size-shelf" + (fill ? " fill" : "") },
    h("p", { className: "size-shelf-title", id: "size-shelf-title" }, "كل عطر بـ٣ أحجام"),
    h("ul", { className: "size-shelf-list", role: "list", "aria-labelledby": "size-shelf-title" }, PERFUME_SIZES.map(function (s) {
      return h("li", { key: s.key, className: "size-shelf-item" + (s.key === best ? " is-best" : "") },
        h("span", { className: "size-shelf-slot" }, h(SizeBottle, { id: "sb-" + s.key, height: Math.round(84 * Math.cbrt(s.ml / 100)) })),
        h("b", { className: "size-shelf-ml" }, s.label),
        h("span", { className: "size-shelf-price" }, priceLabel(s.key)),
        s.key === best && h("span", { className: "size-shelf-tag", title: perMlLabel(s.key) }, "الأوفر"));
    })));
}
function HomePage() {
  var featured = FEATURED_IDS.map(productById).filter(Boolean);
  var others = SECTIONS.filter(function (s) { return s.id !== "women" && s.id !== "men"; });
  return h("main", { id: "main", className: "home" },
    h("section", { className: "hero", "aria-labelledby": "hero-title" },
      h("div", { className: "wrap hero-inner" },
        h("div", { className: "hero-media" },
          // Egyptian doorway: cavetto cornice + torus moulding over the photo frame.
          h("div", { className: "hero-cornice", "aria-hidden": "true" }),
          h("div", { className: "hero-arch" },
            h("picture", null,
              h("source", { media: "(max-width: 719px)", type: "image/webp", srcSet: HERO_PHOTO.mobile }),
              h("source", { type: "image/webp", srcSet: HERO_PHOTO.desktop }),
              h("img", {
                src: HERO_PHOTO.jpg, width: 640, height: 800, fetchpriority: "high", decoding: "async",
                alt: "زجاجة عطر كيميت أو دو بارفان بشعار مفتاح الحياة المجنّح، جنب علبتها السودا بالنقوش الذهبي"
              })))),
        h("div", { className: "hero-copy" },
          h("p", { className: "eyebrow" }, h("span", { lang: "en", dir: "ltr" }, "KEMET"), " · عطور كيميت"),
          h(PageHeading, { className: "hero-title" }, h("span", { id: "hero-title" }, "خلّي حضورك أسطوري.")),
          h("p", { className: "lede" }, "من «نفرتاري» لـ«صقر»: عشر عطور حريمي ورجالي بأسامي من مصر القديمة. اختار اللي يشبهك، واطلبه على واتساب."),
          h("div", { className: "btn-row" },
            h(Link, { to: "#/collection", className: "btn btn-primary btn-large" }, "اكتشف العطور"),
            h(Link, { to: "#/?s=order", className: "text-link" }, "إزاي الطلب بيتم؟")),
          h(SizeShelf, null)))),

    h(Divider, null),

    h("section", { className: "wrap section", "aria-labelledby": "featured-title", "data-reveal": "" },
      h("div", { className: "section-head" },
        h("div", null,
          h("h2", { id: "featured-title" }, "عطور كيميت"),
          h("p", { className: "section-sub" }, "١٠ عطور أو دو بارفان: ٥ حريمي و٥ رجالي.")),
        h(Link, { to: "#/collection", className: "text-link" }, "كل المنتجات")),
      h("div", { className: "entry-tiles" },
        ["women", "men"].map(function (id) {
          var s = sectionById(id);
          var first = productsIn(id)[0];
          return h(Link, { key: id, to: collectionHash(id), className: "entry-tile" },
            h("span", { className: "entry-tile-media" }, h(ProductImage, { product: first, alt: "" })),
            h("span", { className: "entry-tile-text" },
              h("span", { className: "entry-tile-title" }, "عطور " + s.short),
              h("span", { className: "entry-tile-sub" }, toAr(productsIn(id).length) + " عطور · من ٢٠٠ جنيه")),
            h(Icon, { name: "chevron", className: "entry-tile-arrow" }));
        })),
      h(ProductGrid, { items: featured, columns: 4 })),

    h("section", { className: "wrap section", "aria-labelledby": "more-title", "data-reveal": "" },
      h("h2", { id: "more-title" }, "كمان في كيميت"),
      h("ul", { className: "section-links", role: "list" }, others.map(function (s) {
        var n = productsIn(s.id).length;
        return h("li", { key: s.id }, h(Link, { to: collectionHash(s.id) },
          h("span", null, s.title),
          h("span", { className: "section-links-count" }, n > 0 ? toAr(n) + " منتجات" : "اسأل على واتساب"),
          h(Icon, { name: "chevron", size: 18 })));
      }))),

    h("section", { id: "story", className: "story", "aria-labelledby": "story-title" },
      h("div", { className: "wrap story-inner", "data-reveal": "" },
        h("div", { className: "story-mark" }, h(Lotus, { size: 44 })),
        h("div", { className: "story-copy" },
          h("p", { className: "eyebrow eyebrow-light" }, "حكايتنا"),
          h("h2", { id: "story-title" }, "ليه «كيميت»؟"),
          h("p", null, "كيميت، يعني «الأرض السوداء»، هو الاسم اللي المصريين القدماء سمّوا بيه بلدهم، على لون طمي النيل الخصب اللي كان بيغطي الأرض بعد الفيضان."),
          h("p", null, "من أكتر من ٣٠٠٠ سنة، في عصر أمنحتب التالت وإخناتون، شكّل صنّاع الزجاج المصريين قوارير عطر زرقا بلون الكوبالت، عليها خيوط زجاج صفرا وبيضا وفيروزي بتبدأ زجزاج حاد وتنتهي موجة هادية. وفي مقبرة توت عنخ آمون اتلقت قارورة عطر من الكالسيت (المرمر المصري) منحوت عليها إله النيل وهو بيربط اللوتس والبردي."),
          h("p", null, "من هنا جت ألوان كيميت: المرمر الدافي، والأزرق الكوبالتي، ولمسة دهب. والخط اللي بيبدأ زجزاج ويخلص موجة بين أقسام الموقع مأخوذ من نفس القوارير."),
          h("details", { className: "sources" },
            h("summary", null, "المصادر"),
            h("ul", null,
              h("li", null, h("a", { href: "https://www.metmuseum.org/art/collection/search/544828", target: "_blank", rel: "noopener noreferrer", lang: "en", dir: "ltr" }, "The Met — Amphora-shaped perfume bottle, 26.7.1177")),
              h("li", null, h("a", { href: "http://www.griffith.ox.ac.uk/gri/carter/210.html", target: "_blank", rel: "noopener noreferrer", lang: "en", dir: "ltr" }, "Griffith Institute — Carter no. 210, calcite perfume vase")),
              h("li", null, h("a", { href: "https://forces.si.edu/soils/02_08_03.html", target: "_blank", rel: "noopener noreferrer", lang: "en", dir: "ltr" }, "Smithsonian — Kemet, the black land")))))),
      h(Divider, { tone: "light" })),

    h("section", { id: "order", className: "wrap section", "aria-labelledby": "order-title", "data-reveal": "" },
      h("h2", { id: "order-title" }, "إزاي تطلب"),
      h("ol", { className: "steps" },
        h("li", null, h("b", null, "اختار العطر والحجم"), h("span", null, "من صفحة كل عطر هتشوف سعر كل حجم قبل ما تضيفه.")),
        h("li", null, h("b", null, "راجع السلة"), h("span", null, "هتلاقي الإجمالي، وتقدر تغيّر الكمية أو تشيل أي منتج.")),
        h("li", null, h("b", null, "ابعت الطلب على واتساب"), h("span", null, "الطلب بيتكتب لوحده في رسالة للمحل، ومفيش دفع على الموقع. المحل بيرد عليك بالتفاصيل."))),
      h("div", { className: "contact-card" },
        h("div", null,
          h("h3", null, "محتار تختار إيه؟"),
          h("p", null, "اسألنا عن أي عطر أو عن الأطقم والتوصيل، وهنرد عليك.")),
        h(WhatsAppLink, { message: GENERAL_MESSAGE, className: "btn btn-secondary" }, "كلّمنا على واتساب"))));
}

// ---------------- Collection ----------------
function CollectionPage(props) {
  var route = props.route;
  var section = route.section ? sectionById(route.section) : null;
  var q = route.q || "";
  var family = route.family;
  var nq = normalizeAr(q);
  var familiesInUse = SCENT_FAMILIES.filter(function (f) {
    return products.some(function (p) { return p.family === f.id; });
  });
  var showFamilies = familiesInUse.length >= 2;

  var setQuery = function (value) { navigate(collectionHash(route.section, value, family), { replace: true }); };
  var results = products.filter(function (p) {
    if (section && p.section !== section.id) return false;
    if (family && p.family !== family) return false;
    if (nq && !(normalizeAr(p.name).includes(nq) || normalizeAr(sectionTitle(p.section)).includes(nq) ||
      (p.character && normalizeAr(p.character).includes(nq)))) return false;
    return true;
  });
  var filtered = !!(section || family || nq);
  // Count a search once the visitor stops typing.
  var resultCount = results.length;
  useEffect(function () {
    var words = q.trim();
    if (words.length < 2) return;
    var t = setTimeout(function () { trackEvent("search", { q: words.slice(0, 40), results: resultCount }); }, 1500);
    return function () { clearTimeout(t); };
  }, [q]);
  var title = section ? section.title : "كل المنتجات";
  var crumbs = [{ to: "#/", label: "الرئيسية" }].concat(section ? [{ to: "#/collection", label: "كل المنتجات" }, { label: section.title }] : [{ label: "كل المنتجات" }]);
  var searchId = useId();

  var chips = h("nav", { className: "chips", "aria-label": "الأقسام" },
    h("ul", { role: "list" },
      h("li", null, h(Link, { to: collectionHash(null, q, family), className: "chip", "aria-current": !section ? "page" : undefined }, "الكل")),
      SECTIONS.map(function (s) {
        var active = section && section.id === s.id;
        return h("li", { key: s.id }, h(Link, {
          to: collectionHash(active ? null : s.id, q, family), className: "chip", "aria-current": active ? "page" : undefined
        }, active && h(Icon, { name: "check", size: 16 }), s.title));
      })));

  var familyChips = showFamilies && h("nav", { className: "chips chips-family", "aria-label": "طابع الريحة" },
    h("p", { className: "chips-label" }, "طابع الريحة"),
    h("ul", { role: "list" }, familiesInUse.map(function (f) {
      var active = family === f.id;
      return h("li", { key: f.id }, h(Link, {
        to: collectionHash(route.section, q, active ? null : f.id), className: "chip chip-soft", "aria-current": active ? "true" : undefined
      }, active && h(Icon, { name: "check", size: 16 }), f.title));
    })));

  var active = [];
  if (section) active.push({ label: section.title, to: collectionHash(null, q, family), remove: "شيل فلتر " + section.title });
  if (family) active.push({ label: familyById(family).title, to: collectionHash(route.section, q, null), remove: "شيل فلتر " + familyById(family).title });
  if (q) active.push({ label: "«" + q + "»", to: collectionHash(route.section, "", family), remove: "امسح البحث" });

  var body;
  if (results.length === 0 && (!section || section.id !== "sets")) {
    body = h("div", { className: "empty-state" },
      h(Lotus, { size: 40, className: "muted-motif" }),
      h("h2", null, "مفيش نتايج", q ? " لـ«" + q + "»" : ""),
      h("p", null, "جرّب اسم تاني أو شيل الفلاتر. أو اسألنا على واتساب عن اللي بتدوّر عليه."),
      h("div", { className: "btn-row" },
        h(Link, { to: "#/collection", className: "btn btn-primary" }, "اعرض كل المنتجات"),
        h(WhatsAppLink, { message: GENERAL_MESSAGE + (q ? ": بدوّر على " + q : ""), event: { name: "whatsapp-question", data: { topic: "no-results" } } }, "اسأل على واتساب")));
  } else if (!filtered) {
    body = SECTIONS.map(function (s) {
      var items = productsIn(s.id);
      return h("section", { key: s.id, className: "collection-group", "aria-labelledby": "grp-" + s.id },
        h("div", { className: "section-head" },
          h("div", null,
            h("h2", { id: "grp-" + s.id }, s.title, items.length > 0 && h("span", { className: "count" }, " " + toAr(items.length))),
            s.blurb && h("p", { className: "section-sub" }, s.blurb)),
          items.length > 0 && h(Link, { to: collectionHash(s.id), className: "text-link" }, "اعرض القسم ده")),
        s.id === "sets" ? h(SetsCard, null) : h(ProductGrid, { items: items }));
    });
  } else {
    body = h(Fragment, null,
      section && section.blurb && h("p", { className: "section-sub" }, section.blurb),
      section && section.id === "sets" && results.length === 0 ? h(SetsCard, null) : h(ProductGrid, { items: results, headingLevel: "h2" }));
  }

  return h("main", { id: "main", className: "collection" },
    h("div", { className: "wrap" },
      h(Breadcrumbs, { items: crumbs }),
      h("div", { className: "page-head" },
        h(PageHeading, null, title),
        h("p", { className: "result-count", role: "status" }, toAr(results.length) + " منتج")),
      h("div", { className: "filters" },
        h("div", { className: "search" },
          h("label", { htmlFor: searchId, className: "search-label" }, "دوّر بالاسم"),
          h("div", { className: "search-field" },
            h(Icon, { name: "search", size: 20 }),
            h("input", {
              id: searchId, type: "search", value: q, enterKeyHint: "search", autoComplete: "off",
              placeholder: "مثلاً: نفرتاري، مسك، لوشن",
              onChange: function (e) { setQuery(e.target.value); }
            }),
            q && h("button", { type: "button", className: "icon-btn search-clear", onClick: function () { setQuery(""); }, "aria-label": "امسح البحث" }, h(Icon, { name: "close", size: 18 })))),
        chips,
        familyChips),
      active.length > 0 && h("div", { className: "active-filters" },
        h("span", { className: "active-label" }, "بتعرض:"),
        h("ul", { role: "list" }, active.map(function (a) {
          return h("li", { key: a.label }, h(Link, { to: a.to, className: "active-chip", "aria-label": a.remove }, a.label, h(Icon, { name: "close", size: 14 })));
        })),
        h(Link, { to: "#/collection", className: "text-link" }, "امسح الكل")),
      body));
}

function SetsCard() {
  return h("div", { className: "sets-card" },
    h("p", null, "جمّع طقمك بنفسك: اختار أي ٢ أو ٣ منتجات من الأقسام، واسألنا على واتساب عن سعر الطقم والعروض المتاحة."),
    h(WhatsAppLink, { message: SETS_MESSAGE, className: "btn btn-secondary", event: { name: "whatsapp-question", data: { topic: "sets" } } }, "اسأل عن الأطقم على واتساب"));
}

// ---------------- Product ----------------
function ProductPage(props) {
  var route = props.route;
  var p = productById(route.id);
  var shop = useShop();
  var initial = p && p.sized && route.size && sizeKeys(p).includes(route.size) && isSizeAvailable(p, route.size) ? route.size : (p ? defaultSize(p) : "std");
  var _sz = useState(initial), size = _sz[0], setSize = _sz[1];
  var _q = useState(1), qty = _q[0], setQty = _q[1];
  var _a = useState(false), added = _a[0], setAdded = _a[1];
  useEffect(function () { setSize(initial); setQty(1); setAdded(false); }, [route.id]);
  useEffect(function () {
    if (!added) return;
    var t = setTimeout(function () { setAdded(false); }, 2600);
    return function () { clearTimeout(t); };
  }, [added]);

  if (!p) return h(NotFoundPage, { message: "المنتج ده مش موجود أو اتشال من المحل." });

  var section = sectionById(p.section);
  var fam = p.family ? familyById(p.family) : null;
  var canBuy = isSizeAvailable(p, size);
  var r = priceRange(size, qty);
  var related = productsIn(p.section).filter(function (x) { return x.id !== p.id; }).slice(0, 4);
  var chooseSize = function (k) {
    setSize(k);
    setAdded(false);
    navigate(productHash(p.id) + "?size=" + k, { replace: true });
  };
  var addToBasket = function () {
    shop.add(p, size, qty);
    setAdded(true);
  };
  var directOrder = orderMessage(basketEntries((function () { var b = {}; b[p.id + ":" + size] = qty; return b; })()));

  return h("main", { id: "main", className: "pdp" },
    h("div", { className: "wrap" },
      h(Breadcrumbs, { items: [{ to: "#/", label: "الرئيسية" }, { to: collectionHash(p.section), label: section.title }, { label: p.name }] }),
      h("div", { className: "pdp-grid" },
        h("div", { className: "pdp-media" }, h("div", { className: "pdp-frame" }, h(ProductImage, { product: p, size: "large", priority: true, alt: photoAlt(p) }))),
        h("div", { className: "pdp-info" },
          h("p", { className: "card-kicker" }, section.title, fam ? " · " + fam.title : ""),
          h(PageHeading, { className: "pdp-title" }, p.name),
          p.sized && h("p", { className: "pdp-type" }, "أو دو بارفان"),
          p.character && h("p", { className: "pdp-character" }, p.character),
          h("p", { className: "pdp-desc" }, p.desc),

          h("div", { className: "buy-box" },
            h("p", { className: "pdp-price", "aria-live": "polite" },
              h("span", { className: "pdp-price-value" }, canBuy ? priceLabel(size) : "غير متاح حاليًا"),
              p.sized && canBuy && h("span", { className: "pdp-price-size" }, "لحجم " + sizeInfo(size).label)),
            p.sized && h(SizePicker, { product: p, value: size, onChange: chooseSize }),
            canBuy
              ? h(Fragment, null,
                h("div", { className: "buy-row" },
                  h("div", { className: "buy-qty" },
                    h("span", { className: "buy-qty-label", "aria-hidden": "true" }, "الكمية"),
                    h(QtyStepper, { value: qty, min: 1, label: "الكمية", onChange: setQty })),
                  h("button", { type: "button", className: "btn btn-primary btn-large buy-add", onClick: addToBasket },
                    added ? h(Fragment, null, h(Icon, { name: "check", size: 20 }), "اتضاف للسلة") : h(Fragment, null, "أضف للسلة", h("span", { className: "buy-add-price" }, money(r.lo, r.hi))))),
                added && h("button", { type: "button", className: "text-link buy-review", onClick: shop.openBasket }, "راجع السلة وابعت الطلب"),
                h(WhatsAppLink, {
                  message: directOrder, className: "btn btn-secondary btn-block",
                  event: { name: "whatsapp-order", data: { source: "product", product: p.id, size: size, items: qty, total_min: r.lo, total_max: r.hi } }
                }, "اطلب ده بس على واتساب"))
              : h("div", { className: "unavailable-note", role: "note" },
                h("p", null, p.sized && p.available !== false ? "الحجم ده مش متاح حاليًا. اختار حجم تاني، أو اسأل عن ميعاد توفره." : "المنتج ده مش متاح حاليًا. اسأل عن ميعاد توفره."),
                h(WhatsAppLink, { message: availabilityQuestion(p, size), event: { name: "whatsapp-question", data: { topic: "availability", product: p.id } } }, "اسأل عن التوفر"))),

          h("ul", { className: "assurance", role: "list" },
            h("li", null, h(Icon, { name: "chat" }), h("span", null, h("b", null, "الطلب على واتساب. "), "الطلب بيتبعت رسالة جاهزة لواتساب المحل، ومفيش دفع على الموقع.")),
            h("li", null, h(Icon, { name: "truck" }), h("span", null, h("b", null, "التوصيل والدفع. "), "بعد ما تبعت الطلب، المحل بيرد عليك بتفاصيل التوصيل والدفع.")),
            h("li", null, h(Icon, { name: "swap" }), h("span", null, h("b", null, "الاستبدال والاسترجاع. "), "عندك سؤال عنهم؟ اسأل في نفس الرسالة قبل ما تأكد طلبك."))))),

      h("section", { className: "pdp-notes", "aria-labelledby": "notes-title" },
        h("h2", { id: "notes-title" }, p.sized ? "الريحة" : "عن المنتج"),
        hasNotes(p)
          ? h("dl", { className: "notes" },
            [["top", "النوتات العليا", "أول ما ترشّ"], ["heart", "قلب العطر", "بعد دقايق"], ["base", "القاعدة", "اللي بيفضل معاك"]].map(function (row) {
              var list = (p.notes[row[0]] || []);
              if (!list.length) return null;
              return h("div", { key: row[0], className: "notes-row" },
                h("dt", null, row[1], h("span", null, row[2])),
                h("dd", null, list.join("، ")));
            }))
          : h("div", { className: "notes-ask" },
            h("p", null, p.sized ? "عايز تعرف ريحة " + p.name + " عاملة إزاي قبل ما تطلب؟ اسألنا وهنوصفهالك." : "عندك سؤال عن " + p.name + "؟ اسألنا وهنرد عليك."),
            h(WhatsAppLink, { message: p.sized ? scentQuestion(p) : GENERAL_MESSAGE + ": " + p.name, event: { name: "whatsapp-question", data: { topic: p.sized ? "scent" : "product", product: p.id } } }, p.sized ? "اسأل عن الريحة" : "اسأل على واتساب"))),

      related.length > 0 && h("section", { className: "section", "aria-labelledby": "related-title" },
        h("div", { className: "section-head" },
          h("h2", { id: "related-title" }, "من نفس القسم"),
          h(Link, { to: collectionHash(p.section), className: "text-link" }, "كل " + section.title)),
        h(ProductGrid, { items: related, columns: 4 }))));
}

// ---------------- Not found ----------------
function NotFoundPage(props) {
  return h("main", { id: "main", className: "wrap page-msg" },
    h(PageHeading, null, "الصفحة دي مش موجودة"),
    h("p", null, props.message || "يمكن الرابط اتغيّر. تقدر تكمّل من هنا:"),
    h("div", { className: "btn-row" },
      h(Link, { to: "#/collection", className: "btn btn-primary" }, "كل المنتجات"),
      h(Link, { to: "#/", className: "btn btn-secondary" }, "الرئيسية")));
}
