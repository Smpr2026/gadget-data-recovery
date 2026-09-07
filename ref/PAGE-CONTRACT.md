# Gadget Data Recovery — page contract

Every page in this site is a plain HTML file at the repo root that loads the shared kit. Follow this exactly so the nav, footer, background, smooth scroll and motion match the homepage (`index.html`, the reference implementation).

## Files

| Page | File | Nav label |
| --- | --- | --- |
| Home | `index.html` (done) | Home |
| Data recovery | `data-recovery.html` | Data Recovery |
| Board repairs | `board-repairs.html` | Board Repairs |
| Trade & B2B | `trade.html` | Trade & B2B |
| Contact | `contact.html` | Contact |
| Customer portal | `portal.html` | Book / Track (amber button) |

Copy and structure come from the Claude Design sources in `ref/design/GDR *.dc.html`. Keep George's wording; you may tighten it. Those sources use a fake framework (`sc-if`, `{{ }}`, `style-hover`, inline styles): translate everything into real HTML + classes from `assets/site.css`, never copy inline styles.

## Skeleton (copy verbatim, change only the title/description/current link)

```html
<!DOCTYPE html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Data Recovery — Gadget Data Recovery</title>
<meta name="description" content="…">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/site.css">
<style>/* page-specific rules only, use the tokens */</style>
</head>
<body>
<div class="progress" aria-hidden="true"></div>
<div id="boot" aria-hidden="true"><div class="t">GADGET DATA RECOVERY</div><div class="bar"><i></i></div></div>
<div class="cur" aria-hidden="true"></div><div class="cur-ring" aria-hidden="true"></div>
<svg class="circuit" id="circuit" aria-hidden="true"><g id="circuitTraces"></g><g id="circuitPulses"></g></svg>

<nav class="nav" id="nav" aria-label="Primary">
  <div class="wrap">
    <a href="index.html" class="brand" aria-label="Gadget Data Recovery home"><b>GADGET</b><span>DATA RECOVERY</span></a>
    <a href="portal.html" class="btn btn-primary nav-cta">Book</a>
    <button class="nav-toggle" id="navToggle" type="button" aria-expanded="false" aria-controls="navLinks" aria-label="Menu"><span></span></button>
    <div class="links" id="navLinks">
      <a href="index.html">Home</a>
      <a href="data-recovery.html" aria-current="page">Data Recovery</a>
      <a href="board-repairs.html">Board Repairs</a>
      <a href="trade.html">Trade &amp; B2B</a>
      <a href="contact.html">Contact</a>
      <a href="portal.html" class="btn btn-primary">Book / Track</a>
    </div>
  </div>
</nav>

<!-- page content: header.page-hero, then sections -->

<footer>
  <div class="wrap">
    <div class="id"><b>Gadget Data Recovery</b><span>DATA RECOVERY · MICROSOLDERING · BOARD-LEVEL REPAIR · SYDNEY</span></div>
    <nav aria-label="Footer">
      <a href="data-recovery.html">Data Recovery</a>
      <a href="board-repairs.html">Board Repairs</a>
      <a href="trade.html">Trade &amp; B2B</a>
      <a href="contact.html">Contact</a>
    </nav>
  </div>
</footer>

<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1.3.26/dist/lenis.min.js"></script>
<script src="assets/site.js"></script>
<script>/* page-specific JS only; window.GDR is available: { motion, gsap, ST, lenis, EXPO, el, rnd, splitWords, onIntro(fn), velocity() } */</script>
</body>
</html>
```

`aria-current="page"` goes on the link for the current page only (on `portal.html` put it on the Book / Track button).

## What `assets/site.js` already does for you (do not re-implement)

- Boot wipe, probe cursor, circuit background with current pulses, sticky nav compaction, scroll progress bar, Lenis smooth scroll, `prefers-reduced-motion` handling (the page must look finished with JS off: never rely on JS to make content visible).
- `[data-intro]` — hero elements get a staggered fade-up after the boot. Use `data-intro="words"` on the h1 for the word-by-word stagger (h1 text must be plain text or spans, no nested block elements).
- `.reveal` — single element fades up when scrolled into view. `.reveal-group` — its direct children stagger in. `.draw-list` — children slide in from the left in sequence (use on step lists).
- `.scene` figures — on enter, `.lead` paths (with `pathLength="1"`) draw in, `.label` groups fade in, `.chip-glow` fades in, `.pulse` circles pulse; the figure also gets light scroll parallax. Use `style="--i:N"` on each callout to stagger. Copy the pattern from `index.html` (`#sceneBoard`).
- `.band` with an `<img class="band-img">` inside gets scroll parallax. `.stats` / `.stat` with `[data-count="10"]` spans count up.
- `#marqueeTrack` inside `.marquee` becomes an infinite, scroll-velocity-reactive marquee.
- `.btn.magnetic` buttons pull toward the pointer.

