// ===== src/art.js =====
// Brand drawings: the winged-ankh emblem (from the original site), product
// drawings for items without photos, the chevron-to-wave divider, lotus motif, icons.

var ART_BG = "#13285f"; // deep cobalt tile behind drawn products
var ART_GLOW = "#2a4ea6";

function Emblem(props) {
  var width = props.width || 150;
  var cx = 130, cy = 58, loopR = 22, armY = cy + loopR + 7, span = 70;
  var rows = [
    { n: 8, a0: -9, a1: -42, l0: 0.68, l1: 1, dy: 0 },
    { n: 7, a0: -7, a1: -30, l0: 0.5, l1: 0.74, dy: 9 },
    { n: 5, a0: -5, a1: -20, l0: 0.33, l1: 0.5, dy: 17 }
  ];
  var gid = props.gradientId || "kemetGoldH";
  var wing = function (prefix) {
    var items = [];
    rows.forEach(function (row, ri) {
      for (var j = 0; j < row.n; j++) {
        var t = j / (row.n - 1);
        var ang = row.a0 + Math.pow(t, 1.25) * (row.a1 - row.a0);
        var len = span * (row.l0 + t * (row.l1 - row.l0));
        var w = len * 0.085;
        var a = ang * Math.PI / 180;
        var bx = cx + 11 + j * 5;
        var by = armY + row.dy + j * 2.8;
        var tipx = bx + Math.cos(a) * len, tipy = by + Math.sin(a) * len;
        var nx = -Math.sin(a), ny = Math.cos(a);
        var c1x = bx + Math.cos(a) * len * 0.42 + nx * w, c1y = by + Math.sin(a) * len * 0.42 + ny * w;
        var c2x = bx + Math.cos(a) * len * 0.6 - nx * w * 0.55, c2y = by + Math.sin(a) * len * 0.6 - ny * w * 0.55;
        items.push(h("path", {
          key: prefix + "-" + ri + "-" + j,
          d: "M " + bx + " " + by + " Q " + c1x + " " + c1y + " " + tipx + " " + tipy + " Q " + c2x + " " + c2y + " " + bx + " " + by + " Z",
          fill: "url(#" + gid + ")", stroke: "#9a7418", strokeWidth: "1"
        }));
      }
    });
    return items;
  };
  var dots = [];
  for (var i = 0; i < 12; i++) {
    var a = i * 30 * Math.PI / 180;
    dots.push(h("circle", { key: i, cx: cx + Math.cos(a) * loopR, cy: cy + Math.sin(a) * loopR, r: "1.9", fill: "#f2d878" }));
  }
  return h("svg", {
    width: width, height: width * 0.68, x: props.x, y: props.y, viewBox: "0 0 260 177",
    xmlns: "http://www.w3.org/2000/svg", "aria-hidden": "true", focusable: "false", className: props.className
  },
    h("defs", null, h("linearGradient", { id: gid, x1: "0", y1: "0", x2: "0", y2: "1" },
      h("stop", { offset: "0", stopColor: "#e9c96a" }),
      h("stop", { offset: "0.55", stopColor: "#c79a2e" }),
      h("stop", { offset: "1", stopColor: "#8a6514" }))),
    h("g", null, wing("r")),
    h("g", { transform: "translate(" + 2 * cx + ",0) scale(-1,1)" }, wing("l")),
    h("circle", { cx: cx, cy: cy, r: loopR, fill: "none", stroke: "#b8902f", strokeWidth: "6" }),
    dots,
    h("g", { stroke: "#b8902f", fill: "none", strokeWidth: "6", strokeLinecap: "round" },
      h("line", { x1: cx - 15, y1: armY, x2: cx + 15, y2: armY }),
      h("line", { x1: cx, y1: armY + 2, x2: cx, y2: armY + 46 })),
    h("path", { d: "M " + (cx - 4) + " " + (armY + 46) + " L " + (cx - 8) + " " + (armY + 64) + " L " + (cx + 8) + " " + (armY + 64) + " L " + (cx + 4) + " " + (armY + 46) + " Z", fill: "url(#" + gid + ")" })
  );
}

