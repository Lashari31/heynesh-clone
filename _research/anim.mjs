// Sample the signature morph mid-flight on both sites and compare the
// measured state of the Flip'd elements at identical scroll depths.
//   node _research/anim.mjs <url> <label>
import { chromium } from 'playwright';
import fs from 'node:fs';

const URL_ = process.argv[2];
const LABEL = process.argv[3];
const OUT = `_research/shots/anim-${LABEL}`;
fs.mkdirSync(OUT, { recursive: true });

// hero is 2700 tall; the logo morph runs top->44%, links/cards inside that.
const STOPS = [0, 150, 300, 450, 600, 900, 1200, 1600];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await page.goto(URL_, { waitUntil: 'networkidle', timeout: 90000 });
await page.waitForTimeout(6500);

const rows = [];
for (const y of STOPS) {
  await page.evaluate((yy) => {
    if (window.lenis) window.lenis.scrollTo(yy, { immediate: true });
    window.scrollTo(0, yy);
  }, y);
  await page.waitForTimeout(1200);

  const m = await page.evaluate(() => {
    const pick = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return {
        x: Math.round(r.x),
        y: Math.round(r.y),
        w: Math.round(r.width),
        h: Math.round(r.height),
        op: (+cs.opacity).toFixed(2),
      };
    };
    return {
      scrollY: Math.round(window.scrollY),
      logo: pick('.nesh-logo-ghost'),
      navLogo: pick('.nav-logo-item'),
      heroLinks: pick('.hero-links-ghost-wrapper'),
      navMenu: pick('.nav-menu'),
      card2: pick('.hero-card-2'),
      statsCard: pick('.nav-stats-wrap'),
      profile: pick('.hero-profile-img'),
      heroHeading: pick('.hero-heading'),
    };
  });
  rows.push(m);
  await page.screenshot({ path: `${OUT}/y${String(y).padStart(4, '0')}.png` });
}

fs.writeFileSync(`_research/data/anim-${LABEL}.json`, JSON.stringify(rows, null, 1));
for (const r of rows) {
  console.log(
    `y=${String(r.scrollY).padStart(4)} logo:${JSON.stringify(r.logo)} links:${JSON.stringify(r.heroLinks)} card2:${JSON.stringify(r.card2)}`
  );
}
await browser.close();
