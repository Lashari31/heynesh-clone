# heynesh.com — Source-of-Truth Inventory

Captured 2026-07-28 from `https://heynesh.com/` (www redirects 301 → apex).
Raw sources in `_research/raw/`, computed styles in `_research/data/`, reference
screenshots in `_research/shots/orig/`.

Original title: `Creative Webflow Developer — Nenad Popadic | NESH®`

**Platform of the original:** Webflow + jQuery 3.5.1 + GSAP 3.15.0
(ScrollTrigger, SplitText, Flip, DrawSVG, MotionPath, ScrollTo, ScrollSmoother)
+ Lenis 1.1.18 + Swiper 11, driven by a single bespoke 3307-line engine at
`https://f1-assets.b-cdn.net/script.js` ("OPTIMIZED ANIMATION ENGINE v2.5").
That file ships **unminified with comments**, so every animation below is a
transcription of the real source, not a guess.

---

## 1. Page metrics

| Width | Document height | Notes |
|---|---|---|
| 1440 | 13863 px | 16 viewport steps @900 |
| 390  | 10421 px | 13 viewport steps @844; horizontal-scroll + morph disabled |

Body: `background: #d5cfbe`, `color: #000`, `overflow: clip`,
`line-height: 1.6`.

---

## 2. Type system — THE critical detail

Everything scales from one fluid root on `body`:

```css
/* desktop / default */
body { font-size: clamp(0.75rem, 1.18vw, 1.5rem); }
/* ≤479px */
body { font-size: clamp(0.91rem, 4.53vw, 2.17rem); }
```

At 1440px `1.18vw = 16.992px`, which is exactly the measured body size, and
**every other size in the page is an `em` multiple of it**. This is why the
site scales rather than breaks. Reproduce with `em`, never px.

Measured computed sizes at 1440 (and their em value):

| Role | Computed | em | Family / weight | LS | LH |
|---|---|---|---|---|---|
| Hero H1 | 76.32px | 4.49em | Tr 3 A 700 | normal | 78.61px (1.03) |
| Section H2 | 67.968px | 4.0em | Tr 3 A 700 | -1.296px | 67.968px (1.0) |
| Giant display ("What You Get?") | 110.016px | 6.475em | Tr 3 A 500 | -3.312px | 1.0 |
| Wordmark / footer NESH | 80.064px | 4.712em | Tr 3 A 700 | normal | 1.0 |
| Card title | 27.936px / 24.048px | 1.644 / 1.415em | Tr 3 A 500 | normal | 1.0–1.1 |
| Body copy | 16.992px | 1em | Ppneuemontreal Book 400 | normal | 27.19px (1.6) |
| Nav link | 18px | 1.059em | Tr 3 A 500 | normal | 1.0, uppercase |
| Label / pill | 13.968px | 0.822em | Ppneuemontreal Book 400 | normal | 1.0 |
| Sidebar body | 14.4px | 0.847em | Ppneuemontreal Book 400 | normal | 23.04px (1.6) |

### Fonts (self-hosted, downloaded to `src/assets/fonts/`)

| Family | Weights | File |
|---|---|---|
| `Tr 3 A` (display) | 400 / 500 / 700 | `tr3a-Regular.woff2`, `tr3a-Medium.woff2`, `tr3a-Bold.woff2` |
| `Ppneuemontreal Book` (body) | 400 | `ppneuemontreal-book.woff2` |
| `Ppneuemontreal` | 500 / 700 | `ppneuemontreal-medium.woff2`, `ppneuemontreal-bold.woff2` |

Fallback stack in the original is `Arial, sans-serif` on both.

> **LICENSING NOTE — read before publishing.** "Tr 3 A" and "PP Neue Montreal"
> are commercial licensed typefaces. They are used here to hit an exact match
> during the rebuild. For a public launch they must be licensed, or swapped
> (nearest free substitutes: **Switzer** for PP Neue Montreal; a grotesk such as
> **Archivo Expanded / Anton** for Tr 3 A — neither is a perfect metric match,
> so a swap will shift line breaks and needs a re-verification pass).

---

## 3. Palette (from computed values, by usage weight)

