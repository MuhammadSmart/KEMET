// ===== src/components.js =====
// Shared UI: links, header, menus, basket drawer, product cards, size picker, quantity.

var ShopContext = React.createContext(null);
function useShop() {
  return useContext(ShopContext);
}

function Link(props) {
  var onClick = props.onClick;
  var rest = Object.assign({}, props, { to: undefined, onClick: undefined });
  rest.href = props.to;
  rest.onClick = function (e) {
    if (onClick) onClick(e);
    if (!e.defaultPrevented && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) markPush();
  };
  return h("a", rest, props.children);
}

function WhatsAppLink(props) {
  // Every WhatsApp button is counted: orders and specific questions pass their own
  // event; anything else is a general question from the current page.
  var onClick = function (e) {
    if (props.event) trackEvent(props.event.name, props.event.data);
    else trackEvent("whatsapp-question", { topic: "general", page: analyticsUrl(location.hash) });
    if (props.onClick) props.onClick(e);
  };
  return h("a", {
    className: props.className || "btn btn-secondary",
    href: waLink(props.message), target: "_blank", rel: "noopener noreferrer",
    onClick: onClick
  }, h(Icon, { name: "chat" }), h("span", null, props.children),
  h("span", { className: "sr-only" }, " (بيفتح واتساب)"));
}

// Native <dialog> with focus return to the element that opened it.
function useModal(open, onClose) {
  var ref = useRef(null);
  var opener = useRef(null);
  useEffect(function () {
    var d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      opener.current = document.activeElement;
      d.showModal();
    } else if (!open && d.open) {
      d.close();
    }
  }, [open]);
  useEffect(function () {
    var d = ref.current;
    if (!d) return;
    var handleClose = function () {
      onClose();
      var el = opener.current;
      if (el && document.contains(el) && typeof el.focus === "function") el.focus();
    };
    var handleClick = function (e) { if (e.target === d) d.close(); }; // backdrop
    d.addEventListener("close", handleClose);
    d.addEventListener("click", handleClick);
    return function () {
      d.removeEventListener("close", handleClose);
      d.removeEventListener("click", handleClick);
    };
  }, [onClose]);
  return ref;
}

var NAV_LINKS = [
  { to: "#/collection", label: "كل المنتجات", match: function (r) { return r.name === "collection" && !r.section; } },
  { to: "#/collection/women", label: "عطور حريمي", match: function (r) { return r.name === "collection" && r.section === "women"; } },
  { to: "#/collection/men", label: "عطور رجالي", match: function (r) { return r.name === "collection" && r.section === "men"; } },
  { to: "#/?s=story", label: "حكايتنا", match: function () { return false; } },
  { to: "#/?s=order", label: "إزاي تطلب", match: function () { return false; } }
];

function Header(props) {
  var shop = useShop();
  var route = props.route;
  var count = shop.totals.qty;
  return h("header", { className: "site-header" },
    h("div", { className: "wrap header-inner" },
      h("button", {
        type: "button", className: "icon-btn menu-btn", onClick: props.onOpenMenu,
        "aria-haspopup": "dialog", "aria-label": "افتح القائمة"
      }, h(Icon, { name: "menu" })),
      h(Link, { to: "#/", className: "brand", "aria-label": "عطور كيميت، الصفحة الرئيسية" },
        h(Emblem, { width: 46, gradientId: "hdrGold" }),
        h("span", { className: "cartouche" },
          h("span", { className: "brand-text cartouche-ring" },
            h("span", { className: "brand-latin", lang: "en", dir: "ltr" }, "KEMET"),
            h("span", { className: "brand-ar" }, "عطور كيميت")))),
      h("nav", { className: "main-nav", "aria-label": "التنقل الرئيسي" },
        h("ul", null, NAV_LINKS.map(function (l) {
          var current = l.match(route);
          return h("li", { key: l.to }, h(Link, { to: l.to, "aria-current": current ? "page" : undefined }, l.label));
        }))),
      h("button", {
        type: "button", className: "basket-btn", onClick: shop.openBasket, "aria-haspopup": "dialog",
        "aria-label": count > 0 ? "السلة، فيها " + toAr(count) + " منتج" : "السلة فاضية"
      },
        h(Icon, { name: "bag" }),
        h("span", { className: "basket-btn-label", "aria-hidden": "true" }, "السلة"),
        count > 0 && h("span", { className: "basket-count", "aria-hidden": "true" }, toAr(count)))));
}

