// Scroll all the way down, then back up through the same stops, and compare
// each upward frame with the downward frame at the same depth. Any difference
// means a scrubbed timeline did not reverse cleanly.
//   node _research/reverse.mjs <url> <label> [width]
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import pixelmatchImport from 'pixelmatch';
const pixelmatch = pixelmatchImport.default || pixelmatchImport;

const URL_ = process.argv[2] || 'http://localhost:5180/';
const LABEL = process.argv[3] || 'mine';
const W = Number(process.argv[4] || 1440);
const H = W < 768 ? 844 : 900;
const DIR = `_research/shots/rev-${LABEL}-${W}`;
fs.mkdirSync(DIR, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: W, height: H },
  deviceScaleFactor: 1,
  isMobile: W < 768,
  hasTouch: W < 768,
});
await page.goto(URL_, { waitUntil: 'networkidle', timeout: 120000 });
await page.waitForTimeout(7000);

const total = await page.evaluate(() => document.documentElement.scrollHeight);
const maxY = total - H;
const stops = [];
for (let i = 0; i <= 8; i++) stops.push(Math.round((maxY * i) / 8));

const go = async (y) => {
  await page.evaluate((yy) => {
    if (window.lenis) window.lenis.scrollTo(yy, { immediate: true });
    window.scrollTo(0, yy);
  }, y);
  await page.waitForTimeout(1400);
};

// pass 1: downward
for (const y of stops) {
  await go(y);
  await page.screenshot({ path: path.join(DIR, `down-${y}.png`) });
}
// pass 2: upward through the same stops
for (const y of [...stops].reverse()) {
  await go(y);
  await page.screenshot({ path: path.join(DIR, `up-${y}.png`) });
}
await browser.close();

console.log(`reverse-scroll check :: ${LABEL} @${W}  (total ${total})`);
let worst = 0;
for (const y of stops) {
  const a = PNG.sync.read(fs.readFileSync(path.join(DIR, `down-${y}.png`)));
  const b = PNG.sync.read(fs.readFileSync(path.join(DIR, `up-${y}.png`)));
  const out = new PNG({ width: a.width, height: a.height });
  const d = pixelmatch(a.data, b.data, out.data, a.width, a.height, { threshold: 0.12 });
  const pct = (100 * d) / (a.width * a.height);
  worst = Math.max(worst, pct);
  fs.writeFileSync(path.join(DIR, `diff-${y}.png`), PNG.sync.write(out));
  console.log(`  y=${String(y).padStart(6)}  down vs up: ${pct.toFixed(2)}%`);
}
console.log(`  worst ${worst.toFixed(2)}%`);
