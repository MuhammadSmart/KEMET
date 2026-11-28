// ===== src/app.js =====
// App shell: basket state, dialogs, route changes (title, scroll, focus), mount.

var SITE_NAME = "عطور كيميت";

function pageTitle(route) {
  if (route.name === "collection") {
    var s = route.section ? sectionById(route.section) : null;
    return (s ? s.title : "كل المنتجات") + " — " + SITE_NAME;
  }
  if (route.name === "product") {
    var p = productById(route.id);
    return p ? p.name + (p.sized ? " أو دو بارفان" : "") + " — " + SITE_NAME : "منتج غير موجود — " + SITE_NAME;
  }
  if (route.name === "notfound") return "الصفحة مش موجودة — " + SITE_NAME;
  return SITE_NAME + " — Wear the legend";
}

function useBasket() {
  var _b = useState(loadBasket), basket = _b[0], setBasket = _b[1];
  var _n = useState(""), notice = _n[0], setNotice = _n[1];
  useEffect(function () { saveBasket(basket); }, [basket]);
  // Keep several open tabs in sync.
  useEffect(function () {
    var onStorage = function (e) { if (e.key === BASKET_STORAGE_KEY) setBasket(loadBasket()); };
    window.addEventListener("storage", onStorage);
    return function () { window.removeEventListener("storage", onStorage); };
  }, []);
  var setQty = useCallback(function (key, q) {
    setBasket(function (b) {
      var next = Object.assign({}, b);
      var n = Math.max(0, Math.min(99, q));
      if (n === 0) delete next[key]; else next[key] = n;
      return next;
    });
  }, []);
  var add = useCallback(function (p, size, q) {
    var key = p.id + ":" + size;
    setBasket(function (b) {
      var next = Object.assign({}, b);
      next[key] = Math.min(99, (next[key] || 0) + q);
      return next;
    });
    setNotice("اتضاف " + unitName(p, size) + " × " + toAr(q) + " للسلة.");
  }, []);
  var clear = useCallback(function () { setBasket({}); setNotice("السلة اتفضّت."); }, []);
  return { basket: basket, setQty: setQty, add: add, clear: clear, notice: notice };
}

function App() {
  var route = useRoute();
  var b = useBasket();
  var _m = useState(false), menuOpen = _m[0], setMenuOpen = _m[1];
  var _k = useState(false), basketOpen = _k[0], setBasketOpen = _k[1];
  var closeMenu = useCallback(function () { setMenuOpen(false); }, []);
  var closeBasket = useCallback(function () { setBasketOpen(false); }, []);
  var openBasket = useCallback(function () { setMenuOpen(false); setBasketOpen(true); }, []);
  var entries = useMemo(function () { return basketEntries(b.basket); }, [b.basket]);
  var totals = useMemo(function () { return basketTotals(entries); }, [entries]);
  var shop = useMemo(function () {
    return { entries: entries, totals: totals, add: b.add, setQty: b.setQty, clearBasket: b.clear, openBasket: openBasket };
  }, [entries, totals, b.add, b.setQty, b.clear, openBasket]);

  // Route side effects: title, scroll restoration, focus.
  var scrollMemory = useRef({});
  var currentKey = useRef(routeKey(route.hash));
  var firstRender = useRef(true);
  useEffect(function () {
    var save = function () { scrollMemory.current[currentKey.current] = window.scrollY; };
    window.addEventListener("scroll", save, { passive: true });
    return function () { window.removeEventListener("scroll", save); };
  }, []);
  useLayoutEffect(function () {
    document.title = pageTitle(route);
    var key = routeKey(route.hash);
    var changedPage = key !== currentKey.current;
    var pushed = navState.push;
    navState.push = false;
    if (pushed && changedPage) scrollMemory.current[currentKey.current] = navState.y || 0;
    currentKey.current = key;
    if (firstRender.current) {
      firstRender.current = false;
      if (route.scrollTo) scrollToSection(route.scrollTo, false);
      return;
    }
    if (route.name === "home" && route.scrollTo) {
      scrollToSection(route.scrollTo, true);
      return;
    }
    if (!changedPage) return; // e.g. typing in search or picking a size
    if (pushed) {
      window.scrollTo(0, 0);
      var heading = document.querySelector("[data-page-heading]");
      if (heading) heading.focus({ preventScroll: true });
    } else {
      window.scrollTo(0, scrollMemory.current[key] || 0);
    }
  }, [route.hash]);

  var page;
  if (route.name === "home") page = h(HomePage, null);
  else if (route.name === "collection") page = h(CollectionPage, { route: route });
  else if (route.name === "product") page = h(ProductPage, { route: route, key: route.id });
  else page = h(NotFoundPage, null);

  return h(ShopContext.Provider, { value: shop },
    h("a", { href: "#main", className: "skip-link", onClick: function (e) {
      e.preventDefault();
      var m = document.getElementById("main");
      if (m) { m.setAttribute("tabindex", "-1"); m.focus(); }
    } }, "روح للمحتوى"),
    h(Header, { route: route, onOpenMenu: function () { setMenuOpen(true); } }),
    h(ErrorBoundary, { resetKey: route.hash }, page),
    h(Footer, null),
    h(MobileBasketBar, null),
    h(MobileMenu, { open: menuOpen, onClose: closeMenu }),
    h(BasketDrawer, { open: basketOpen, onClose: closeBasket }),
    h("div", { className: "sr-only", role: "status", "aria-live": "polite" }, b.notice));
}

function scrollToSection(id, smooth) {
  requestAnimationFrame(function () {
    var el = document.getElementById(id);
    if (!el) return;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: smooth && !reduce ? "smooth" : "auto", block: "start" });
    var heading = el.querySelector("h2");
    if (heading) { heading.setAttribute("tabindex", "-1"); heading.focus({ preventScroll: true }); }
  });
}

if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
var rootEl = document.getElementById("root");
// React replaces the static first-paint shell from index.html on its first commit.
ReactDOMClient.createRoot(rootEl).render(h(App, null));
document.documentElement.classList.add("app-ready");