| Token | Value | Use |
|---|---|---|
| `--sand` | `#d5cfbe` / `rgb(213,207,190)` | page background |
| `--yellow` | `#ffff23` / `rgb(255,255,35)` | wordmark, accents, CTA |
| `--black` | `#000000` | text |
| `--white` | `#ffffff` | text on dark |
| `--card` | `rgb(224,223,197)` / `#e0dfc5` | light card fill |
| `--card-80` | `rgba(223,222,206,0.8)` | glass card fill (light) |
| `--dark-surface` | `rgb(34,34,34)` / `#222` | work section background |
| `--muted` | `rgb(166,166,166)` | secondary text |
| `--nav-item-light` | `#EBEADA` | nav pill background (light) |
| `--nav-item-dark` | `rgba(57,57,57,0.90)` | nav pill background (dark) |
| `--panel-dark` | `rgba(29,29,29,0.60)` | sidebar card (dark theme) |
| `--panel-dark-90` | `rgba(29,29,29,0.90)` | nav-top card (dark theme) |
| `--hero-glass` | `rgba(194,184,172,0.3)` | hero glass cards |
| glass border light | `1px solid rgba(255,255,255,0.20)` | |
| glass border dark | `1px solid rgba(255,255,255,0.10)` | |
| hero glass border | `1px solid rgba(255,255,255,0.20)` | |

Glass recipe (hero cards): `background: rgba(194,184,172,0.3)`,
`backdrop-filter: blur(20px)`, `border: 1px solid rgba(255,255,255,0.2)`,
`border-radius: 8.064px` (= 0.4745em), `padding: 24.048px` (= 1.415em).

---

## 4. Section order and geometry (measured at 1440)

| # | Selector | y | height | Background |
|---|---|---|---|---|
| — | `header.navigation` | fixed | 900 (viewport) | transparent, `z-index:2`, `left:20px`, width `266.97px`, `padding-top:18px` |
| 1 | `section#hero.hero` | 0 | 2700 | sand |
| 2 | `section#about.about-section` | 1530 | 3120 | sand |
| 3 | `section.work_section` | 4650 | 3600 | **dark `#222` / black** |
| 4 | `section.what_you_get_section` | 8250 | 1240 | sand |
| 5 | `section.sevice_section` *(sic — typo is in the original)* | 9490 | 1234 | sand |
| 6 | `section.cta_section` | 10724 | 1056 | sand |
| 7 | `section.testimonial_section` | 11780 | 847 | sand |
| 8 | `footer.footer` | 12627 | 1235 | sand — contains giant NESH SVG **and** the FAQ block (`#faq`) |

Content container: `.container`, width `1118px` at 1440 (= 77.64vw), left edge
`x=302`. Hero uses a wider `.hero-container` at `1340px` (`x=50`).

Note: `#about` starts at y=1530 while `#hero` is 2700 tall — the hero's last
1170px are scrolled *under* the about section, which is how the pinned
`.hero-sticky` hands off.

---

## 5. Structure

```
body
└ .page-wrap
  ├ .nesh-logo-preload-wrap        fixed, preloader wordmark (4 SVG paths, DrawSVG)
  ├ header.navigation              FIXED sidebar, 266.97px wide @ left:20px
  │ └ .nav-container               auto-scaled to fit viewport height (see §7.1)
  │   ├ .profile-img-wrap          fixed, full-viewport — THE HERO PORTRAIT lives here
  │   ├ .nav-top-layout            logo + socials + blurb card
  │   ├ .nav-stats-wrap            "80+ Projects" / "7+ Years of experience"
  │   ├ .nav-menu                  7 nav pills w/ icons
  │   ├ .nav-comapny-wrap          client-logo marquee (sic)
  │   ├ .nav-email-wrap            nenad@popadic.co + copy button
  │   └ .nav-button                "Book a Call" (yellow)
  ├ main.main-wrap
  │ ├ #hero.hero  (2700px)
  │ │ └ .hero-sticky               position:sticky, 100vh
  │ │   ├ .nesh-logo-preload → .nesh-logo-wrap → .nesh-logo-ghost-wrap   (Flip source)
  │ │   ├ .hero-navigation-wrap → 2× .hero-links-ghost-wrapper           (Flip source)
  │ │   └ .hero-container
  │ │     ├ p.hero-left-text       "The Webflow Expert. / That's Nenad."
  │ │     ├ .hero-content-layout   h1.hero-heading + .hero-buttons-wrap
  │ │     ├ p.hero-right-text      3 lines
  │ │     └ .hero-cards-wrap       fixed — .hero-card-1/-2 (stats) + .hero-card-3 (traits)
  │ ├ #about.about-section         timeline: .about-card-container + curved SVG path
  │ ├ .work_section                pinned horizontal scroll, 9 project cards
  │ ├ .what_you_get_section        giant heading + scrubbed word reveal w/ inline icon chips
  │ ├ .sevice_section              3 pricing cards
  │ ├ .cta_section                 "Transform Your Webflow Experience Journey" + chat bubble
  │ └ .testimonial_section         Swiper carousel + custom drag indicator
  └ footer.footer
    ├ .footer-logo                 giant NESH® SVG (1118×294)
    └ #faq.faq-column-main         2-column accordion, 8 items (Webflow dropdowns)
```