function MobileMenu(props) {
  var ref = useModal(props.open, props.onClose);
  var close = function () { if (ref.current) ref.current.close(); };
  return h("dialog", { ref: ref, className: "drawer drawer-start", "aria-labelledby": "menu-title" },
    h("div", { className: "drawer-head" },
      h("h2", { id: "menu-title", className: "drawer-title" }, "القائمة"),
      h("button", { type: "button", className: "icon-btn", onClick: close, "aria-label": "اقفل القائمة" }, h(Icon, { name: "close" }))),
    h("nav", { className: "drawer-body menu-nav", "aria-label": "أقسام المحل" },
      h("ul", null,
        h("li", null, h(Link, { to: "#/", onClick: close }, "الرئيسية")),
        h("li", null, h(Link, { to: "#/collection", onClick: close }, "كل المنتجات", h("span", { className: "menu-count" }, toAr(products.length)))),
        SECTIONS.map(function (s) {
          var n = productsIn(s.id).length;
          return h("li", { key: s.id }, h(Link, { to: collectionHash(s.id), onClick: close }, s.title, n > 0 && h("span", { className: "menu-count" }, toAr(n))));
        })),
      h(Divider, null),
      h("ul", null,
        h("li", null, h(Link, { to: "#/?s=story", onClick: close }, "حكايتنا")),
        h("li", null, h(Link, { to: "#/?s=order", onClick: close }, "إزاي تطلب")))),
    h("div", { className: "drawer-foot" },
      h(WhatsAppLink, { message: GENERAL_MESSAGE, className: "btn btn-secondary btn-block" }, "عندك سؤال؟ كلّمنا على واتساب")));
}

function QtyStepper(props) {
  var q = props.value;
  var min = props.min || 0;
  var atMin = q <= min, atMax = q >= 99;
  var of = props.itemName ? " " + props.itemName : "";
  // aria-disabled instead of disabled: a disabled button drops keyboard focus
  // the moment the limit is reached.
  return h("div", { className: "qty", role: "group", "aria-label": props.label },
    h("button", {
      type: "button", "aria-disabled": atMin ? "true" : undefined, "aria-label": of ? "قلّل كمية" + of : "قلّل الكمية",
      onClick: function () { if (!atMin) props.onChange(q - 1); }
    }, h(Icon, { name: "minus", size: 18 })),
    h("output", { "aria-live": "polite", "aria-label": "الكمية " + toAr(q) }, toAr(q)),
    h("button", {
      type: "button", "aria-disabled": atMax ? "true" : undefined, "aria-label": of ? "زوّد كمية" + of : "زوّد الكمية",
      onClick: function () { if (!atMax) props.onChange(q + 1); }
    }, h(Icon, { name: "plus", size: 18 })));
}

