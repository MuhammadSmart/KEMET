// Builds the first-paint shell inside index.html from the app's own components,
// so it can't drift from what React renders. Used by scripts/build.mjs.
//
// The shell is what a shopper sees while main.js (~870 KB) downloads:
//   - the real header (rendered from Header in src/components.js)
//   - on the homepage, the real hero (rendered from HomePage in src/pages.js)
//   - on a product link, its photo, name and price (src/shell.js + catalog data)
//   - on a collection link, its title and breadcrumbs
// React replaces all of it on its first render.
import vm from "node:vm";
import { readFile } from "node:fs/promises";
import path from "node:path";

const FRAGMENT = Symbol("Fragment");
const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
// SVG attributes React writes in camelCase; every other camelCase SVG prop becomes kebab-case.
const SVG_KEEP_CAMEL = new Set(["viewBox", "preserveAspectRatio", "gradientUnits", "gradientTransform", "patternUnits", "patternTransform", "stdDeviation", "textLength"]);
const HTML_RENAME = { className: "class", htmlFor: "for" };

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function attrName(name, svg) {
  if (HTML_RENAME[name]) return HTML_RENAME[name];
  if (name.startsWith("aria-") || name.startsWith("data-")) return name;
  if (svg) return SVG_KEEP_CAMEL.has(name) ? name : name.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());
  return name.toLowerCase(); // tabIndex, srcSet, autoComplete, enterKeyHint ...
}

function styleString(style) {
  return Object.entries(style)
    .filter(([, v]) => v != null && v !== false)
    .map(([k, v]) => k.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase()) + ":" + v)
    .join(";");
}

// Minimal React-element-to-HTML renderer for the static shell (no state, no effects).
export function renderToString(node, svg = false) {
  if (node == null || node === false || node === true) return "";
  if (Array.isArray(node)) return node.map((n) => renderToString(n, svg)).join("");
  if (typeof node === "string" || typeof node === "number") return esc(node);
  const { type, props } = node;
  if (type === FRAGMENT) return renderToString(props.children, svg);
  if (typeof type === "function") {
    if (type.prototype && type.prototype.render) {
      const inst = new type(props);
      return renderToString(inst.render(), svg);
    }
    return renderToString(type(props), svg);
  }
  const inSvg = svg || type === "svg";
  let html = "<" + type;
  for (const [k, v] of Object.entries(props)) {
    if (k === "children" || k === "key" || k === "ref" || k.startsWith("on") && typeof v === "function") continue;
    if (v == null || v === false || typeof v === "function") continue;
    if (k === "style") { html += ` style="${esc(styleString(v))}"`; continue; }
    if (k === "dangerouslySetInnerHTML") continue;
    // Computed SVG geometry carries long decimals; one decimal is invisible at these sizes.
    const val = inSvg && typeof v === "string" ? v.replace(/-?\d+\.\d{2,}/g, (n) => String(+(+n).toFixed(1))) : inSvg && typeof v === "number" ? +v.toFixed(1) : v;
    html += val === true ? " " + attrName(k, inSvg) : ` ${attrName(k, inSvg)}="${esc(val)}"`;
  }
  html += ">";
  if (VOID.has(type)) return html;
  return html + renderToString(props.children, inSvg) + "</" + type + ">";
}

// Load the app sources with a stub React that builds plain element objects.
async function loadApp(root) {
  const read = async (p) => (await readFile(path.join(root, p), "utf8")).replace(/\r\n/g, "\n"); // CRLF-safe
  const createElement = (type, props, ...children) => ({
    type, props: Object.assign({}, props, { children: children.length <= 1 ? children[0] : children }),
  });
  const shopStub = { entries: [], totals: { qty: 0, lo: 0, hi: 0 }, add() {}, setQty() {}, clearBasket() {}, openBasket() {} };
  function Component(props) { this.props = props; this.state = {}; }
  Component.prototype.setState = function () {};
  const React = {
    createElement, Fragment: FRAGMENT, Component,
    createContext: () => ({ Provider: FRAGMENT }),
    useState: (v) => [typeof v === "function" ? v() : v, () => {}],
    useEffect() {}, useLayoutEffect() {},
    useRef: (v) => ({ current: v }), useMemo: (f) => f(), useCallback: (f) => f,
    useContext: () => shopStub, useId: () => "shell-id",
    useSyncExternalStore: (sub, get) => get(),
  };
  const sandbox = {
    require_react: () => React, require_client: () => ({}),
    window: { location: { hash: "#/" }, addEventListener() {}, removeEventListener() {}, localStorage: { getItem: () => null, setItem() {} } },
    URLSearchParams, encodeURIComponent, decodeURIComponent, console,
  };
  vm.createContext(sandbox);
  const files = ["runtime.js", "catalog.js", "lib.js", "analytics.js", "art.js", "components.js", "pages.js"];
  let code = "";
  for (const f of files) code += (await read("src/" + f)) + "\n";
  code += ";globalThis.__app = { h, Header, HomePage, Breadcrumbs, products, SECTIONS, SCENT_FAMILIES, ANALYTICS, PERFUME_SIZES, GENERIC_DESC, HERO_PHOTO, ART_BG, priceLabel, sizeInfo, sizeKeys, isSizeAvailable, defaultSize, photoAlt, toAr, productsIn };";
  vm.runInContext(code, sandbox);
  return sandbox.__app;
}

