// Real horizontal-overflow test at every required width, for any URL.
//   node _research/overflow.mjs <url> [label]
import { chromium } from 'playwright';

const URL_ = process.argv[2] || 'http://localhost:5180/';
const LABEL = process.argv[3] || 'local';
const WIDTHS = [360, 390, 414, 430, 768, 1024, 1440];

const browser = await chromium.launch();
console.log(`\n=== ${LABEL} :: ${URL_} ===`);
console.log('width  canScrollX  scrollW  innerW  offenders');

for (const w of WIDTHS) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: w < 768 ? 844 : 900 },
    isMobile: w < 768,
    hasTouch: w < 768,
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  try {
    await page.goto(URL_, { waitUntil: 'networkidle', timeout: 90000 });
    await page.waitForTimeout(5000);

    const res = await page.evaluate(() => {
      // Does the viewport ACTUALLY pan sideways? (overflow:clip makes
      // scrollWidth report content extent while scrolling stays locked.)
      const before = window.scrollX;
      window.scrollTo(9999, window.scrollY);
      const after = window.scrollX;
      window.scrollTo(before, window.scrollY);

      const vw = document.documentElement.clientWidth;
      const bad = [];
      for (const el of document.querySelectorAll('body *')) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        if (r.right > vw + 1 || r.left < -1) {
          const cs = getComputedStyle(el);
          if (cs.position === 'fixed') continue; // fixed layers are clipped by the viewport
          bad.push(
            `${el.tagName.toLowerCase()}.${(typeof el.className === 'string' ? el.className : '').trim().split(/\s+/)[0] || '?'}` +
              `[${Math.round(r.left)}..${Math.round(r.right)}]`
          );
        }
      }
      return {
        canScrollX: after !== before,
        scrollW: document.documentElement.scrollWidth,
        innerW: window.innerWidth,
        offenders: [...new Set(bad)].slice(0, 6),
      };
    });

    console.log(
      String(w).padEnd(7),
      String(res.canScrollX).padEnd(11),
      String(res.scrollW).padEnd(8),
      String(res.innerW).padEnd(7),
      res.offenders.length ? res.offenders.join(' ') : '-'
    );
  } catch (e) {
    console.log(String(w).padEnd(7), 'ERROR', e.message.slice(0, 80));
  }
  await ctx.close();
}
await browser.close();