---

## 6. Content inventory

**Hero** — H1 "Webflow, / Applied / Differently." · left "The Webflow Expert. /
That's Nenad." · right "Working closely with your team to deliver Webflow builds
that merge creativity, technical excellence, and long-term value." · buttons
"Book a Call" (yellow) + "About Me" (yellow) · cards "80+ Projects", "7+ Years of
experience" · traits Creative / Reliable / Strategist / Builder / Efficient.

**Nav (7):** HOME · ABOUT ME · PROJECTS · WHAT YOU GET · SERVICES · CLIENTS · FAQ.
Hero shows them in one row split 3 left / 4 right; sidebar shows them stacked with icons.

**About** — label "START SMALL GROW BIG", H2 "About Me (&) / My Journey", intro
"Seven years ago I opened Webflow for the first time. What happened after that is
easier to show than explain." Timeline cards, alternating left/right, joined by a
curved stroked path with yellow dots:

| Year | Title | Handle / age |
|---|---|---|
| '19 | Starting out with my brother | @stefan · 7 years ago |
| '20 | First freelance steps | @webflow · 6 years ago |
| '21 | Beyond what I knew | @fiftyseven · 5 years ago |
| '22 | Leveling up | @gsap · 4 years ago |
| '23 | From trust to referrals | @clients · 3 years ago |
| '24 | A life-changing year | @family · 2 years ago |
| '26 | The journey continues | @nenad · 2 hours ago |

(Each card has a "Read more" pill.)

**Work** — label "SELECTED WORK", H2 "Built in Webflow, / Made to Perform",
intro "Over seven years I've helped businesses across different industries turn
their ideas into websites that look and work exactly how they imagined. Here's a
look at some of that work." 9 cards, each = number badge, tag pills, background
image, floating transparent device mockup, title, description, yellow arrow button:

| # | Project | Tags |
|---|---|---|
| 01 | 1910.ai | Components · GSAP · SEO |
| 02 | SemiconBio | CMS · API · Motion |
| 03 | Happy Ring | CMS · GSAP · SEO |
| 04 | PSSLTD | CMS · GSAP · Localization |
| 05 | Lilipad | CMS · GSAP · SEO |
| 06 | Omicron | Webflow · Motion |
| 07 | Puck | Components · CMS · GSAP |
| 08 | Alosant | Performance · CMS · API |
| 09 | RAY AI | CMS · … |

**What You Get** — giant "What / You Get?", label "CAPABILITIES OVERVIEW", then a
scrubbed sentence with inline yellow icon chips: "Strategy, precision, and
development combined, turning [icon] your vision into a powerful digital [icon]
experience [icon] that feels effortless. [icon]"

**Services** — label "SERVICES", H2 "Solutions / That Deliver", intro "Same
quality, same attention to detail. The only difference is the size of the project
and what you need right now." 3 cards:

- **Ongoing Support** — $3,000 /30hours — 5 bullets — footnote "For brands that need continuous growth and long-term collaboration."
- **Starter Build** — $5,000 — 5 bullets — footnote "For new sites or migrations that need a fast, clean start"
- **Custom Project** — "Book a Call" — 5 bullets — footnote "For complex projects that go beyond the basics and need a tailored approach."

**CTA** — "Transform Your Webflow" (solid) + "Experience Journey" (gradient/faded),
paragraph, avatar + chat bubble "Have something in mind?" + typing dots.

**Testimonials** — label "TESTIMONIALS", H2 "From People / I've Worked with",
Swiper with progress-bar drag indicator. Quotes from Danette Beal (VP of
Marketing, Alosant.com), Petar Stojakovic (Founder, fiftyseven.co), Klemen …
(PM, Povio.com), …