// Find the first element (depth-first, without calling components) matching a test.
function findElement(node, test) {
  if (!node || typeof node !== "object") return null;
  if (Array.isArray(node)) {
    for (const n of node) { const f = findElement(n, test); if (f) return f; }
    return null;
  }
  if (test(node)) return node;
  return findElement(node.props && node.props.children, test);
}

export async function buildShell(root) {
  const A = await loadApp(root);
  const { h } = A;

  const header = renderToString(h(A.Header, { route: { name: "shell" }, onOpenMenu() {} }));

  // Homepage: the hero section, exactly as HomePage renders it.
  const home = A.HomePage();
  const hero = findElement([].concat(home.props.children), (n) => n.type === "section" && n.props.className === "hero");
  const heroHtml = renderToString(h("main", { id: "main", className: "home" }, hero));

  // Breadcrumb markup sample, so src/shell.js can be checked against Breadcrumbs.
  const crumbSample = renderToString(h(A.Breadcrumbs, { items: [{ to: "#/", label: "الرئيسية" }, { label: "X" }] }));

  // Compact catalog data for product and collection links.
  const sizeLabels = {};
  for (const s of A.PERFUME_SIZES) sizeLabels[s.key] = s.label;
  const products = {};
  for (const p of A.products) {
    const prices = {};
    for (const k of A.sizeKeys(p)) if (A.isSizeAvailable(p, k)) prices[k] = A.priceLabel(k);
    products[p.id] = [
      p.name,
      p.section,
      p.photo ? [p.photo.w320, p.photo.w640, p.photo.jpg, A.photoAlt(p)] : 0,
      p.sized ? 1 : 0,
      p.desc === A.GENERIC_DESC ? 0 : p.desc,
      A.defaultSize(p),
      prices,
      p.character || 0,
      p.family ? (A.SCENT_FAMILIES.find((f) => f.id === p.family) || {}).title || 0 : 0,
    ];
  }
  const sections = {};
  const countLabel = (n) => A.toAr(n) + " منتج"; // same as CollectionPage
  for (const s of A.SECTIONS) sections[s.id] = [s.title, countLabel(A.productsIn(s.id).length)];
  const data = {
    products, sections, sizeLabels, total: countLabel(A.products.length),
    artBg: A.ART_BG,
  };
  const head = { hero: { mobile: A.HERO_PHOTO.mobile, desktop: A.HERO_PHOTO.desktop }, photos: {} };
  for (const p of A.products) if (p.photo) head.photos[p.id] = [p.photo.w320, p.photo.w640];
  const a = A.ANALYTICS;
  const analyticsTag = a.umamiWebsiteId
    ? `<script defer src="${esc(a.scriptSrc)}" data-website-id="${esc(a.umamiWebsiteId)}" data-auto-track="false"` +
      (a.domains ? ` data-domains="${esc(a.domains)}"` : "") + `></script>`
    : "";
  return { header, heroHtml, crumbSample, data, head, analyticsTag };
}

const between = (html, name, content) => {
  const re = new RegExp(`(<!-- build:${name} -->)[\\s\\S]*?(<!-- /build:${name} -->)`);
  if (!re.test(html)) throw new Error(`index.html is missing the <!-- build:${name} --> markers`);
  return html.replace(re, (_, a, b) => `${a}\n${content}\n${b}`);
};

// Returns index.html with the generated shell between its build markers.
export async function buildIndexHtml(root) {
  const read = async (p) => (await readFile(path.join(root, p), "utf8")).replace(/\r\n/g, "\n"); // CRLF-safe
  const shell = await buildShell(root);
  const [headJs, bodyJs] = (await read("src/shell.js")).replace(/\r\n/g, "\n").split("\n//#body\n");
  if (!bodyJs) throw new Error('src/shell.js must contain a "//#body" line');
  const headScript = headJs.replace("__SHELL_HEAD__", JSON.stringify(shell.head)).trim();
  const bodyScript = bodyJs.replace("__SHELL_DATA__", JSON.stringify(shell.data)).trim();
  let html = await read("index.html");
  html = between(html, "shell-head", `<script>\n${headScript}\n</script>`);
  html = between(html, "shell-body", [
    shell.header,
    `<template id="shell-home">${shell.heroHtml}</template>`,
    // Home first: insert the hero before the browser parses the catalog data.
    `<script>if (window.__kemetHome) { var t = document.getElementById("shell-home"); t.parentNode.insertBefore(document.importNode(t.content, true), t); }</script>`,
    `<script>\n${bodyScript}\nwindow.__kemetShell.render(document.currentScript);\n</script>`,
  ].join("\n"));
  html = between(html, "analytics", shell.analyticsTag);
  return { html, shell };
}
