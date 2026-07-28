// Query the computed-style dump:  node _research/q.mjs <substring-of-class-or-tag> [limit]
import fs from 'node:fs';
const data = JSON.parse(fs.readFileSync('_research/data/computed-1440.json', 'utf8'));
const needle = (process.argv[2] || '').toLowerCase();
const limit = Number(process.argv[3] || 12);
const hits = data.filter(
  (d) =>
    (d.cls || '').toLowerCase().includes(needle) ||
    (d.id || '').toLowerCase().includes(needle) ||
    (needle.startsWith('#') && (d.id || '') === needle.slice(1))
);
for (const h of hits.slice(0, limit)) {
  console.log(`\n== <${h.tag}${h.id ? '#' + h.id : ''}> .${h.cls}`);
  console.log(`   rect ${h.rect.w}x${h.rect.h} @ ${h.rect.x},${h.rect.y}`);
  if (h.text) console.log(`   text "${h.text}"`);
  const s = h.css;
  console.log(
    '   ' +
      Object.entries(s)
        .map(([k, v]) => `${k}:${v}`)
        .join('; ')
  );
}
console.log(`\n(${hits.length} matches, showing ${Math.min(limit, hits.length)})`);
