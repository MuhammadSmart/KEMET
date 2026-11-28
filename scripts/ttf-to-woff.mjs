// Wraps a TrueType font as WOFF 1.0 (zlib-compressed tables), with no dependencies.
// The glyphs are unchanged; only the file is smaller.
//
//   node scripts/ttf-to-woff.mjs fonts/ReemKufi-wght.ttf fonts/ReemKufi-wght.woff
import { readFileSync, writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";

const [, , input, output] = process.argv;
if (!input || !output) throw new Error("usage: node scripts/ttf-to-woff.mjs <in.ttf> <out.woff>");

const ttf = readFileSync(input);
const flavor = ttf.readUInt32BE(0);
const numTables = ttf.readUInt16BE(4);
const pad4 = (n) => (n + 3) & ~3;

const tables = [];
for (let i = 0; i < numTables; i++) {
  const rec = 12 + i * 16;
  const tag = ttf.toString("latin1", rec, rec + 4);
  const checksum = ttf.readUInt32BE(rec + 4);
  const offset = ttf.readUInt32BE(rec + 8);
  const length = ttf.readUInt32BE(rec + 12);
  const data = ttf.subarray(offset, offset + length);
  const packed = deflateSync(data, { level: 9 });
  tables.push({ tag, checksum, length, data: packed.length < length ? packed : data });
}
tables.sort((a, b) => (a.tag < b.tag ? -1 : a.tag > b.tag ? 1 : 0));

const HEADER = 44;
const DIR = 20 * numTables;
let offset = HEADER + DIR;
let totalSfntSize = 12 + 16 * numTables;
for (const t of tables) {
  t.offset = offset;
  offset += pad4(t.data.length);
  totalSfntSize += pad4(t.length);
}
const woff = Buffer.alloc(offset);
woff.write("wOFF", 0, "latin1");
woff.writeUInt32BE(flavor, 4);
woff.writeUInt32BE(woff.length, 8);
woff.writeUInt16BE(numTables, 12);
woff.writeUInt16BE(0, 14);
woff.writeUInt32BE(totalSfntSize, 16);
woff.writeUInt16BE(1, 20); // font version (informational)
woff.writeUInt16BE(0, 22);
// metadata and private blocks: none (offsets/lengths stay 0)
tables.forEach((t, i) => {
  const d = HEADER + i * 20;
  woff.write(t.tag, d, "latin1");
  woff.writeUInt32BE(t.offset, d + 4);
  woff.writeUInt32BE(t.data.length, d + 8);
  woff.writeUInt32BE(t.length, d + 12);
  woff.writeUInt32BE(t.checksum, d + 16);
  t.data.copy(woff, t.offset);
});
writeFileSync(output, woff);
console.log(`${input} ${(ttf.length / 1024).toFixed(0)} KB -> ${output} ${(woff.length / 1024).toFixed(0)} KB`);