function ArtDefs(props) {
  var id = props.id;
  return h("defs", null,
    h("radialGradient", { id: id + "Glow", cx: "0.5", cy: "0.32", r: "0.8" },
      h("stop", { offset: "0", stopColor: ART_GLOW, stopOpacity: "0.9" }),
      h("stop", { offset: "1", stopColor: ART_BG, stopOpacity: "0" })),
    h("linearGradient", { id: id + "Gold", x1: "0", y1: "0", x2: "0", y2: "1" },
      h("stop", { offset: "0", stopColor: "#f2d878" }),
      h("stop", { offset: "0.55", stopColor: "#d4af37" }),
      h("stop", { offset: "1", stopColor: "#9a7418" })),
    h("linearGradient", { id: id + "Band", x1: "0", y1: "0", x2: "0", y2: "1" },
      h("stop", { offset: "0", stopColor: props.band, stopOpacity: "0.3" }),
      h("stop", { offset: "1", stopColor: props.band, stopOpacity: "0.12" })));
}

function artFrame(id, label, band, children) {
  return h("svg", { viewBox: "0 0 300 375", className: "product-art", role: label ? "img" : undefined, "aria-label": label || undefined, "aria-hidden": label ? undefined : "true", xmlns: "http://www.w3.org/2000/svg" },
    h(ArtDefs, { id: id, band: band }),
    h("rect", { width: "300", height: "375", fill: ART_BG }),
    h("rect", { width: "300", height: "375", fill: "url(#" + id + "Glow)" }),
    children);
}

var PERFUME_DIMS = {
  body: { x: 96, y: 132, w: 108, h: 182, rx: 14 },
  cap: { x: 124, y: 60, w: 52, h: 56, rx: 6 },
  neck: { x: 137, y: 114, w: 26, h: 20 },
  lbl: { x: 106, y: 192, w: 88, h: 88 }
};

function PerfumeArt(props) {
  var id = props.id, d = PERFUME_DIMS, body = d.body, cap = d.cap, neck = d.neck, lbl = d.lbl;
  return artFrame(id, props.label, "#d4af37", [
    h("g", { key: "b", stroke: "#d4af37", strokeWidth: "2.5", fill: "#0f1f4a", strokeLinejoin: "round" },
      h("rect", { x: body.x, y: body.y, width: body.w, height: body.h, rx: body.rx }),
      h("rect", { x: neck.x, y: neck.y, width: neck.w, height: neck.h })),
    h("rect", { key: "c", x: cap.x, y: cap.y, width: cap.w, height: cap.h, rx: cap.rx, fill: "url(#" + id + "Gold)", stroke: "#9a7418", strokeWidth: "1.5" }),
    h("rect", { key: "l", x: lbl.x, y: lbl.y, width: lbl.w, height: lbl.h, rx: "8", fill: "#0b1838", stroke: "#8a6a2a", strokeWidth: "1.5" }),
    h(Emblem, { key: "e", width: 50, x: lbl.x + (lbl.w - 50) / 2, y: lbl.y + 6, gradientId: id + "Em" }),
    h("text", { key: "n", x: "150", y: lbl.y + lbl.h - 14, textAnchor: "middle", fontSize: "12", fill: "#f0d98a" }, props.name),
    h("text", { key: "t", x: "150", y: body.y + body.h + 28, textAnchor: "middle", fontSize: "9", letterSpacing: "3", fill: "#c9b98a" }, "EAU DE PARFUM")
  ]);
}