function BasketDrawer(props) {
  var shop = useShop();
  var ref = useModal(props.open, props.onClose);
  var close = function () { if (ref.current) ref.current.close(); };
  var entries = shop.entries;
  var orderable = entries.filter(function (e) { return e.available; });
  var totals = basketTotals(orderable);
  var hasRange = totals.lo !== totals.hi;
  // Status messages must live inside the open modal: everything outside it is
  // inert, so the app-wide live region can't be heard while the drawer is open.
  var _n = useState({ text: "", n: 0 }), notice = _n[0], setNotice = _n[1];
  var say = function (text) { setNotice(function (o) { return { text: text, n: o.n + 1 }; }); };
  // After a line disappears, move focus to the next line (or the title) instead
  // of letting it fall back to the page.
  var focusLine = useRef(null);
  useEffect(function () {
    if (focusLine.current === null || !ref.current) return;
    var i = focusLine.current;
    focusLine.current = null;
    var names = ref.current.querySelectorAll(".basket-line-name");
    var target = names[Math.min(i, names.length - 1)] || ref.current.querySelector("#basket-title");
    if (target) target.focus();
  }, [entries]);
  var removeLine = function (e, i) {
    focusLine.current = i;
    shop.setQty(e.key, 0);
    say("اتشال " + e.unit + " من السلة.");
  };
  var clearAll = function () {
    focusLine.current = 0;
    shop.clearBasket();
    say("السلة اتفضّت.");
  };
  return h("dialog", { ref: ref, className: "drawer drawer-end", "aria-labelledby": "basket-title" },
    h("div", { className: "drawer-head" },
      h("h2", { id: "basket-title", className: "drawer-title", tabIndex: -1 }, "سلتك", totals.qty > 0 && h("span", { className: "drawer-sub" }, " (" + toAr(totals.qty) + ")")),
      h("button", { type: "button", className: "icon-btn", onClick: close, "aria-label": "اقفل السلة" }, h(Icon, { name: "close" }))),
    entries.length === 0
      ? h("div", { className: "drawer-body basket-empty" },
        h(Lotus, { size: 40, className: "muted-motif" }),
        h("p", null, "السلة فاضية لسه."),
        h(Link, { to: "#/collection", className: "btn btn-primary", onClick: close }, "اكتشف العطور"))
      : h(Fragment, null,
        h("ul", { className: "drawer-body basket-lines" }, entries.map(function (e, i) {
          var p = e.product;
          return h("li", { key: e.key, className: "basket-line" + (e.available ? "" : " is-unavailable") },
            h("div", { className: "basket-thumb" }, h(ProductImage, { product: p, size: "thumb", alt: "" })),
            h("div", { className: "basket-line-main" },
              h(Link, { to: productHash(p.id), className: "basket-line-name", onClick: close }, p.name),
              h("p", { className: "basket-line-meta" }, p.sized ? sizeInfo(e.size).label + " · " : "", priceLabel(e.size), " للقطعة"),
              !e.available && h("p", { className: "basket-line-warn", role: "note" }, "غير متاح حاليًا، مش هيتبعت في الطلب."),
              h("div", { className: "basket-line-row" },
                h(QtyStepper, { value: e.q, min: 1, label: "كمية " + e.unit, itemName: e.unit, onChange: function (n) { shop.setQty(e.key, n); } }),
                h("button", { type: "button", className: "link-btn", onClick: function () { removeLine(e, i); }, "aria-label": "شيل " + e.unit + " من السلة" }, "شيل"))),
            h("p", { className: "basket-line-total" }, money(e.lo, e.hi)));
        })),
        h("div", { className: "drawer-foot basket-foot" },
          h("p", { className: "basket-total" }, h("span", null, "الإجمالي"), h("b", null, money(totals.lo, totals.hi))),
          hasRange && h("p", { className: "fine" }, "سعر حجم ٥٠ مل بين ٣٥٠ و٤٠٠ جنيه، والمحل بيأكد السعر النهائي في الرد."),
          orderable.length > 0
            ? h(WhatsAppLink, {
              message: orderMessage(orderable), className: "btn btn-primary btn-block",
              event: { name: "whatsapp-order", data: { source: "basket", lines: orderable.length, items: totals.qty, total_min: totals.lo, total_max: totals.hi } }
            }, "ابعت الطلب على واتساب")
            : h("p", { className: "fine" }, "مفيش منتجات متاحة في السلة."),
          h("p", { className: "fine" }, "الطلب بيتبعت رسالة جاهزة لواتساب المحل، ومفيش دفع على الموقع. المحل بيرد عليك بالتفاصيل."),
          h("div", { className: "basket-actions" },
            h("button", { type: "button", className: "link-btn", onClick: close }, "كمّل تسوّق"),
            h("button", { type: "button", className: "link-btn", onClick: clearAll }, "فضّي السلة")))),
    // A new node per message, so repeating the same text is announced again.
    h("div", { className: "sr-only", role: "status", "aria-live": "polite" }, notice.text && h("span", { key: notice.n }, notice.text)));
}

