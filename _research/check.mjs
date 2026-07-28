// Quick single-viewport check of the local build: screenshot + console errors.
//   node _research/check.mjs [width] [scrollY] [outName]
import { chromium } from 'playwright';
import fs from 'node:fs';

const W = Number(process.argv[2] || 1440);
const Y = Number(process.argv[3] || 0);
const NAME = process.argv[4] || `check-${W}-${Y}`;
fs.mkdirSync('_research/shots/mine', { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: W, height: W >= 1024 ? 900 : W >= 768 ? 1024 : 844 },
  deviceScaleFactor: 1,
  isMobile: W < 768,
  hasTouch: W < 768,
});

const errors = [];
page.on('console', (m) => {
  if (m.type() === 'error') errors.push('CONSOLE: ' + m.text().slice(0, 300));
});
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message.slice(0, 300)));
page.on('requestfailed', (r) => errors.push('REQFAIL: ' + r.url().slice(0, 160) + ' :: ' + r.failure()?.errorText));

await page.goto('http://localhost:5180/', { waitUntil: 'networkidle', timeout: 90000 });
await page.waitForTimeout(6500);

if (Y) {
  await page.evaluate((y) => {
    if (window.lenis) window.lenis.scrollTo(y, { immediate: true });
    window.scrollTo(0, y);
  }, Y);
  await page.waitForTimeout(1500);
}

const info = await page.evaluate(() => ({
  scrollHeight: document.documentElement.scrollHeight,
  scrollWidth: document.documentElement.scrollWidth,
  innerWidth: window.innerWidth,
  bodyFont: getComputedStyle(document.body).fontFamily,
  bodySize: getComputedStyle(document.body).fontSize,
  bodyBg: getComputedStyle(document.body).backgroundColor,
  h1: (() => {
    const h = document.querySelector('.hero-heading');
    if (!h) return null;
    const c = getComputedStyle(h);
    const r = h.getBoundingClientRect();
    return { size: c.fontSize, family: c.fontFamily, color: c.color, rect: `${Math.round(r.width)}x${Math.round(r.height)} @${Math.round(r.x)},${Math.round(r.y)}` };
  })(),
  engine: typeof window.AnimationEngine,
}));

await page.screenshot({ path: `_research/shots/mine/${NAME}.png` });
console.log(JSON.stringify(info, null, 1));
console.log(errors.length ? '\n--- ERRORS ---\n' + [...new Set(errors)].slice(0, 15).join('\n') : '\nno console errors');
await browser.close();
