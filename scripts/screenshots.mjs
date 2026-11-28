// Zero-dependency screenshot + timing helper using headless Edge/Chrome over the
// DevTools protocol (Node 22+ has WebSocket built in).
//
//   node scripts/screenshots.mjs <baseUrl> <outDir> [route ...]
//
// Each route is "name=hashPath", e.g. "home=#/" "collection=#/collection".
// Captures full-page PNGs at 390px (mobile) and 1440px (desktop), plus a
// throttled mobile load timing (Slow 4G-ish, 4x CPU) for the first route.
import { spawn } from "node:child_process";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const [, , baseUrl = "http://localhost:8080/", outDir = "screenshots", ...routeArgs] = process.argv;
const routes = (routeArgs.length ? routeArgs : ["home=#/"]).map((r) => {
  const [name, hash = ""] = r.split("=");
  return { name, hash };
});
const widths = (process.env.WIDTHS || "390,1440").split(",").map(Number);

const candidates = [
  process.env.BROWSER,
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);
const browserPath = candidates.find((p) => existsSync(p));
if (!browserPath) throw new Error("No Chrome/Edge found; set BROWSER=/path/to/browser");

const port = 9300 + Math.floor(Math.random() * 500);
const profile = path.join(os.tmpdir(), `kemet-shot-${port}`);
const proc = spawn(browserPath, [
  "--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
  "--no-first-run", "--hide-scrollbars", "--disable-extensions", "about:blank",
], { stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function getWsUrl() {
  for (let i = 0; i < 50; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      const page = list.find((t) => t.type === "page");
      if (page) return page.webSocketDebuggerUrl;
    } catch {}
    await sleep(200);
  }
  throw new Error("Browser did not start");
}

const ws = new WebSocket(await getWsUrl());
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
let seq = 0;
const pending = new Map();
const listeners = [];
ws.addEventListener("message", (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
  } else if (msg.method) listeners.forEach((l) => l(msg));
});
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++seq;
  pending.set(id, { resolve, reject });
  ws.send(JSON.stringify({ id, method, params }));
});
const waitEvent = (name, timeout = 15000) => new Promise((resolve) => {
  const t = setTimeout(resolve, timeout);
  listeners.push((m) => { if (m.method === name) { clearTimeout(t); resolve(m); } });
});

listeners.push((m) => {
  if (m.method === "Runtime.exceptionThrown") console.error("page error:", m.params.exceptionDetails?.exception?.description || m.params.exceptionDetails?.text);
});
await send("Page.enable");
await send("Runtime.enable");
await send("Network.enable");
await mkdir(outDir, { recursive: true });

async function load(url) {
  const loaded = waitEvent("Page.loadEventFired");
  await send("Page.navigate", { url });
  await loaded;
  await sleep(900);
}

for (const width of widths) {
  const mobile = width < 768;
  await send("Emulation.setDeviceMetricsOverride", {
    width, height: mobile ? 844 : 900, deviceScaleFactor: 1, mobile,
  });
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  for (const r of routes) {
    const t0 = Date.now();
    const step = (m) => process.env.DEBUG && console.log(`  [${width} ${r.name}] ${m} +${Date.now() - t0}ms`);
    await load("about:blank");
    await load(baseUrl + r.hash);
    step("loaded");
    // Settle lazy images: scroll through the page, then back to top.
    await send("Runtime.evaluate", {
      expression: `(async()=>{for(let y=0;y<document.body.scrollHeight;y+=600){scrollTo(0,y);await new Promise(r=>setTimeout(r,60))}scrollTo(0,0);await new Promise(r=>setTimeout(r,400))})()`,
      awaitPromise: true,
    });
    // Some layouts scroll inside an inner container; unroll it so the full page is captured.
    await send("Runtime.evaluate", {
      expression: `(()=>{const s=[...document.querySelectorAll('*')].filter(e=>e.scrollHeight>e.clientHeight+50&&/auto|scroll/.test(getComputedStyle(e).overflowY)).sort((a,b)=>b.scrollHeight-a.scrollHeight)[0];if(s&&s.scrollHeight>document.documentElement.scrollHeight){for(let e=s;e;e=e.parentElement){e.style.position='static';e.style.height='auto';e.style.maxHeight='none';e.style.overflow='visible'}}})()`,
    });
    await sleep(300);
    const { result } = await send("Runtime.evaluate", {
      expression: "Math.min(document.documentElement.scrollHeight, 16000)", returnByValue: true,
    });
    const height = result.value;
    step(`capturing ${height}px`);
    const shot = await send("Page.captureScreenshot", {
      format: "png", captureBeyondViewport: true,
      clip: { x: 0, y: 0, width, height, scale: Math.min(1, Math.sqrt(7e6 / (width * height))) },
    });
    const file = path.join(outDir, `${r.name}-${width}.png`);
    await writeFile(file, Buffer.from(shot.data, "base64"));
    console.log(`saved ${file} (${width}x${height})`);
  }
}

// Throttled mobile timing for the first route (same conditions for before/after).
if (process.env.TIMING !== "0") {
  await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await send("Network.setCacheDisabled", { cacheDisabled: true });
  await send("Network.emulateNetworkConditions", {
    offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8,
  });
  await send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await send("Page.addScriptToEvaluateOnNewDocument", {
    source: `window.__lcp=0;new PerformanceObserver(l=>{for(const e of l.getEntries())window.__lcp=e.startTime}).observe({type:'largest-contentful-paint',buffered:true});`,
  });
  await load("about:blank");
  await load(baseUrl + routes[0].hash);
  await sleep(2500);
  const { result } = await send("Runtime.evaluate", {
    returnByValue: true,
    expression: `(()=>{const n=performance.getEntriesByType('navigation')[0];const fcp=performance.getEntriesByName('first-contentful-paint')[0];const res=performance.getEntriesByType('resource');const bytes=res.reduce((s,r)=>s+(r.transferSize||0),0)+(n.transferSize||0);return {fcp:Math.round(fcp?.startTime||0),lcp:Math.round(window.__lcp),load:Math.round(n.loadEventEnd),requests:res.length+1,transferKB:Math.round(bytes/1024)}})()`,
  });
  console.log("mobile timing (150ms RTT, 1.6Mbps, 4x CPU):", JSON.stringify(result.value));
  await writeFile(path.join(outDir, "timing.json"), JSON.stringify(result.value, null, 2));
}

ws.close();
proc.kill();
await sleep(300);
await rm(profile, { recursive: true, force: true }).catch(() => {});