**Footer** — giant NESH® wordmark SVG, then FAQ "Got any questions?" with 8
accordion items in 2 columns:
Why Webflow instead of custom code? · Do you handle design, or only development? ·
Already have a Webflow site that needs work? · What does ongoing support look like? ·
What's the process from start to launch? · How do you handle revisions and feedback? ·
Do you work under NDA? · Not sure which plan fits your project?

---

## 7. Animation spec (transcribed from the real engine)

### Global
```js
Lenis: { duration: 0.4, easing: t => Math.min(1, 1.001 - Math.pow(2, -10*t)), smoothWheel: true }
```
driven by `gsap.ticker` (single RAF), `ScrollTrigger` synced via `lenis.on('scroll', ScrollTrigger.update)`.
`history.scrollRestoration = 'manual'`, `window.scrollTo(0,0)` on boot.

`CONFIG = { sidebarPadding: 40, preloaderDelay: 0.2, ctaSpeed: 0.728, resizeDebounce: 150,
magneticInitDelay: 300, horizontalScrollDelay: 100 }`

### 7.1 Sidebar auto-scale
```js
scale = Math.min(1, (innerHeight - 40) / navContainer.scrollHeight)
gsap.set('.nav-container', { scale, transformOrigin: 'top left', force3D: false })
// counter-scale so these stay 1:1
gsap.set('.profile-img-wrap',        { scale: 1/scale, transformOrigin: 'top left' })
gsap.set('.nav-button p, .nav-button-secondary p', { scale: 1/scale, transformOrigin: 'center center' })
```
**Disabled below 768px.**

### 7.2 StyleEngine — the declarative system (`data-tl-*`)
Every non-signature animation in the page is declared on the element. 90
`data-tl-type="trigger"` + 37 `data-tl-type="scroll"` instances. Contract:

| Attribute | Default | Meaning |
|---|---|---|
| `data-tl-type` | — | `trigger` (toggle) or `scroll` (scrubbed, `scrub: 1`) |
| `data-tl-trigger` | `.hero` | ScrollTrigger trigger selector |
| `data-tl-start` | `900px top` | start |
| `data-tl-end` | `bottom top` | end (scroll type only) |
| `data-tl-from` / `data-tl-to` | `{}` | GSAP vars, single-quoted JSON |
| `data-tl-split` | — | `lines` / `words` / `chars` via SplitText; lines get wrapped in `.line-mask` |
| `data-tl-target` | — | animate descendants instead of self |
| `data-tl-once` | — | play once |
| `data-tl-desktop` | — | **skip entirely below 768px** (96 uses) |
| `data-number-count` | — | odometer digit roll |

Defaults for `trigger` type: `duration: 0.5`, `ease: 'power1.inOut'`,
`toggleActions: 'restart none none reverse'` (or `play none none none` with `once`).

Most-used recipes (verbatim):
- `from {'yPercent':100}` → `to {'yPercent':0,'duration':0.6,'stagger':0.1,'delay':0.3,'ease':'power2.out'}` — masked line reveal
- `from {'y':'10%','opacity':0,'scale':0.6}` → `to {'y':'0%','opacity':1,'scale':1,'duration':1.1,'delay':0.3,'ease':'expo.out'}`
- `from {'scale':0.5,'opacity':0}` → `to {'scale':1,'opacity':1}`
- `from {'clipPath':'inset(100% 0% 0% 0%)'}` → `to {'clipPath':'inset(0% 0% 0% 0%)','duration':1.5,'delay':0.2,'ease':'expo.out'}`
- `from {'opacity':0}` → `to {'opacity':1,'duration':1.4,'delay':0.8,'ease':'expo.out'}`

Timeline card starts are staggered by scroll percent on `.about-card-container`:
`-45% top`, `-22% top`, `-4% top`, `11% top`, `20% top`, `36% top`, `50% top`, `58% top`.

Odometer: track pre-set to `y = h*9`, tween to `y = -digit*h`,
`duration: 1.2`, `ease: 'power3.out'`, `stagger: 0.06`.

### 7.3 GhostEngine — the signature morph (**desktop only, <768px disabled**)
FLIP-style. Hero "ghost" elements measure their real sidebar counterparts on a
clean DOM (Phase 1, no mutation), then scrub from ghost-rect → real-rect as the
hero scrolls. Three morph types:

- **logo** — big `NESH` wordmark → small nav logo. Only this type animates explicit
  `width`/`height` and uses absolute positioning. The `®` (`.nesh-copyright-wrap`)
  is handled in a separate Phase 3 pass *after* the main logo sets
  `.nav-logo-item` to `position: relative`, using the same range (`end: '50% top'`).
