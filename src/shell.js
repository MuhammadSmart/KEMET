// ===== src/shell.js =====
// First paint, before main.js arrives. scripts/build.mjs inlines it into
// index.html in two parts, split at the "//#body" line:
//
// HEAD (tiny, ahead of main.css): starts downloading the image the opened page
//   leads with: the hero on the homepage, the photo on a product link.
// BODY (after the shell header): draws a light copy of the top of the page with
//   the same markup and classes the React page uses, so nothing jumps when React
//   replaces it: photo + name + price on a product, title on a collection.
//   (The homepage hero comes from <template id="shell-home">; unknown pages get
//   only the header.)
(function () {
  var H = __SHELL_HEAD__; // { hero: {mobile, desktop}, photos: {id: [w320, w640]} }

  // Shim: the original host (Instinct Files) injected this object; the page-kit
  // runtime in main.js still reads it.
  window.instinctFile = { initialRoute: "/", route: function () {} };

  function preload(attrs) {
    var l = document.createElement("link");
    l.rel = "preload";
    l.as = "image";
    for (var k in attrs) l.setAttribute(k, attrs[k]);
    document.head.appendChild(l);
  }

  var hash = location.hash.replace(/^#/, "");
  var product = hash.match(/^\/p\/([^\/?]+)/);
  var id = product && (function () { try { return decodeURIComponent(product[1]); } catch (e) { return product[1]; } })();
  if (hash === "" || hash === "/" || hash.indexOf("/?") === 0) {
    // The hero copy in <template id="shell-home"> is inserted by a one-line
    // script right after it (scripts/shell.mjs), ahead of the catalog data below.
    window.__kemetHome = true;
    preload({ href: H.hero.mobile, type: "image/webp", media: "(max-width: 719px)", fetchpriority: "high" });
    preload({ href: H.hero.desktop, type: "image/webp", media: "(min-width: 720px)", fetchpriority: "high" });
  } else if (id && H.photos.hasOwnProperty(id)) {
    var ph = H.photos[id];
    preload({ href: ph[1], imagesrcset: ph[0] + " 320w, " + ph[1] + " 640w", imagesizes: "(min-width: 900px) 46vw, 100vw", type: "image/webp", fetchpriority: "high" });
  }
})();
//#body
(function () {
  var D = __SHELL_DATA__;

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function parse(hash) {
    var raw = hash.replace(/^#/, "");
    var legacy = raw.match(/^sec-([a-z]+)$/);
    if (legacy) return { name: "collection", section: D.sections[legacy[1]] ? legacy[1] : null, filtered: false };
    if (raw === "" || raw === "/" || raw.indexOf("/?") === 0) return { name: "home" };
    var split = raw.split("?");
    var parts = split[0].split("/").filter(Boolean);
    var query = split[1] || "";
    if (parts[0] === "collection") {
      if (parts[1] && !D.sections[parts[1]]) return { name: "other" };
      return { name: "collection", section: parts[1] || null, filtered: /(^|&)(q|family)=[^&]/.test(query) };
    }
    if (parts[0] === "p" && parts[1]) {
      var id;
      try { id = decodeURIComponent(parts[1]); } catch (e) { id = parts[1]; }
      var size = (query.match(/(?:^|&)size=([^&]*)/) || [])[1] || null;
      return D.products[id] ? { name: "product", id: id, size: size } : { name: "other" };
    }
    return { name: "other" };
  }

  // Same markup as Breadcrumbs in src/components.js (scripts/check.mjs compares them).
  function crumbs(items) {
    return '<nav class="breadcrumbs" aria-label="مكانك في الموقع"><ol>' + items.map(function (it, i) {
      return "<li>" + (i === items.length - 1
        ? '<span aria-current="page">' + esc(it.label) + "</span>"
        : '<a href="' + esc(it.to) + '">' + esc(it.label) + "</a>") + "</li>";
    }).join("") + "</ol></nav>";
  }

  function productHtml(r) {
    var p = D.products[r.id];
    var name = p[0], section = D.sections[p[1]], photo = p[2], sized = p[3], desc = p[4] || D.genericDesc;
    var prices = p[6], character = p[7], family = p[8];
    var size = r.size && prices[r.size] ? r.size : p[5];
    var price = prices[size];
    var media = photo
      ? '<picture><source type="image/webp" srcset="' + esc(photo[0]) + " 320w, " + esc(photo[1]) + ' 640w" sizes="(min-width: 900px) 46vw, 100vw">' +
        '<img src="' + esc(photo[2]) + '" alt="' + esc(photo[3]) + '" width="640" height="800" loading="eager" decoding="async" fetchpriority="high"></picture>'
      : "";
    return '<main id="main" class="pdp"><div class="wrap">' +
      crumbs([{ to: "#/", label: "الرئيسية" }, { to: "#/collection/" + p[1], label: section[0] }, { label: name }]) +
      '<div class="pdp-grid"><div class="pdp-media"><div class="pdp-frame"' + (photo ? "" : ' style="background:' + esc(D.artBg) + '"') + ">" + media + "</div></div>" +
      '<div class="pdp-info"><p class="card-kicker">' + esc(section[0]) + (family ? " · " + esc(family) : "") + "</p>" +
      '<h1 class="pdp-title">' + esc(name) + "</h1>" +
      (sized ? '<p class="pdp-type">أو دو بارفان</p>' : "") +
      (character ? '<p class="pdp-character">' + esc(character) + "</p>" : "") +
      '<p class="pdp-desc">' + esc(desc) + "</p>" +
      '<div class="buy-box"><p class="pdp-price"><span class="pdp-price-value">' + esc(price || "غير متاح حاليًا") + "</span>" +
      (sized && price ? '<span class="pdp-price-size">لحجم ' + esc(D.sizeLabels[size]) + "</span>" : "") +
      "</p></div></div></div></div></main>";
  }

  function collectionHtml(r) {
    var s = r.section ? D.sections[r.section] : null;
    var title = s ? s[0] : "كل المنتجات";
    var items = [{ to: "#/", label: "الرئيسية" }].concat(s ? [{ to: "#/collection", label: "كل المنتجات" }, { label: title }] : [{ label: title }]);
    return '<main id="main" class="collection"><div class="wrap">' + crumbs(items) +
      '<div class="page-head"><h1>' + esc(title) + "</h1>" +
      (r.filtered ? "" : '<p class="result-count">' + esc(s ? s[1] : D.total) + "</p>") +
      "</div></div></main>";
  }

  var route = parse(location.hash);

  window.__kemetShell = {
    parse: parse,
    crumbs: crumbs,
    // Called right after this script, at the end of the shell markup in <body>.
    render: function (anchor) {
      if (route.name === "product") {
        anchor.insertAdjacentHTML("beforebegin", productHtml(route));
      } else if (route.name === "collection") {
        anchor.insertAdjacentHTML("beforebegin", collectionHtml(route));
      }
    }
  };
})();
