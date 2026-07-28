// Build a publishable DEMO variant of the page: identical layout, motion,
// colour and type *system*, but with every piece of the original's identity
// (brand, person, photography, client work, testimonials, contact) replaced by
// neutral stand-ins, and the licensed typefaces swapped for free substitutes.
//
//   node _research/make-placeholder.mjs        -> rewrites index.html in place
//   node _research/build-html.mjs              -> restores the faithful version
import fs from 'node:fs';

let h = fs.readFileSync('index.html', 'utf8');
const before = h;

// ---------------------------------------------------------------- wordmark ---
// The NESH letterforms are four <path>s inside a 1288x338 viewBox, and the Flip
// morph measures that box. Swapping the paths for a single <text> that is forced
// to the same width keeps the geometry — and therefore the morph — intact.
const wordmark = (vb) => `
      <text x="0" y="272" font-family="Archivo, Arial Black, sans-serif" font-size="338"
            font-weight="700" letter-spacing="-8" fill="currentColor"
            textLength="${vb}" lengthAdjust="spacingAndGlyphs">AXIS</text>`;

h = h.replace(
  /(<svg[^>]*viewBox="0 0 (1288|1388) 338"[^>]*>)([\s\S]*?)(<\/svg>)/g,
  (m, open, vb, inner, close) => open + wordmark(vb) + '\n    ' + close
);

// ------------------------------------------------------------------ imagery ---
// Point every photograph / client asset at a generated stand-in.
const projectImg = (n, kind) => `/assets/demo/project-${kind}-${((n - 1) % 9) + 1}.svg`;

// work cards, in DOM order, get sequential placeholder art
let bgN = 0, fgN = 0;
h = h.replace(/src="\/assets\/img\/[^"]*"(\s+loading="lazy")?([^>]*class="work-image")/g, (m, lazy, tail) => {
  bgN++;
  return `src="${projectImg(bgN, 'bg')}"${lazy || ''}${tail}`;
});
h = h.replace(/poster="\/assets\/img\/[^"]*"([^>]*class="work-video")/g, (m, t) => m); // handled below
h = h.replace(/(<video[^>]*class="work-bg"[\s\S]*?)poster="[^"]*"/g, (m, pre) => {
  bgN = Math.min(bgN, 9);
  return `${pre}poster="${projectImg(bgN || 1, 'bg')}"`;
});
h = h.replace(/(<video[^>]*class="work-video"[\s\S]*?)poster="[^"]*"/g, (m, pre) => {
  fgN++;
  return `${pre}poster="${projectImg(fgN, 'fg')}"`;
});

// no client video may load
h = h.replace(/\s+data-src="\/assets\/video\/[^"]*"/g, '');
h = h.replace(/\s+data-(mov|webm)="[^"]*"/g, '');

// hero portrait — attribute order varies (class often precedes src), so match
// the whole <img> tag by class and rewrite its sources inside it.
h = h.replace(/<img\b[^>]*class="[^"]*\b(hero-profile-img|mobile-hero-image)\b[^"]*"[^>]*>/g, (tag) =>
  tag
    .replace(/\s+srcset="[^"]*"/g, '')
    .replace(/\s+sizes="[^"]*"/g, '')
    .replace(/src="[^"]*"/, 'src="/assets/demo/portrait.svg"')
);

// client logo marquee (light + dark variants)
let cl = 0;
h = h.replace(/src="\/assets\/img\/[^"]*\.svg"/g, () => {
  cl++;
  const i = ((cl - 1) % 8) + 1;
  return `src="/assets/demo/client-${i}${cl % 2 === 0 ? '-white' : ''}.svg"`;
});

// any remaining original raster (timeline + testimonial avatars) -> initials
let av = 0;
h = h.replace(/src="\/assets\/img\/[^"]*"/g, () => `src="/assets/demo/avatar-${(av++ % 7) + 1}.svg"`);

// srcset would otherwise still pull the original photography at larger widths
h = h.replace(/\s+srcset="[^"]*\/assets\/img\/[^"]*"/g, '');
h = h.replace(/\s+sizes="[^"]*"(?=[^>]*\/assets\/demo\/)/g, '');

// inline client-logo SVGs in the marquee are the clients' actual marks
const CLIENT_CLASSES = [
  '_1910', 'alosant', 'curri', 'omicron', 'puck', 'invert',
  'happy-ring', 'semiconbio', 'ray-ai', 'lilipad', 'pssltd',
];
let inl = 0;
for (const c of CLIENT_CLASSES) {
  for (const cls of [c, c + '-white']) {
    // Anchor on the exact class so nested <svg>s elsewhere cannot mis-align the match.
    const re = new RegExp(`(<svg\\b[^>]*class="${cls.replace(/[-_]/g, '[-_]')}"[^>]*>)[\\s\\S]*?(<\\/svg>)`, 'g');
    h = h.replace(re, (m, open, close) => {
      inl++;
      const fill = cls.endsWith('-white') ? '#ffffff' : '#111111';
      const vb = (open.match(/viewBox="([^"]+)"/) || [, '0 0 100 20'])[1].split(/\s+/).map(Number);
      const vw = vb[2] || 100;
      const vh = vb[3] || 20;
      return (
        open +
        `<rect x="0" y="${(vh * 0.18).toFixed(1)}" width="${(vw * 0.24).toFixed(1)}" height="${(vh * 0.64).toFixed(1)}" rx="${(vh * 0.32).toFixed(1)}" fill="${fill}" opacity="0.85"/>` +
        `<rect x="${(vw * 0.32).toFixed(1)}" y="${(vh * 0.3).toFixed(1)}" width="${(vw * 0.64).toFixed(1)}" height="${(vh * 0.4).toFixed(1)}" rx="${(vh * 0.12).toFixed(1)}" fill="${fill}" opacity="0.7"/>` +
        close
      );
    });
  }
}