// Responsive product photo; falls back to the brand drawing if the image fails.
function ProductImage(props) {
  var p = props.product;
  var _s = useState(false), failed = _s[0], setFailed = _s[1];
  if (!p.photo || failed) {
    return h(ProductArt, { product: p, label: props.alt ? props.alt : "", suffix: "-" + (props.size || "card") });
  }
  var sizes = props.size === "large" ? "(min-width: 900px) 46vw, 100vw" : props.size === "thumb" ? "64px" : "(min-width: 1024px) 22vw, (min-width: 768px) 30vw, 46vw";
  return h("picture", null,
    h("source", { type: "image/webp", srcSet: p.photo.w320 + " 320w, " + p.photo.w640 + " 640w", sizes: sizes }),
    h("img", {
      src: p.photo.jpg, alt: props.alt || "", width: 640, height: 800,
      loading: props.priority ? "eager" : "lazy", decoding: "async",
      fetchpriority: props.priority ? "high" : undefined,
      onError: function () { setFailed(true); }
    }));
}

function photoAlt(p) {
  return p.photo
    ? "زجاجة " + p.name + " من كيميت جنب علبتها السودا بالنقوش الذهبي"
    : "رسم " + p.name + " بشعار كيميت الذهبي";
}

function sizesSummary(p) {
  if (!p.sized) return null;
  var avail = PERFUME_SIZES.filter(function (s) { return isSizeAvailable(p, s.key); });
  // Arabic comma, not a middle dot: "·" next to Arabic-Indic digits reads like the
  // zero "٠", so "٣٠ · ٥٠" looked like one long number.
  return avail.map(function (s) { return toAr(s.ml); }).join("، ") + " مل";
}

function ProductCard(props) {
  var p = props.product;
  var shop = useShop();
  var fam = p.family ? familyById(p.family) : null;
  var Heading = props.headingLevel || "h3";
  var unavailable = p.available === false;
  return h("article", { className: "card" + (unavailable ? " is-unavailable" : "") },
    h("div", { className: "card-media" }, h(ProductImage, { product: p, alt: "" })),
    h("div", { className: "card-body" },
      h("p", { className: "card-kicker" }, fam ? fam.title : sectionById(p.section).short, p.sized ? " · أو دو بارفان" : ""),
      h(Heading, { className: "card-title" }, h(Link, { to: productHash(p.id), className: "stretched" }, p.name)),
      p.character && h("p", { className: "card-character" }, p.character),
      p.sized && h("p", { className: "card-sizes" }, sizesSummary(p)),
      h("p", { className: "card-price" }, unavailable ? "غير متاح حاليًا" : (p.sized ? "من " + money(fromPrice(p), fromPrice(p)) : priceLabel("std"))),
      !p.sized && !unavailable && h("button", {
        type: "button", className: "btn btn-quiet btn-small card-add",
        onClick: function () { shop.add(p, "std", 1); },
        "aria-label": "أضف " + p.name + " للسلة"
      }, h(Icon, { name: "plus", size: 16 }), "أضف للسلة")));
}

function ProductGrid(props) {
  return h("ul", { className: "product-grid" + (props.columns === 4 ? " product-grid-4" : ""), role: "list" }, props.items.map(function (p) {
    return h("li", { key: p.id }, h(ProductCard, { product: p, headingLevel: props.headingLevel }));
  }));
}

function SizePicker(props) {
  var p = props.product;
  var name = useId();
  return h("fieldset", { className: "size-picker" },
    h("legend", null, "اختار الحجم"),
    h("div", { className: "size-options" }, PERFUME_SIZES.map(function (s) {
      var avail = isSizeAvailable(p, s.key);
      var checked = props.value === s.key;
      return h("label", { key: s.key, className: "size-option" + (checked ? " is-checked" : "") + (avail ? "" : " is-disabled") },
        h("input", {
          type: "radio", name: name, value: s.key, checked: checked, disabled: !avail,
          "aria-label": s.label + "، " + (avail ? priceLabel(s.key) : "غير متاح حاليًا"),
          onChange: function () { props.onChange(s.key); }
        }),
        h("span", { className: "size-ml" }, s.label),
        h("span", { className: "size-price" }, avail ? priceLabel(s.key) : "غير متاح حاليًا"),
        avail && h("span", { className: "size-per" }, "≈ " + perMlLabel(s.key)),
        checked && h(Icon, { name: "check", size: 18, className: "size-check" }));
    })));
}

