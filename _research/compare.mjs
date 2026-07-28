// Pixel-diff my captured frames against the original's, frame by frame.
//   node _research/compare.mjs [width]
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const W = process.argv[2] || '1440';
const A = path.resolve('_research/shots/orig');
const B = path.resolve('_research/shots/mine');
const D = path.resolve('_research/shots/diff');
fs.mkdirSync(D, { recursive: true });

const frames = fs
  .readdirSync(A)
  .filter((f) => f.startsWith(W + '-') && f.endsWith('.png'))
  .sort();

console.log(`frame   diff%     notes`);
const rows = [];
for (const f of frames) {
  const pa = path.join(A, f);
  const pb = path.join(B, f);
  if (!fs.existsSync(pb)) {
    console.log(`${f.padEnd(14)} --       MISSING in build`);
    continue;
  }
  const ia = PNG.sync.read(fs.readFileSync(pa));
  const ib = PNG.sync.read(fs.readFileSync(pb));
  if (ia.width !== ib.width || ia.height !== ib.height) {
    console.log(`${f.padEnd(14)} --       size ${ia.width}x${ia.height} vs ${ib.width}x${ib.height}`);
    continue;
  }
  const out = new PNG({ width: ia.width, height: ia.height });
  const n = pixelmatch(ia.data, ib.data, out.data, ia.width, ia.height, { threshold: 0.12 });
  const pct = (100 * n) / (ia.width * ia.height);
  fs.writeFileSync(path.join(D, f), PNG.sync.write(out));
  rows.push({ f, pct });
  console.log(`${f.padEnd(14)} ${pct.toFixed(2).padStart(6)}%`);
}
rows.sort((a, b) => b.pct - a.pct);
console.log('\nWORST FRAMES:');
rows.slice(0, 6).forEach((r) => console.log(`  ${r.f}  ${r.pct.toFixed(2)}%`));
const avg = rows.reduce((s, r) => s + r.pct, 0) / (rows.length || 1);
console.log(`\nmean diff ${avg.toFixed(2)}%  over ${rows.length} frames`);
