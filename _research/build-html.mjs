// Port the original body markup into a clean index.html:
//  - drop Webflow/CDN script + style tags (we supply our own CSS/JS)
//  - rewrite every CDN asset URL to the local copy
//  - drop srcset entries we did not download
//  - strip the Webflow badge + editor hooks
import fs from 'node:fs';
import path from 'node:path';
import { slugFor } from './slug.mjs';

const src = fs.readFileSync('_research/raw/home.pretty.html', 'utf8');
const map = JSON.parse(fs.readFileSync('_research/data/asset-map.json', 'utf8'));
const have = new Set(fs.readdirSync('public/assets/img'));

// --- isolate <body> ---------------------------------------------------------
let body = src.slice(src.indexOf('<body>') + 6, src.lastIndexOf('</body>'));

// --- remove all <script> and <style> blocks ---------------------------------
body = body.replace(/<script[\s\S]*?<\/script>/g, '');
body = body.replace(/<style[\s\S]*?<\/style>/g, '');

// --- localise asset urls ----------------------------------------------------
const localFor = (url) => {
  const clean = url.trim().replace(/&amp;/g, '&');
  if (map[clean] && have.has(map[clean])) return '/assets/img/' + map[clean];
  // try matching by filename slug (covers srcset variants of a known asset)
  const base = slugFor(clean);
  if (have.has(base)) return '/assets/img/' + base;
  return null;
};

// src="..." and poster="..."  (filenames may contain parentheses, so match to the quote)
body = body.replace(/(src|poster)="(https:\/\/cdn\.prod\.website-files\.com\/[^"]+)"/g, (m, attr, u) => {
  const l = localFor(u);
  return l ? `${attr}="${l}"` : m;
});

// --- videos -----------------------------------------------------------------
const vmap = JSON.parse(fs.readFileSync('_research/data/video-map.json', 'utf8'));
const vslug = (u) =>
  decodeURIComponent(u.split('/').pop())
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
// background video: absolute url in data-src
body = body.replace(/data-src="(https:\/\/f1-assets\.b-cdn\.net\/[^"]+)"/g, (m, u) =>
  vmap[u] ? `data-src="/assets/video/${vmap[u]}"` : m
);
// foreground alpha video: bare filename, resolved against FG_BASE by our script
body = body.replace(/data-(mov|webm)="([^"]+)"/g, (m, k, f) => `data-${k}="${vslug(f)}"`);

// srcset="a 500w, b 800w" -> keep only entries we have
body = body.replace(/\s+srcset="([^"]*)"/g, (m, list) => {
  const kept = list
    .split(',')
    .map((part) => {
      const t = part.trim();
      const sp = t.lastIndexOf(' ');
      const url = sp === -1 ? t : t.slice(0, sp);
      const desc = sp === -1 ? '' : t.slice(sp);
      const l = localFor(url);
      return l ? l + desc : null;
    })
    .filter(Boolean);
  return kept.length ? ` srcset="${kept.join(', ')}"` : '';
});

// any leftover CDN url inside style="" / other attrs
body = body.replace(/https:\/\/cdn\.prod\.website-files\.com\/[^\s"')]+/g, (u) => localFor(u) || u);

// --- strip Webflow chrome ---------------------------------------------------
body = body.replace(/<a[^>]*class="w-webflow-badge"[\s\S]*?<\/a>/g, '');
body = body.replace(/\s+data-wf-(page|site|collection|item-slug|domain)="[^"]*"/g, '');
body = body.replace(/\s+data-w-id="[^"]*"/g, '');
// empty .w-embed wrappers left behind by removed <style> blocks
body = body.replace(/<div class="w-embed">\s*<\/div>/g, '');

const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Creative Webflow Developer — Nenad Popadic | NESH®</title>
    <meta name="description" content="Webflow, Applied Differently. Creative Webflow developer building sites that merge creativity, technical excellence, and long-term value." />
    <link rel="preconnect" href="data:" />
  </head>
  <body>${body.trimEnd()}
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
`;

fs.writeFileSync('index.html', html);
console.log('index.html written,', (html.length / 1024).toFixed(1), 'KB');

// report any CDN urls we failed to localise
const left = [...new Set(html.match(/https:\/\/cdn\.prod\.website-files\.com\/[^\s"')]+/g) || [])];
if (left.length) {
  console.log('UNLOCALISED (' + left.length + '):');
  left.forEach((u) => console.log('  ', u));
} else console.log('all assets localised');
