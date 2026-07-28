// Port the original stylesheets:
//   src/styles/site.css    <- webflow.css, @font-face rewritten to the local woff2
//   src/styles/custom.css  <- the site's own inline <style> block
import fs from 'node:fs';
import path from 'node:path';

fs.mkdirSync('src/styles', { recursive: true });

let css = fs.readFileSync('_research/raw/webflow.css', 'utf8');

// point every webflow-hosted font at our local copy
css = css.replace(/url\(["']?https:\/\/cdn\.prod\.website-files\.com\/[^"')]*\/([a-zA-Z0-9_.-]+\.woff2?)["']?\)/g, (m, file) => {
  const bare = file.replace(/^[a-f0-9]{16,}_/i, ''); // strip webflow hash prefix
  const local = path.join('public/assets/fonts', bare);
  return fs.existsSync(local) ? `url("/assets/fonts/${bare}")` : m;
});

const missed = [...new Set(css.match(/https:\/\/cdn\.prod\.website-files\.com\/[^")]*\.woff2?/g) || [])];

// the base64 webflow-icons face is huge and only powers the Webflow dropdown
// caret, which the markup keeps — leave it in place.
fs.writeFileSync('src/styles/site.css', css);
console.log('site.css', (css.length / 1024).toFixed(1), 'KB; unresolved font urls:', missed.length);
missed.forEach((u) => console.log('   ', u));

let inline = fs.readFileSync('_research/raw/inline.css', 'utf8');

// The original ships one malformed declaration (a bare `clamp(...);` with no
// property, inside .swiper-pagination). Browsers drop it; lightningcss refuses
// to parse the file at all. Stripping it is pixel-neutral.
inline = inline.replace(
  /^\s*clamp\(0\.43rem, 2\.13vw, 1\.02rem\);\s*$/m,
  '                  /* removed: malformed declaration in the original (no property name) */'
);
// the first tiny block is just a lenis html/body guard; keep both.
fs.writeFileSync('src/styles/custom.css', inline);
console.log('custom.css', (inline.length / 1024).toFixed(1), 'KB');