function Breadcrumbs(props) {
  return h("nav", { className: "breadcrumbs", "aria-label": "مكانك في الموقع" },
    h("ol", null, props.items.map(function (it, i) {
      var last = i === props.items.length - 1;
      return h("li", { key: i }, last
        ? h("span", { "aria-current": "page" }, it.label)
        : h(Link, { to: it.to }, it.label));
    })));
}

function MobileBasketBar() {
  var shop = useShop();
  if (shop.totals.qty === 0) return null;
  return h("div", { className: "basket-bar" },
    h("button", { type: "button", className: "basket-bar-btn", onClick: shop.openBasket, "aria-haspopup": "dialog" },
      h("span", { className: "basket-bar-info" },
        h(Icon, { name: "bag", size: 20 }),
        h("span", null, "السلة (" + toAr(shop.totals.qty) + ")"),
        h("b", null, money(shop.totals.lo, shop.totals.hi))),
      h("span", { className: "basket-bar-cta" }, "راجع واطلب")));
}

function Footer() {
  return h("footer", { className: "site-footer" },
    h(Divider, { tone: "light" }),
    h("div", { className: "wrap footer-inner" },
      h("div", { className: "footer-brand" },
        h(Emblem, { width: 64, gradientId: "ftrGold" }),
        h("p", { className: "cartouche cartouche-light" },
          h("span", { className: "brand-text cartouche-ring" },
            h("span", { className: "brand-latin", lang: "en", dir: "ltr" }, "KEMET"),
            h("span", { className: "brand-ar" }, "عطور كيميت"))),
        h("p", { lang: "en", dir: "ltr" }, "Wear the legend")),
      h("nav", { "aria-label": "روابط الفوتر" },
        h("ul", null,
          h("li", null, h(Link, { to: "#/collection" }, "كل المنتجات")),
          h("li", null, h(Link, { to: "#/collection/women" }, "عطور حريمي")),
          h("li", null, h(Link, { to: "#/collection/men" }, "عطور رجالي")),
          h("li", null, h(Link, { to: "#/?s=order" }, "إزاي تطلب")))),
      h("div", { className: "footer-contact" },
        h("p", null, "للطلب والاستفسار"),
        h(WhatsAppLink, { message: GENERAL_MESSAGE, className: "btn btn-on-dark" }, "واتساب المحل"),
        h("p", { className: "fine", dir: "ltr" }, "+" + WA_NUMBER.slice(0, 2) + " " + WA_NUMBER.slice(2, 5) + " " + WA_NUMBER.slice(5, 8) + " " + WA_NUMBER.slice(8)))),
    h("p", { className: "wrap footer-note" }, "الأسعار بالجنيه المصري وبتتحدث هنا أول ما تتغير. الطلب والاستفسار على واتساب المحل."));
}

var ErrorBoundary = (function () {
  function EB(props) {
    React.Component.call(this, props);
    this.state = { error: null };
  }
  EB.prototype = Object.create(React.Component.prototype);
  EB.prototype.constructor = EB;
  EB.getDerivedStateFromError = function (error) { return { error: error }; };
  EB.prototype.componentDidUpdate = function (prev) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null });
  };
  EB.prototype.render = function () {
    if (!this.state.error) return this.props.children;
    return h("main", { id: "main", className: "wrap page-msg" },
      h("h1", null, "حصلت مشكلة في عرض الصفحة"),
      h("p", null, "جرّب ترجع للرئيسية، أو ابعتلنا على واتساب وهنساعدك."),
      h("div", { className: "btn-row" },
        h("a", { href: "#/", className: "btn btn-primary" }, "الرئيسية"),
        h(WhatsAppLink, { message: GENERAL_MESSAGE }, "كلّمنا على واتساب")));
  };
  return EB;
})();