function LotionArt(props) {
  var id = props.id, accent = props.accent;
  var short = props.name.replace(/^بودي لوشن /, "");
  var body = { x: 104, y: 102, w: 92, h: 202, rx: 18 };
  var band = { x: body.x, y: 146, w: body.w, h: 86 };
  return artFrame(id, props.label, accent, [
    h("g", { key: "p", fill: "url(#" + id + "Gold)", stroke: "#9a7418", strokeWidth: "1.5", strokeLinejoin: "round" },
      h("rect", { x: "102", y: "46", width: "44", height: "13", rx: "6.5" }),
      h("rect", { x: "140", y: "54", width: "12", height: "12" }),
      h("rect", { x: "142", y: "64", width: "16", height: "24", rx: "2" }),
      h("rect", { x: "130", y: "86", width: "40", height: "16", rx: "3" })),
    h("rect", { key: "b", x: body.x, y: body.y, width: body.w, height: body.h, rx: body.rx, fill: "#0f1f4a", stroke: "#d4af37", strokeWidth: "2.5" }),
    h("rect", { key: "band", x: band.x, y: band.y, width: band.w, height: band.h, fill: "url(#" + id + "Band)", stroke: accent, strokeWidth: "1.5" }),
    h(Emblem, { key: "e", width: 36, x: band.x + (band.w - 36) / 2, y: band.y + 5, gradientId: id + "Em" }),
    h("text", { key: "k", x: "150", y: band.y + 55, textAnchor: "middle", fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "11", letterSpacing: "1.6", fill: "#f0d98a" }, "KEMET"),
    h("text", { key: "n", x: "150", y: band.y + 72, textAnchor: "middle", fontSize: "11", fill: "#f6ecd2" }, short),
    h("text", { key: "t", x: "150", y: body.y + body.h + 26, textAnchor: "middle", fontSize: "9", letterSpacing: "3", fill: "#c9b98a" }, "BODY LOTION")
  ]);
}

var SHAPE_DIMS = {
  musk: { body: { x: 96, y: 160, w: 108, h: 130, rx: 44 }, band: { x: 96, y: 198, w: 108, h: 66 }, sub: "MUSK" },
  freshener: { body: { x: 104, y: 150, w: 92, h: 152, rx: 14 }, band: { x: 104, y: 200, w: 92, h: 66 }, sub: "AIR FRESHENER" },
  makhmaria: { body: { x: 94, y: 182, w: 112, h: 106, rx: 44 }, band: { x: 94, y: 206, w: 112, h: 64 }, sub: "MAKHMARIA" },
  splash: { body: { x: 112, y: 120, w: 76, h: 190, rx: 22 }, band: { x: 112, y: 182, w: 76, h: 74 }, sub: "BODY SPLASH" }
};

function ShapeArt(props) {
  var id = props.id, accent = props.accent, shape = props.shape;
  var d = SHAPE_DIMS[shape], body = d.body, band = d.band;
  var groundY = body.y + body.h + 8;
  var gold = { fill: "url(#" + id + "Gold)", stroke: "#9a7418", strokeWidth: "1.5", strokeLinejoin: "round" };
  var top = null;
  if (shape === "musk") top = h("g", Object.assign({ key: "top" }, gold), h("rect", { x: "112", y: "132", width: "76", height: "26", rx: "12" }), h("circle", { cx: "150", cy: "124", r: "7" }));
  if (shape === "freshener") top = h("g", Object.assign({ key: "top" }, gold), h("rect", { x: "118", y: "100", width: "64", height: "26", rx: "8" }), h("rect", { x: "180", y: "106", width: "12", height: "9", rx: "2" }), h("rect", { x: "140", y: "126", width: "20", height: "24" }));
  if (shape === "makhmaria") top = h("g", Object.assign({ key: "top" }, gold), h("path", { d: "M 104 184 Q 150 132 196 184 Z" }), h("circle", { cx: "150", cy: "150", r: "6" }));
  if (shape === "splash") top = h("g", Object.assign({ key: "top" }, gold), h("rect", { x: "128", y: "78", width: "44", height: "34", rx: "9" }), h("rect", { x: "140", y: "112", width: "20", height: "10" }));
  return artFrame(id, props.label, accent, [
    top,
    h("rect", { key: "b", x: body.x, y: body.y, width: body.w, height: body.h, rx: body.rx, fill: "#0f1f4a", stroke: "#d4af37", strokeWidth: "2.5" }),
    h("rect", { key: "band", x: band.x, y: band.y, width: band.w, height: band.h, fill: "url(#" + id + "Band)", stroke: accent, strokeWidth: "1.5" }),
    h(Emblem, { key: "e", width: 36, x: band.x + (band.w - 36) / 2, y: band.y + 5, gradientId: id + "Em" }),
    h("text", { key: "n", x: "150", y: band.y + band.h - 12, textAnchor: "middle", fontSize: "11", fill: "#f6ecd2" }, props.name),
    h("text", { key: "t", x: "150", y: groundY + 18, textAnchor: "middle", fontSize: "9", letterSpacing: "3", fill: "#c9b98a" }, d.sub)
  ]);
}

