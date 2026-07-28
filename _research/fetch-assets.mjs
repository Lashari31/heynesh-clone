import fs from 'node:fs';
import path from 'node:path';
import { slugFor } from './slug.mjs';

const meta = JSON.parse(fs.readFileSync('_research/data/meta.json', 'utf8'));
const html = fs.readFileSync('_research/raw/home.html', 'utf8');

const urls = new Set();
for (const n of meta.network) {
  const [type, u] = [n.slice(0, n.indexOf(' ')), n.slice(n.indexOf(' ') + 1)];
  if (['image', 'media'].includes(type) && !u.startsWith('data:')) urls.add(u);
}
// also anything referenced in the raw HTML (covers lazy / srcset assets)
const re = /https:\/\/cdn\.prod\.website-files\.com\/[^"'\\\s)]+\.(?:avif|png|jpg|jpeg|webp|svg|mp4|webm)/gi;
for (const m of html.match(re) || []) urls.add(m.replace(/\\+$/, ''));

const OUT = path.resolve('public/assets/img');
fs.mkdirSync(OUT, { recursive: true });

const slug = slugFor;

let ok = 0, fail = 0;
const map = {};
for (const u of urls) {
  const name = slug(u);
  const dest = path.join(OUT, name);
  try {
    const res = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0 Chrome/124.0' } });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(dest, buf);
    map[u] = name;
    ok++;
  } catch (e) {
    console.log('FAIL', name, e.message);
    fail++;
  }
}
fs.writeFileSync('_research/data/asset-map.json', JSON.stringify(map, null, 1));
console.log(`downloaded ${ok}, failed ${fail}, total urls ${urls.size}`);