## Classes and tokens available (`assets/site.css`)

Tokens: `--bg --bg-2 --bg-3 --ink --ink-2 --mute --line --amber --amber-2 --amber-ink --amber-dim --copper --gold --pcb --scope --sans --mono --ease-out --wrap`.
Layout: `.wrap` (1240px, 32px gutters). Type helpers: `.mono` (small uppercase mono label). Buttons: `.btn .btn-primary .btn-ghost .magnetic`, links `.arrow-link` (with the inline arrow SVG from index.html).
Sections from the homepage you may reuse: `.stats > .wrap > .row > .stat (.n .l)`, `.services .svc (.text .tag h3 p) + figure.scene (.cap)`, `.svc.flip`, `.band (.band-img .veil .copy .k h2 p)`, `.brands .marquee .track .item`, `.cta-final (h2 p .row)`.

Add page-specific rules in the page's own `<style>` using the tokens. Keep new class names prefixed with the page (`.dr-`, `.br-`, `.tr-`, `.ct-`, `.pt-`).

## Design rules (George's, non-negotiable)

- No boxed card grids. The design sources use bordered cards everywhere; do not reproduce them. Lay the same content out as open rows or a two-column list with hairline rules (`border-top:1px solid var(--line)`), leading mono numerals or amber marks, generous spacing. Never `border-left` accent stripes, never gradient text.
- Photos are faded into the page (masks / vignettes), never framed in boxes. Available edited photos: `assets/cpu-tweezers.jpg` (399×501, CPU held on tweezers), `assets/board-labeled.jpg` (486×250, board with UFS/CPU/RAM/EEPROM, use with amber callouts), `assets/scope-gold-ic.jpg` (335×340, gold die under the scope), `assets/chip-reball.jpg` (399×400, reballed chip), `assets/scope-boards.jpg` (399×501, split sandwich board). Originals in `assets/src/`. They are small: display at most ~560px wide, or full-bleed only behind a `.veil` in a `.band`.
- Amber on near-black, Space Grotesk + IBM Plex Mono only. Mono is for instrument-style labels, not body copy. One kicker per hero is fine; do not put a tracked uppercase eyebrow above every section.
- Numbered steps are allowed only where the content is a real sequence (the 4-step process on Data recovery and Trade).
- Body text ≥ 15px, contrast ≥ 4.5:1 (`--ink-2` on `--bg` is fine; `--mute` is for labels only). Headings `text-wrap: balance`. Every image has real alt text.
- Motion: one hero moment (data-intro), reveals that fit the content, nothing decorative on every section. Use `GDR.onIntro` or ScrollTrigger for anything custom, always guarded by `if (GDR.motion)`.
- Mobile: no horizontal overflow at 390px. Test it.
- Phone number: (02) 8957 1077 → `tel:0289571077`. Address as in the Contact source. Business hours as in the Contact source. Kingsgrove, Sydney.

## Portal specifics (`portal.html`)

Rebuild the demo portal from `ref/design/GDR Portal.dc.html` in vanilla JS: login (any email signs in; guest button), dashboard with tabs My jobs / New booking / Pricing, jobs persisted in `localStorage` under `gdr-portal-jobs`, sample job `GDR-1042`, the booking form with the CPU/NAND note, the 7-step progress track, the pricing table. Keep the "DEMO PORTAL" note. Forms need visible labels, focus styles, inline error text next to the field. It is an app screen: tighter, product register, but still on the shared kit.

## Verification each page must pass before it is done

1. `node --check` on any inline script you wrote (extract it to a temp file).
2. Render with headless Chrome from the repo root (a static server on any free port). Append `?static` to the URL: it renders the page at rest (no boot wipe, no motion, every reveal in its final state), which is what you want for a layout check. E.g.
   `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars --window-size=1440,2400 --virtual-time-budget=6000 --screenshot=/tmp/<page>-desktop.png "http://127.0.0.1:<port>/<page>.html?static"`
   and again with `--window-size=390,2600` for mobile. Look at both screenshots (Read the PNG) and fix what is wrong. Then render once more WITHOUT `?static` to confirm the boot wipe clears and the hero intro plays (the capture may land mid-animation; that is fine, it must just not be blank).
3. No horizontal overflow at 390px, no console errors (run with `--enable-logging=stderr --v=0` and grep for `Uncaught`), every nav/footer link points at an existing file, every `assets/*` reference exists.
