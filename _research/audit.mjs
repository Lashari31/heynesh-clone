import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.resolve('_research');
const SITE = 'https://heynesh.com/';
const ensure = (p) => fs.mkdirSync(p, { recursive: true });
ensure(path.join(OUT, 'shots'));
ensure(path.join(OUT, 'data'));

const network = [];

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
});
const page = await ctx.newPage();

page.on('response', (res) => {
  const u = res.url();
  const t = res.request().resourceType();
  if (['image', 'font', 'media', 'stylesheet', 'script'].includes(t)) {
    network.push({ type: t, url: u, status: res.status() });
  }
});

console.log('loading...');
await page.goto(SITE, { waitUntil: 'networkidle', timeout: 90000 });
await page.waitForTimeout(6000); // let preloader finish

// ---------------------------------------------------------------- DOM outline
const outline = await page.evaluate(() => {
  const skip = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'LINK', 'META']);
  const lines = [];
  const walk = (el, depth) => {
    if (depth > 7) return;
    if (skip.has(el.tagName)) return;
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const cls = (el.className && typeof el.className === 'string' ? el.className : '')
      .trim().split(/\s+/).filter(Boolean).slice(0, 6).join('.');
    const own = Array.from(el.childNodes)
      .filter((n) => n.nodeType === 3 && n.textContent.trim())
      .map((n) => n.textContent.trim().replace(/\s+/g, ' '))
      .join(' ')
      .slice(0, 120);
    lines.push(
      `${'  '.repeat(depth)}<${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${cls ? '.' + cls : ''}> ` +
        `[${Math.round(r.width)}x${Math.round(r.height)} @${Math.round(r.left)},${Math.round(r.top + scrollY)}] ` +
        `disp:${cs.display} pos:${cs.position}` +
        (own ? ` TEXT:"${own}"` : '')
    );
    for (const c of el.children) walk(c, depth + 1);
  };
  walk(document.body, 0);
  return lines.join('\n');
});
fs.writeFileSync(path.join(OUT, 'data', 'dom-outline.txt'), outline);

// ------------------------------------------------------------- computed styles
const styles = await page.evaluate(() => {
  const props = [
    'display', 'position', 'width', 'height', 'maxWidth', 'minHeight',
    'margin', 'padding', 'fontFamily', 'fontSize', 'fontWeight', 'fontStyle',
    'lineHeight', 'letterSpacing', 'textTransform', 'color', 'backgroundColor',
    'backgroundImage', 'borderRadius', 'border', 'boxShadow', 'opacity',
    'transform', 'mixBlendMode', 'backdropFilter', 'zIndex', 'overflow',
    'gap', 'flexDirection', 'justifyContent', 'alignItems', 'gridTemplateColumns',
    'textAlign', 'objectFit', 'filter', 'writingMode',
  ];
  const out = [];
  const all = document.querySelectorAll('body *');
  for (const el of all) {
    if (['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(el.tagName)) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    const cs = getComputedStyle(el);
    const rec = {
      tag: el.tagName.toLowerCase(),
      id: el.id || undefined,
      cls: (typeof el.className === 'string' ? el.className : '') || undefined,
      rect: { w: +r.width.toFixed(1), h: +r.height.toFixed(1), x: +r.left.toFixed(1), y: +(r.top + scrollY).toFixed(1) },
      text: (el.children.length === 0 ? el.textContent.trim().slice(0, 160) : '') || undefined,
    };
    const s = {};
    for (const p of props) {
      const v = cs[p];
      if (v && v !== 'none' && v !== 'normal' && v !== 'auto' && v !== '0px' && v !== 'rgba(0, 0, 0, 0)') s[p] = v;
    }
    rec.css = s;
    out.push(rec);
  }
  return out;
});
fs.writeFileSync(path.join(OUT, 'data', 'computed-1440.json'), JSON.stringify(styles, null, 1));

// -------------------------------------------------------------------- palette
const palette = await page.evaluate(() => {
  const counts = {};
  const bump = (k, w = 1) => { if (k && !/^rgba\(0, 0, 0, 0\)$/.test(k)) counts[k] = (counts[k] || 0) + w; };
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    bump(cs.color);
    bump(cs.backgroundColor, Math.max(1, Math.round((r.width * r.height) / 20000)));
    if (cs.borderTopColor && cs.borderTopWidth !== '0px') bump(cs.borderTopColor);
  }
  bump(getComputedStyle(document.body).backgroundColor, 500);
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 40);
});

// ---------------------------------------------------------------------- fonts
const fonts = await page.evaluate(() => {
  const faces = [];
  for (const ss of document.styleSheets) {
    let rules;
    try { rules = ss.cssRules; } catch { continue; }
    if (!rules) continue;
    for (const r of rules) {
      if (r.constructor.name === 'CSSFontFaceRule' || r.type === 5) {
        faces.push({
          family: r.style.fontFamily,
          weight: r.style.fontWeight,
          style: r.style.fontStyle,
          src: r.style.src,
        });
      }
    }
  }
  const used = {};
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    if (el.textContent && el.textContent.trim() && el.children.length === 0) {
      const k = `${cs.fontFamily} | ${cs.fontWeight} | ${cs.fontSize} | ${cs.letterSpacing} | ${cs.lineHeight}`;
      used[k] = (used[k] || 0) + 1;
    }
  }
  return { faces, used: Object.entries(used).sort((a, b) => b[1] - a[1]) };
});

// --------------------------------------------------------------- page metrics
const metrics = await page.evaluate(() => ({
  scrollHeight: document.documentElement.scrollHeight,
  bodyScrollHeight: document.body.scrollHeight,
  bodyBg: getComputedStyle(document.body).backgroundColor,
  htmlBg: getComputedStyle(document.documentElement).backgroundColor,
  title: document.title,
  sections: Array.from(document.querySelectorAll('section, [data-section], main > div, .section, [class*="section"]')).map((el) => {
    const r = el.getBoundingClientRect();
    return {
      tag: el.tagName.toLowerCase(),
      cls: typeof el.className === 'string' ? el.className : '',
      y: Math.round(r.top + scrollY),
      h: Math.round(r.height),
      bg: getComputedStyle(el).backgroundColor,
    };
  }),
}));

fs.writeFileSync(
  path.join(OUT, 'data', 'meta.json'),
  JSON.stringify({ palette, fonts, metrics, network: [...new Set(network.map((n) => n.type + ' ' + n.url))].sort() }, null, 1)
);

// ------------------------------------------------------------------ screenshot
await page.screenshot({ path: path.join(OUT, 'shots', 'orig-1440-top.png') });
console.log('scrollHeight', metrics.scrollHeight);

await browser.close();
console.log('done');
