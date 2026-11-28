// ===== src/analytics.js =====
// Visitor statistics with Umami (https://umami.is): no cookies, no personal data.
//
// To turn it on: create a website in Umami, paste its Website ID below, then run
// node scripts/build.mjs. Empty ID = off (no script is loaded, nothing is sent).
var ANALYTICS = {
  umamiWebsiteId: "4c20f53f-8f9d-4c04-9d7e-155e7615d18c",
  scriptSrc: "https://cloud.umami.is/script.js",
  // Only the published site is counted, not local previews.
  domains: "muhammadsmart.github.io"
};

// What gets recorded (see README "Visitor statistics"):
//   page views          one per page, e.g. /p/w-hams, /collection/men (no search text, no size)
//   add-to-basket       product, size, quantity
//   open-basket
//   search              the search words (first 40 characters) and how many results
//   whatsapp-order      the order button in the basket or on a product page, with totals
//   whatsapp-question   any other WhatsApp button, with its topic and page
// Never sent: names, phone numbers, the WhatsApp message itself.

var analyticsQueue = [];
var analyticsTimer = null;
var analyticsLastUrl = null;

function analyticsOn() {
  return !!ANALYTICS.umamiWebsiteId;
}
function analyticsReady() {
  return typeof window.umami === "object" && window.umami !== null && typeof window.umami.track === "function";
}
function flushAnalytics() {
  if (!analyticsReady()) return false;
  while (analyticsQueue.length) {
    var send = analyticsQueue.shift();
    try { send(window.umami); } catch (e) { /* statistics must never break the shop */ }
  }
  return true;
}
// The Umami script loads after the app starts, so early calls wait in a queue.
function enqueueAnalytics(send) {
  if (!analyticsOn()) return;
  analyticsQueue.push(send);
  if (flushAnalytics() || analyticsTimer) return;
  var tries = 0;
  analyticsTimer = setInterval(function () {
    tries++;
    if (flushAnalytics() || tries > 40) { // give up after ~20 s (blocked by an ad blocker, offline...)
      clearInterval(analyticsTimer);
      analyticsTimer = null;
      if (tries > 40) analyticsQueue.length = 0;
    }
  }, 500);
}

// "#/p/w-hams?size=s30" -> "/p/w-hams"; "#/collection?q=..&family=floral" -> "/collection?family=floral".
// Search text and sizes stay out of page URLs (search has its own event).
function analyticsUrl(hash) {
  var raw = (hash || "").replace(/^#/, "");
  var split = raw.split("?");
  var path = split[0] || "/";
  var legacy = path.match(/^sec-([a-z]+)$/);
  if (legacy) path = "/collection/" + legacy[1];
  if (path.charAt(0) !== "/") path = "/" + path;
  var params = new URLSearchParams(split[1] || "");
  var keep = new URLSearchParams();
  if (params.get("family")) keep.set("family", params.get("family"));
  if (params.get("s")) keep.set("s", params.get("s"));
  var qs = keep.toString();
  return path + (qs ? "?" + qs : "");
}

function trackPage(hash, title) {
  var url = analyticsUrl(hash);
  var previous = analyticsLastUrl;
  analyticsLastUrl = url;
  enqueueAnalytics(function (umami) {
    umami.track(function (props) {
      var next = Object.assign({}, props, { url: url, title: title });
      // After the first page, the "referrer" is our own previous page, not the
      // site the visitor came from, so Umami counts the source only once.
      if (previous) next.referrer = location.origin + location.pathname + "#" + previous;
      return next;
    });
  });
}

function trackEvent(name, data) {
  enqueueAnalytics(function (umami) { umami.track(name, data); });
}
