// Prepare dist/ for GitHub Pages publication of the DEMO build.
//
// Vite copies all of public/ into dist/, which would ship the original's
// photography, client video and the commercial typefaces. This strips them,
// repoints paths at the Pages sub-path, and refuses to continue if anything
// identity-bearing survives.
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.argv[2] || '/heynesh-clone/';
const DIST = path.resolve('dist');

// ---- 1. remove everything that came from the original ------------------------
for (const dir of ['assets/img', 'assets/video', 'assets/fonts']) {
  const p = path.join(DIST, dir);
  if (fs.existsSync(p)) {
    fs.rmSync(p, { recursive: true, force: true });
    console.log('removed dist/' + dir);
  }
}

// ---- 2. strip @font-face blocks pointing at the commercial faces -------------
const cssFiles = fs
  .readdirSync(path.join(DIST, 'assets'))
  .filter((f) => f.endsWith('.css'))
  .map((f) => path.join(DIST, 'assets', f));

for (const f of cssFiles) {
  let css = fs.readFileSync(f, 'utf8');
  const before = css.length;
  css = css.replace(/@font-face\s*\{[^}]*\/assets\/fonts\/[^}]*\}/g, '');
  fs.writeFileSync(f, css);
  if (css.length !== before) console.log(`stripped commercial @font-face from ${path.basename(f)}`);
}

// ---- 3. rewrite absolute paths for the Pages sub-path ------------------------
const rewrite = (s) =>
  s
    .replace(/(["'(])\/assets\//g, `$1${BASE}assets/`)
    .replace(new RegExp(`${BASE.replace(/\//g, '\\/')}assets\\/`.replace(/\\\//g, '/') + '{2,}', 'g'), `${BASE}assets/`);

for (const f of [path.join(DIST, 'index.html'), ...cssFiles]) {
  fs.writeFileSync(f, rewrite(fs.readFileSync(f, 'utf8')));
}
console.log('rewrote asset paths to base', BASE);

// ---- 4. Pages needs this or it runs Jekyll and drops _-prefixed paths --------
fs.writeFileSync(path.join(DIST, '.nojekyll'), '');

// ---- 5. verify ---------------------------------------------------------------
const html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
const banner = html.slice(html.indexOf('demo-banner'), html.indexOf('</div>', html.indexOf('demo-banner')));
const bodyOnly = html.replace(banner, '');

const problems = [];
const idTokens = bodyOnly.match(/nenad|popadic|stefan|djina|pssltd|lilipad|alosant|fiftyseven|povio|danette|petar|klemen/gi);
if (idTokens) problems.push('identity tokens: ' + [...new Set(idTokens)].join(', '));
if (/\/assets\/img\//.test(html)) problems.push('references original images');
if (/\/assets\/video\//.test(html)) problems.push('references original video');
if (/\/assets\/fonts\//.test(html)) problems.push('references commercial fonts');

const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]
);
const shipped = walk(DIST);
const forbidden = shipped.filter((f) => /\.(avif|mp4|webm|mov|jpeg|jpg)$/i.test(f));
if (forbidden.length) problems.push('original media still in dist: ' + forbidden.slice(0, 4).join(', '));
const fonts = shipped.filter((f) => /tr3a|ppneuemontreal/i.test(f));
if (fonts.length) problems.push('commercial fonts still in dist: ' + fonts.join(', '));

const size = shipped.reduce((s, f) => s + fs.statSync(f).size, 0);
console.log(`\ndist: ${shipped.length} files, ${(size / 1048576).toFixed(1)} MB`);

if (problems.length) {
  console.error('\nREFUSING TO PUBLISH:');
  problems.forEach((p) => console.error('  - ' + p));
  process.exit(1);
}
console.log('clean: no original media, fonts, or identity content in dist/');
