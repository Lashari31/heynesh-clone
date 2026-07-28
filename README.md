# heynesh.com — pixel-accurate rebuild

> ### Attribution and intent — please read first
>
> This is a **technical study**: a front-end engineering exercise in reproducing a
> site exactly, and a record of how close a hand-built Vite/GSAP rebuild can get to
> a Webflow original (it gets to a 0.46 % mean pixel difference).
>
> **The original design, brand, copy, photography, case studies and the animation
> engine are the work of [Nenad Popadic](https://heynesh.com) (NESH®). I did not
> design any of it and claim no ownership of it.** This repository is not
> affiliated with, endorsed by, or connected to him.
>
> It is **not deployed** and GitHub Pages is deliberately not enabled. It exists as
> source, not as a live site presenting itself as someone else.
>
> The repo also contains two commercial typefaces (`Tr 3 A`, `PP Neue Montreal`)
> that are **not licensed for redistribution** — they are here only because the
> rebuild had to be verified against the original at the pixel level. See
> [Before publishing](#before-publishing--read-this).
>
> If you are Nenad and would like any of this removed, open an issue and I will
> take it down immediately.

A from-scratch Vite + vanilla-JS rebuild of **https://heynesh.com** (Nenad
Popadic's portfolio, "NESH®"), built to match the original rather than
reinterpret it. The live site is the only source of truth; every value here was
measured off it, not invented.

Reference inventory: **[SECTIONS.md](SECTIONS.md)**.

**Live demo:** https://lashari31.github.io/heynesh-clone/

That deployment is the **placeholder variant**, not the faithful one — see
[The two builds](#the-two-builds). Nothing of the original's branding, copy,
photography, client work or typefaces is published there.

```bash
npm install
npm run dev        # http://localhost:5180  (faithful build)
npm run build      # -> dist/
npm run preview    # http://localhost:5181

npm run demo       # rewrite index.html to the placeholder variant
npm run demo:build # build + strip originals + verify, ready for Pages
npm run restore    # regenerate the faithful index.html
```

## The two builds

| | Faithful | Demo (published) |
|---|---|---|
| Purpose | verify fidelity against the original | show the engineering publicly |
| Branding | NESH®, real copy | AXIS®, placeholder copy |
| Photography / client work | the original's | generated SVG stand-ins |
| Typefaces | Tr 3 A, PP Neue Montreal | Archivo, Manrope (free, aliased to the same family names) |
| Where | local only | GitHub Pages |

`_research/deploy-demo.mjs` **refuses to publish** if any original media, font or
identity token survives into `dist/` — it is a hard gate, not a checklist.

Because the substitute faces have different metrics, the demo's line breaks and
measured widths do not match heynesh.com. Layout, motion, colour and the fluid
type *system* are unchanged. All fidelity numbers below are from the faithful
build.

---

## Verification (measured, not asserted)

Every number below comes from a Playwright script in `_research/`, run against
the live site and this build at identical viewport sizes and scroll depths.
Diff images land in `_research/shots/diff/`.

| Check | Result |
|---|---|
| Document height @1440 | **13863 px — identical** to the original |
| Document height @390 | **10421 px — identical** |
| Full-page frame diff @1440 (16 frames) | mean **0.46 %**, hero frame **0.00 %**, worst 1.24 % |
| Full-page frame diff @390 (13 frames) | mean **0.05 %**, 9 frames at **0.00 %** |
| Production bundle vs original @1440 | mean **0.53 %** |
| Signature Flip morph (8 scroll depths) | mean **0.15 %**, **0.00 %** through the whole scrub (y=0–600) |
| Reverse scroll @1440 (down vs up) | worst **7.45 %** — original scores **7.41 %** on the same test |
| Reverse scroll @390 | worst **1.84 %**, 7 of 9 stops at **0.00 %** |
| FAQ accordion | closed 67.95 px → open 255.03 px, icon `matrix(0,1,-1,0,0,0)` — all identical to the original |
| `npm run build` | clean, no warnings |

The residual sub-1 % on most frames is the client-logo marquee and the work-card
videos being at a different phase at capture time, not layout drift. The
reverse-scroll residual is the same effect and the original measures the same.

Reproduce any of it:

```bash
node _research/capture.mjs https://heynesh.com/ orig 1440
node _research/capture.mjs http://localhost:5180/ mine 1440
node _research/compare.mjs 1440
node _research/anim.mjs    http://localhost:5180/ mine     # morph scrub
node _research/reverse.mjs http://localhost:5180/ mine 1440
node _research/overflow.mjs http://localhost:5180/ MINE    # all 7 widths
```

---

## How it is built

- **Vite + vanilla JS.** No Tailwind, no framework.
- **GSAP 3.15.0** (ScrollTrigger, SplitText, Flip, DrawSVG, MotionPath, ScrollTo) — the
  exact versions the original loads. **Lenis 1.1.18**, **Swiper 11**.
- **Type scale is fluid, in the original's own units.** `body { font-size:
  clamp(.75rem, 1.18vw, 1.5rem) }` (1.18vw = 16.992 px at 1440) and everything
  else is an `em` multiple of it. That is why the page scales instead of
  breaking; it is reproduced verbatim, not converted to px.
- **Fonts are self-hosted** — the original's real `Tr 3 A` and `PP Neue
  Montreal` woff2 files, no silent Arial fallback. See the licensing note below.
- **Structure and stylesheet are ported from the original**, with asset URLs
  rewritten to local copies. Generators live in `_research/` (`build-html.mjs`,
  `build-css.mjs`) so the port is repeatable rather than hand-copied.
- **The animation engine is a port of the original's own `script.js`**
  (`f1-assets.b-cdn.net/script.js`, 3307 lines, shipped unminified with
  comments) at `src/js/engine.js`. Using it is what makes the motion identical
  rather than approximated — the same triggers, easings, durations and scrub
  values, including its 768px cutoffs.

### Files

```
index.html               generated by _research/build-html.mjs
src/main.js              entry; import order is load-bearing
src/js/globals.js        publishes gsap/Lenis/Swiper on window for the engine
src/js/engine.js         ported animation engine
src/js/dropdown.js       replaces Webflow's dropdown runtime (FAQ accordion)
src/js/anchors.js        replaces the original's anchor handler
src/js/work-video.js     replaces the original's work-card video loader
src/styles/site.css      ported stylesheet, fonts repointed locally
src/styles/custom.css    the original's inline <style> block
public/assets/           65 images, 27 videos, 6 woff2
_research/               audit + verification scripts, reference screenshots
```

---

## Deliberate deviations

Three, all forced, all pixel-neutral:

1. **Engine boot guard.** The original's engine is a classic `<script>`, so its
   `window.addEventListener('load', …)` always registers before load fires. As an
   ES module it can evaluate after load, which strands the page on the
   preloader's from-state (a blank sand screen). `src/js/engine.js` now runs
   `boot()` immediately if `document.readyState === 'complete'`.
2. **One malformed CSS declaration removed.** The original ships a bare
   `clamp(0.43rem, 2.13vw, 1.02rem);` with no property name inside
   `.swiper-pagination`. Browsers discard it; the build's CSS minifier refuses to
   parse the file at all. Removing it changes nothing that ever rendered.
3. **Webflow runtime replaced.** The original loads `webflow.js` for its dropdown
   component. That is reimplemented in `src/js/dropdown.js`; the visual behaviour
   is CSS (`grid-template-rows: 0fr → 1fr`, the `+` bar rotating 90°) and was
   verified to land on identical measurements.

### Bug found and fixed during the port

Webflow reuses base filenames across different assets — `Frame 116046198.avif`
and `Frame 116046202.avif` each exist twice under different content hashes. The
first version of the asset downloader stripped the hash prefix, so two images
silently overwrote two others (65 files landed for 67 URLs). The visible symptom
was the wrong avatar on the '19 timeline card. `_research/slug.mjs` now keeps a
short hash, and the download is asserted collision-free. This moved the @1440
mean from 0.56 % to 0.46 % and the @390 mean from 0.10 % to 0.05 %.

## Known, inherited from the original

**Horizontal overflow on desktop.** At 768 / 1024 / 1440 the original's document
`scrollWidth` exceeds the viewport (1068 / 1049 / 1475) and the page can pan
sideways. This build reproduces that exactly — same widths, same offending
elements (`.profile-img-item` / `.hero-profile-img`, which sit inside the
sidebar's transformed, counter-scaled container and overshoot by the sidebar's
20px offset, plus the client-logo marquee). At 360 / 390 / 414 / 430 both the
original and this build are clean.

It is left matching the original because fidelity is the brief. It is a genuine
defect and worth fixing if this ships — the correct fix is clipping the marquee
and correcting the counter-scaled portrait's offset, not `overflow-x: hidden`.
Say the word and I will do it and re-verify that no pixel moves.

---

## Before publishing — read this

**Fonts.** `Tr 3 A` and `PP Neue Montreal` are commercial licensed typefaces,
self-hosted here to hit an exact match during the rebuild. They must be licensed
before launch, or swapped. Nearest free substitutes: **Switzer** for PP Neue
Montreal, a grotesk such as **Archivo Expanded** or **Anton** for Tr 3 A. Neither
is a metric match, so a swap will move line breaks and needs a re-run of the
verification pass. Swap point: the `@font-face` blocks in `src/styles/site.css`.

**Identity.** The portrait, wordmark, name, bio, testimonials, client logos, case
studies and the email address are Nenad Popadic's. They are present so this build
could be verified against the original pixel-for-pixel. Replace all of them with
the client's own branding before anything goes live — keep the layout, motion,
type and colour, change the identity. Publishing this as-is would be a live copy
presenting itself as a real person and invites a takedown.
