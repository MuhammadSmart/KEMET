// Tiny zero-dependency static server for local preview: node scripts/serve.mjs [port] [dir]
import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const port = Number(process.argv[2] || 8080);
const root = path.resolve(process.argv[3] || ".");
const types = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".jpg": "image/jpeg", ".webp": "image/webp",
  ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2",
  ".ttf": "font/ttf", ".otf": "font/otf", ".woff": "font/woff", ".json": "application/json", ".ico": "image/x-icon",
  ".webmanifest": "application/manifest+json",
};

http.createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    let file = path.join(root, p);
    if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
    if ((await stat(file).catch(() => null))?.isDirectory()) file = path.join(file, "index.html");
    const body = await readFile(file);
    res.writeHead(200, { "content-type": types[path.extname(file)] || "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404, { "content-type": "text/plain" }).end("Not found");
  }
}).listen(port, () => console.log(`Serving ${root} on http://localhost:${port}`));
