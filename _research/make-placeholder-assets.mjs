// Generate neutral stand-in art for the demo build, so nothing of the
// original's photography, client work or branding is republished.
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.resolve('_demo/assets');
fs.mkdirSync(OUT, { recursive: true });
const w = (name, svg) => fs.writeFileSync(path.join(OUT, name), svg.trim());

const HUES = [268, 205, 150, 96, 32, 12, 330, 240, 180];

// --- project card backgrounds ------------------------------------------------
HUES.forEach((h, i) => {
  w(
    `project-bg-${i + 1}.svg`,
    `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="hsl(${h} 55% 22%)"/>
      <stop offset="1" stop-color="hsl(${(h + 40) % 360} 60% 9%)"/>
    </linearGradient>
    <radialGradient id="r" cx="0.7" cy="0.3" r="0.8">
      <stop offset="0" stop-color="hsl(${h} 80% 60%)" stop-opacity="0.45"/>
      <stop offset="1" stop-color="hsl(${h} 80% 60%)" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="800" height="1000" fill="url(#g)"/>
  <rect width="800" height="1000" fill="url(#r)"/>
  <g fill="none" stroke="hsl(${h} 70% 70%)" stroke-opacity="0.18" stroke-width="1.5">
    ${Array.from({ length: 9 }, (_, k) => `<circle cx="${560 - k * 34}" cy="${300 + k * 26}" r="${40 + k * 22}"/>`).join('\n    ')}
  </g>
</svg>`
  );
});

// --- floating "device mockup" foreground -------------------------------------
HUES.forEach((h, i) => {
  w(
    `project-fg-${i + 1}.svg`,
    `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000">
  <g transform="translate(400 480) rotate(-8) translate(-260 -180)">
    <rect x="0" y="0" width="520" height="360" rx="18" fill="#0d0d10" stroke="hsl(${h} 40% 45%)" stroke-width="2"/>
    <rect x="12" y="12" width="496" height="336" rx="10" fill="hsl(${h} 30% 96%)"/>
    <rect x="34" y="38" width="150" height="12" rx="6" fill="hsl(${h} 30% 72%)"/>
    <rect x="34" y="70" width="300" height="26" rx="6" fill="hsl(${h} 35% 40%)"/>
    <rect x="34" y="120" width="440" height="9" rx="4" fill="hsl(${h} 18% 80%)"/>
    <rect x="34" y="140" width="400" height="9" rx="4" fill="hsl(${h} 18% 84%)"/>
    <rect x="34" y="160" width="420" height="9" rx="4" fill="hsl(${h} 18% 84%)"/>
    <rect x="34" y="200" width="180" height="34" rx="17" fill="hsl(${h} 60% 50%)"/>
    <rect x="250" y="200" width="224" height="118" rx="10" fill="hsl(${h} 25% 88%)"/>
    <rect x="34" y="256" width="190" height="62" rx="10" fill="hsl(${h} 25% 91%)"/>
  </g>
</svg>`
  );
});

// --- hero portrait stand-in ---------------------------------------------------
// Matches the hero container's aspect (1440x900) and sits where the original
// cut-out sits: centred, head near the top, shoulders running off the bottom.
w(
  'portrait.svg',
  `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMax meet">
  <defs>
    <linearGradient id="p" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#43423f"/>
      <stop offset="1" stop-color="#141416"/>
    </linearGradient>
  </defs>
  <g fill="url(#p)">
    <circle cx="720" cy="298" r="132"/>
    <path d="M720 452c150 0 262 96 300 232 24 85 34 130 34 216H386c0-86 10-131 34-216 38-136 150-232 300-232Z"/>
  </g>
</svg>`
);

// --- avatars ------------------------------------------------------------------
const avatars = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
avatars.forEach((ch, i) => {
  const h = HUES[i % HUES.length];
  w(
    `avatar-${i + 1}.svg`,
    `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <circle cx="60" cy="60" r="60" fill="hsl(${h} 30% 42%)"/>
  <text x="60" y="60" text-anchor="middle" dominant-baseline="central"
        font-family="Archivo, Arial, sans-serif" font-size="52" font-weight="700"
        fill="hsl(${h} 40% 92%)">${ch}</text>
</svg>`
  );
});

// --- client logo marquee ------------------------------------------------------
['Northwind', 'Vertex', 'Lumen', 'Kestrel', 'Onyx', 'Pallas', 'Corvus', 'Meridian'].forEach((name, i) => {
  const wdt = 60 + name.length * 13;
  const mk = (fill) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${wdt} 40">
  <circle cx="18" cy="20" r="11" fill="${fill}" opacity="0.85"/>
  <text x="38" y="20" dominant-baseline="central"
        font-family="Archivo, Arial, sans-serif" font-size="18" font-weight="700"
        fill="${fill}">${name}</text>
</svg>`;
  w(`client-${i + 1}.svg`, mk('#111'));
  w(`client-${i + 1}-white.svg`, mk('#fff'));
});

console.log('placeholder assets written to _demo/assets:', fs.readdirSync(OUT).length, 'files');