function ProductArt(props) {
  var p = props.product, label = props.label;
  if (p.art.kind === "perfume") return h(PerfumeArt, { id: "kp-" + p.id + props.suffix, name: p.name, label: label });
  if (p.art.kind === "lotion") return h(LotionArt, { id: "kl-" + p.id + props.suffix, name: p.name, accent: p.art.accent, label: label });
  return h(ShapeArt, { id: "ks-" + p.id + props.suffix, shape: p.art.shape, name: p.name, accent: p.art.accent, label: label });
}

// ---- Chevron-to-wave divider --------------------------------------------
// Sharp chevrons at the start of the line soften into a wave at the end,
// after the zigzag and festoon trails on New Kingdom core-formed glass.
var WAVE_PATH = (function () {
  var W = 1200, n = 48, steps = 10, mid = 8, amp = 5;
  var pts = [];
  for (var i = 0; i < n; i++) {
    var t = Math.pow(i / (n - 1), 1.3);
    for (var k = 0; k < steps; k++) {
      var ph = k / steps;
      var tri = ph < 0.5 ? 1 - 4 * ph : -3 + 4 * ph; // 1 → -1 → 1
      var sin = Math.cos(ph * 2 * Math.PI);
      var y = mid - amp * ((1 - t) * tri + t * sin);
      pts.push(((i + ph) * W / n).toFixed(1) + " " + y.toFixed(2));
    }
  }
  pts.push(W + " " + (mid - amp));
  return "M " + pts.join(" L ");
})();

function Divider(props) {
  return h("div", { className: "divider" + (props.tone ? " divider-" + props.tone : ""), "aria-hidden": "true" },
    h("svg", { viewBox: "0 0 1200 16", preserveAspectRatio: "none", focusable: "false" },
      h("path", { d: WAVE_PATH, fill: "none", stroke: "currentColor", strokeWidth: "1.25", vectorEffect: "non-scaling-stroke" })));
}

function Lotus(props) {
  return h("svg", { width: props.size || 28, height: props.size || 28, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.4, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", focusable: "false", className: props.className },
    h("path", { d: "M12 19 C10 13.5 10 9 12 4.5 C14 9 14 13.5 12 19 Z" }),
    h("path", { d: "M12 19 C8 16 5.5 13 4.5 8.5 C8.5 10 11 13.5 12 19 Z" }),
    h("path", { d: "M12 19 C16 16 18.5 13 19.5 8.5 C15.5 10 13 13.5 12 19 Z" }),
    h("path", { d: "M7.5 20.5 H16.5" }));
}

function Icon(props) {
  var paths = {
    menu: "M4 7h16M4 12h16M4 17h16",
    close: "M6 6l12 12M18 6L6 18",
    bag: "M6 8h12l-1 12H7L6 8zM9 8V6a3 3 0 0 1 6 0v2",
    search: "M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14zM20 20l-4-4",
    chat: "M5 18l1.2-3.6A7 7 0 1 1 9 17.6L5 18z",
    check: "M5 12.5l4.5 4.5L19 7.5",
    chevron: "M14 6l-6 6 6 6",
    plus: "M12 5v14M5 12h14",
    minus: "M5 12h14",
    truck: "M3 7h11v9H3zM14 10h4l3 3v3h-7M7 19a1.6 1.6 0 1 0 0-3.2A1.6 1.6 0 0 0 7 19zM17 19a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2z",
    info: "M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18zM12 11v5M12 8h.01",
    swap: "M7 7h11l-3-3M17 17H6l3 3"
  };
  return h("svg", { width: props.size || 22, height: props.size || 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: props.stroke || 1.7, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", focusable: "false", className: "icon" + (props.className ? " " + props.className : "") },
    h("path", { d: paths[props.name] }));
}
