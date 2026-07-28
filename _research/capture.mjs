import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

// Usage: node _research/capture.mjs <url> <label> [widths...]
const URL_ = process.argv[2] || 'https://heynesh.com/';
const LABEL = process.argv[3] || 'orig';
const WIDTHS = (process.argv[4] ? process.argv[4].split(',') : ['1440', '1024', '768', '390']).map(Number);

const OUT = path.resolve('_research', 'shots', LABEL);
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

for (const w of WIDTHS) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: w >= 1024 ? 900 : w >= 768 ? 1024 : 844 },
    deviceScaleFactor: 1,
    isMobile: w < 768,
    hasTouch: w < 768,
    userAgent:
      w < 768
        ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
        : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  });
  const page = await ctx.newPage();
  await page.goto(URL_, { waitUntil: 'networkidle', timeout: 120000 });
  await page.waitForTimeout(7000); // preloader + intro

  const vh = page.viewportSize().height;

  // total height: prefer the smooth-scroll content height if a wrapper exists
  const total = await page.evaluate(() => {
    const d = document.documentElement;
    return Math.max(d.scrollHeight, document.body.scrollHeight);
  });

  const steps = Math.ceil(total / vh);
  console.log(`[${w}] total=${total} vh=${vh} steps=${steps}`);

  const overflow = [];
  for (let i = 0; i < steps; i++) {
    const y = i * vh;
    await page.evaluate((yy) => {
      if (window.lenis) window.lenis.scrollTo(yy, { immediate: true });
      else window.scrollTo(0, yy);
      window.scrollTo(0, yy);
    }, y);
    await page.waitForTimeout(1400); // let scrub animations settle

    const info = await page.evaluate(() => ({
      sy: Math.round(window.scrollY),
      sw: document.documentElement.scrollWidth,
      iw: window.innerWidth,
    }));
    overflow.push(info);
    await page.screenshot({
      path: path.join(OUT, `${w}-${String(i).padStart(2, '0')}.png`),
    });
  }
  fs.writeFileSync(path.join(OUT, `${w}-scrollinfo.json`), JSON.stringify(overflow, null, 1));
  await ctx.close();
}

await browser.close();
console.log('captured ->', OUT);
