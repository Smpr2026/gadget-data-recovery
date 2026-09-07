# Original homepage (Claude Design project, pulled 2026-09-07)

Source: claude.ai/design project `3641a6f7-f094-47e5-a0c8-aa496b902c5a`, file `Gadget Data Recovery.dc.html` (13.5 KB).
Sibling pages in the same project: `GDR Data Recovery.dc.html`, `GDR Board Repairs.dc.html`, `GDR Trade B2B.dc.html`, `GDR Contact.dc.html`, `GDR Portal.dc.html`, plus `SMPR Microsoldering.dc.html` and `support.js` (69 KB shared helper).

## Photos the original used (assets/ in the design project)

| File | Subject | Rebuilt in index.html as |
| --- | --- | --- |
| cpu-tweezers.png | iPhone CPU (BGA) lifted off the logic board on tweezers | Hero scene: floating gold substrate with ball grid, tweezers, pad-grid board, light sweep, pointer parallax |
| board-labeled.png | Green phone board with UFS / CPU / RAM / EEPROM labelled in green | Data-recovery scene: PCB with the four chips, amber callouts that draw in on scroll, UFS glow, "data out" pulse |
| scope-gold-ic.png | Gold die with bond wires under the microscope | Board-repairs scene: circular scope view, reticle that rotates, bond wires that draw in, focus breathing |
| chip-reball.png | Reballed chip held in tweezers | Trade scene: tilted chip with 300 balls that reflow in a wave, tweezers |
| scope-boards.png | Split board layers under the scope | Bench band: lower board + interposer layer that lifts as you scroll, heat shimmer |
| chip-hand.png | Reballed chip on a fingertip | Not used (original homepage did not use it either) |

## Original layout (kept)

Sticky nav → full-bleed hero (copy left, photo right, faded into the page) → four open stats on a hairline rule → three alternating service rows (Data recovery, Board-level repairs, Trade & B2B) with photos radial-faded, no borders → full-width bench band faded top and bottom → brand list → "Don't bin it. Bring it in." CTA → footer.

George's feedback recorded in the design chat: no boxed cards, fade the photos into the site.

## Original tokens (kept)

- Background `#0c0e10`, footer `#0f1114`, rules `#23262b`
- Ink `#e8e6e1`, secondary `#b8bcc2`, muted `#8a8f96`
- Amber `#e8a33d`, hover `#f2bc6a`, amber-on-button ink `#131007`
- Space Grotesk (display + body), IBM Plex Mono (labels)

## Rebuild history (local)
- v1 `ref/index.v1-motion.html` — Motion library, five animated SVG scenes, circuit background.
- v2 `ref/index.v2-lift.html` — GSAP + Lenis, pinned hero where the CPU lifts off a green board.
- v3 `index.html` — realistic dark logic board (edge BGA, shield cans, 260 passives), board-swap sequence: smashed phone → donor board → CPU + NAND lifted → replacement board → chips reflowed → traces lit.
- v3.1 `index.html` — George's real bench photos back in (pulled from the design project, canvas-graded warm/dark, vignetted, labels cropped off): board photo with amber callouts, scope photo with live reticle, reball photo, bench band photo with parallax, and the hero board-swap crossfades into the real CPU-on-tweezers shot. `assets/src/` holds the untouched originals; `gadget-data-recovery-standalone.html` is the single-file build with photos embedded.
