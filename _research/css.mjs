// Extract the original stylesheet's rules for one or more class names.
//   node _research/css.mjs hero-heading hero-container
import fs from 'node:fs';

const css = fs.readFileSync('_research/raw/webflow.css', 'utf8');
const names = process.argv.slice(2);
if (!names.length) {
  console.error('usage: node _research/css.mjs <class-name> [...]');
  process.exit(1);
}

// Split top-level rules, tracking @media context.
const rules = [];
let i = 0, depth = 0, buf = '', media = '';
const stack = [];
while (i < css.length) {
  const ch = css[i];
  if (ch === '{') {
    depth++;
    if (depth === 1 && buf.trim().startsWith('@')) {
      stack.push(media);
      media = buf.trim();
      buf = '';
      i++;
      depth = 0;
      continue;
    }
    buf += ch;
  } else if (ch === '}') {
    if (depth === 0) {
      media = stack.pop() || '';
      buf = '';
      i++;
      continue;
    }
    depth--;
    buf += ch;
    if (depth === 0) {
      rules.push({ media, text: buf.trim() });
      buf = '';
    }
  } else {
    buf += ch;
  }
  i++;
}

for (const n of names) {
  const re = new RegExp(`\\.${n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w-])`);
  const hits = rules.filter((r) => re.test(r.text.split('{')[0]));
  console.log(`\n/* ================= .${n}  (${hits.length} rules) ================= */`);
  for (const h of hits) {
    if (h.media) console.log(`${h.media} {`);
    console.log(h.text.replace(/;/g, ';\n  ').replace(/\{/, ' {\n  '));
    if (h.media) console.log('}');
  }
}
