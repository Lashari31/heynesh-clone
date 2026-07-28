// Name the widest-overflowing elements with a full ancestor path.
//   node _research/offender.mjs <url> [width]
import { chromium } from 'playwright';

const URL_ = process.argv[2] || 'http://localhost:5180/';
const W = Number(process.argv[3] || 1440);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: 900 }, deviceScaleFactor: 1 });
await page.goto(URL_, { waitUntil: 'networkidle', timeout: 90000 });
await page.waitForTimeout(5500);

const out = await page.evaluate(() => {
  const vw = document.documentElement.clientWidth;
  const path = (el) => {
    const bits = [];
    let n = el;
    while (n && n !== document.body && bits.length < 6) {
      const c = (typeof n.className === 'string' ? n.className : '').trim().split(/\s+/).filter(Boolean)[0];
      bits.unshift(n.tagName.toLowerCase() + (c ? '.' + c : ''));
      n = n.parentElement;
    }
    return bits.join(' > ');
  };
  const rows = [];
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    if (r.right > vw + 1) {
      const cs = getComputedStyle(el);
      rows.push({
        right: Math.round(r.right),
        left: Math.round(r.left),
        w: Math.round(r.width),
        pos: cs.position,
        overflowParent: getComputedStyle(el.parentElement).overflow,
        path: path(el),
      });
    }
  }
  rows.sort((a, b) => b.right - a.right);
  return { vw, scrollW: document.documentElement.scrollWidth, rows: rows.slice(0, 10) };
});

console.log(`viewport ${out.vw}  scrollWidth ${out.scrollW}\n`);
for (const r of out.rows) {
  console.log(`right=${r.right} left=${r.left} w=${r.w} pos=${r.pos} parentOverflow=${r.overflowParent}`);
  console.log(`   ${r.path}\n`);
}
await browser.close();