// alt text carries names too
h = h.replace(/alt="[^"]*"/g, (m) =>
  /stefan|djina|nenad|fiftyseven|semicon|alosant|povio|petar|klemen|danette|brother|daughter|1910|lilipad|pssltd|omicron|puck|happy ring|ray ai/i.test(m)
    ? 'alt=""'
    : m
);

// ---------------------------------------------------------------------- copy ---
const swaps = [
  // brand + person
  [/Creative Webflow Developer — Nenad Popadic \| NESH®/g, 'AXIS® — Demo Build'],
  [/Nenad Popadic/g, 'Alex Rivera'],
  [/Nenad’s|Nenad's/g, "Alex's"],
  [/\bNenad\b/g, 'Alex'],
  [/\bNESH\b/g, 'AXIS'],
  [/nenad@popadic\.co/g, 'hello@example.com'],

  // personal history -> neutral studio history
  [/My brother Stefan showed me Webflow\. I bothered him with questions for three months straight\. He probably regrets it\./g,
   'A friend showed me the tool that started all of this. I asked far too many questions for far too long.'],
  [/My brother Stefan, a UX designer, opened Webflow and created something right in front of me\.[^<]*/g,
   'Someone opened a design tool in front of me and built something in minutes. I had no idea that was possible, and I never really stopped after that.'],
  [/I got married\. My daughter Djina was born\. Suddenly everything I do has a deeper reason behind it\./g,
   'Life outside work changed shape, and so did the reason behind the work itself.'],
  [/Djina changed how I see everything[^<]*/g,
   'That shift changed how I see everything, not just life, but how I show up for the work.'],
  [/No pitch\. No portfolio review\. Just clients telling people 'work with Alex\.' That hit different\./g,
   'No pitch. No portfolio review. Just people passing the name along. That hit different.'],
  [/with Alex, he delivers\.'[^<]*/g, "with this studio, it gets delivered.' That kind of trust is the thing I am proudest of."],
  [/@stefan/g, '@studio'], [/@fiftyseven/g, '@partners'], [/@nenad/g, '@axis'],
  [/@family/g, '@life'], [/@clients/g, '@referrals'], [/@webflow/g, '@platform'], [/@gsap/g, '@motion'],
  [/FIFTYSEVEN/g, 'PARTNERS'],

  // project names + blurbs
  [/1910\.ai/g, 'Northwind'], [/SemiconBio/g, 'Vertex'], [/Happy Ring/g, 'Lumen'],
  [/PSSLTD/g, 'Kestrel'], [/Lilipad/g, 'Pallas'], [/Omicron/g, 'Onyx'],
  [/\bPuck\b/g, 'Corvus'], [/Alosant/g, 'Meridian'], [/RAY AI/g, 'Solstice'],
  [/Fully realizing the promise of molecular electronics with the Vertex platform\./g,
   'A technical platform build with a component system made to scale.'],
  [/Onyx is a blockchain studio helping Web 3\.0 players turn ideas into decentralized products\./g,
   'A product studio site built around motion and a modular content model.'],

  // testimonial attribution
  [/Danette Beal/g, 'Jordan Ellis'], [/Petar Stojakovic/g, 'Sam Okafor'], [/Klemen Vute/g, 'Robin Alvarez'],
  [/Meridian\.com|fiftyseven\.co|Povio\.com|Povio/g, 'example.com'],
];
for (const [re, to] of swaps) h = h.replace(re, to);

// scrub any remaining outbound links to the original or its clients
h = h.replace(/href="https?:\/\/(?!fonts\.googleapis|fonts\.gstatic)[^"]*"/g, 'href="#"');

// ------------------------------------------------------------------- fonts ---
// The commercial faces cannot be redistributed, so the demo uses free ones.
h = h.replace(
  '</head>',
  `  <link rel="stylesheet" href="/src/styles/demo-fonts.css" />
    <link rel="stylesheet" href="/src/styles/demo.css" />
  </head>`
);

// -------------------------------------------------------------------- banner ---
h = h.replace(
  /<body>/,
  `<body>
    <div id="demo-banner">
      <strong>Demo build.</strong> Front-end study reproducing the layout and motion of
      <a href="https://heynesh.com" target="_blank" rel="noopener">heynesh.com</a> by Nenad Popadic.
      All branding, copy, photography and client work here are placeholders — none of the original's content is republished.
    </div>`
);

fs.writeFileSync('index.html', h);

// --------------------------------------------------------------------- report ---
const leftovers = [...new Set(
  (h.match(/nenad|popadic|stefan|djina|semiconbio|pssltd|lilipad|alosant|fiftyseven|povio|danette|petar|klemen|heynesh/gi) || [])
)].filter((s) => s.toLowerCase() !== 'heynesh'); // the attribution link is intentional

console.log(`rewrote index.html (${(before.length / 1024).toFixed(0)}KB -> ${(h.length / 1024).toFixed(0)}KB)`);
console.log('remaining identity tokens:', leftovers.length ? leftovers.join(', ') : 'none');
console.log('remaining /assets/img refs:', (h.match(/\/assets\/img\//g) || []).length);
console.log('remaining /assets/video refs:', (h.match(/\/assets\/video\//g) || []).length);