- **links** — hero nav row → sidebar nav pills.
- **background** — hero glass cards → sidebar stat cards; interpolates visual
  properties, with **per-corner elliptical border-radius compensation**: each
  corner is written as `Xpx Ypx` so that after non-uniform scale `sX`/`sY` the
  visible radius stays a circle of the ghost's radius, then interpolates to the
  real element's uniform radius.

Rebuilds on resize.

### 7.4 HorizontalScroll (work section) — **desktop only, <768px disabled**
Pinned `.work-sticky`; `work-sticky-support` height computed from content;
scroll distance = section height − viewport; single tween updated on
`ScrollTrigger.refresh`. Card reveal: cards already in view stagger when the
section enters; off-screen cards animate individually as they scroll in.
`horizontalScrollDelay: 100ms` before setup.

### 7.5 ThemeSwitcher
Sidebar cards flip light↔dark by overlap with dark sections. Exact values:

| Element | Dark | Light |
|---|---|---|
| `.nav-email-wrap` | border `rgba(255,255,255,.10)`, bg `rgba(29,29,29,.60)`, color `rgba(255,255,255,.90)` | border `rgba(255,255,255,.20)`, bg `rgba(223,222,206,.80)`, color `#000` |
| `.nav-email-item` | bg `rgba(94,94,94,.50)` | bg `#C9C8BA` |
| `.nav-menu-bg` | border `rgba(255,255,255,.10)`, bg `rgba(29,29,29,.60)` | border `rgba(255,255,255,.20)`, bg `rgba(223,222,206,.80)` |
| `.nav-item-bg` | border `rgba(255,255,255,.03)`, bg `rgba(57,57,57,.90)` | border `rgba(0,0,0,.10)`, bg `#EBEADA` |
| `.nav-top-layout > .nav-top-bg` | border `rgba(255,255,255,.10)`, bg `rgba(29,29,29,.90)` | border `rgba(255,255,255,.20)`, bg `rgba(223,222,206,.80)` |
| `.social-link` | bg `#393939`, color white | (light default) |
| client logos | `.happy-ring,.semiconbio` opacity 0; `-white` variants opacity 1 | inverse |

### 7.6 Other modules
`Preloader` (DrawSVG on 4 NESH paths, `preloaderDelay: 0.2`) ·
`MagneticPositions` (absolute transforms, runs *after* TextReveal, handles
dynamically created nodes) · `CardInteractions` (alpha device-mockup hover) ·
`ProfileImage` · `CTAAnimation` (`ctaSpeed: 0.728`) · `SwiperInit` (+ custom drag
indicator, v2.5 feature) · `TextReveal` · `ImageTrail` · `ButtonHover` ·
`Clipboard` (email copy) · `ResizeHandler` (debounce 150ms).

---

## 8. Responsive behaviour

Breakpoint that matters: **768px**. Below it the engine disables
GhostEngine, HorizontalScroll, Sidebar auto-scale, and every
`data-tl-desktop` animation (96 of them), and enables MobileMenu.
Webflow's own breakpoints (991 / 767 / 479) drive layout.

Mobile (390) layout:
- Fixed top bar: yellow `NESH®` pill (left), yellow `Book a Call` pill, grid/hamburger button.
- Hero: wordmark behind portrait, traits card left, "7+" card right, H1, "80+ Projects" card, tagline.
- Sidebar is replaced by the MobileMenu overlay (reveals top→bottom, the two icon
  bars split apart with a gap offset computed as a % of icon height).
- Timeline collapses to one column with the vertical rule on the left.
- Work section becomes a normal vertical stack (no pin, no horizontal scroll).

---

## 9. Assets

67 files downloaded to `src/assets/img/` (1.1 MB) + 6 woff2 to `src/assets/fonts/`.
Project cards use **paired** assets: `Client - <Name> (Background).avif` plus
`<Name> - Transparent.avif` (the floating device mockup). Client logos are SVG,
with `-white` variants for the dark theme. Hero portrait:
`nenad_edit-photo_final-1.avif`.

> **Identity note.** The portrait, name, bio, testimonials and contact address are
> Nenad Popadic's. They are in place so the rebuild can be verified against the
> original pixel-for-pixel. Before anything is published, swap the portrait, the
> NESH wordmark, the name/bio, testimonials and the email for the client's own —
> keep layout, motion, type and colour identical. Do not publish a live copy that
> presents itself as the real person.
