import fs from 'node:fs';
import path from 'node:path';

const html = fs.readFileSync('_research/raw/home.pretty.html', 'utf8');
const FG_BASE = 'https://f1-assets.b-cdn.net/nesh-work/Portfolio%20Work/';
const OUT = path.resolve('public/assets/video');
fs.mkdirSync(OUT, { recursive: true });

const urls = new Set();
for (const m of html.matchAll(/data-src="([^"]+)"/g)) urls.add(m[1]);
for (const m of html.matchAll(/data-webm="([^"]+)"/g)) urls.add(FG_BASE + encodeURIComponent(m[1]));
for (const m of html.matchAll(/data-mov="([^"]+)"/g)) urls.add(FG_BASE + encodeURIComponent(m[1]));

const slug = (u) =>
  decodeURIComponent(u.split('/').pop())
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();

const map = {};
let ok = 0, fail = 0, bytes = 0;
for (const u of urls) {
  const name = slug(u);
  try {
    const res = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0 Chrome/124.0', Referer: 'https://heynesh.com/' } });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(path.join(OUT, name), buf);
    map[u] = name;
    bytes += buf.length;
    ok++;
    console.log((buf.length / 1048576).toFixed(2) + 'MB', name);
  } catch (e) {
    console.log('FAIL', name, e.message);
    fail++;
  }
}
fs.writeFileSync('_research/data/video-map.json', JSON.stringify(map, null, 1));
console.log(`\n${ok} ok, ${fail} failed, ${(bytes / 1048576).toFixed(1)} MB total`);
