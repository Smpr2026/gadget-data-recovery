# Gadget Data Recovery — website

Static site for Gadget Data Recovery, the board-level repair and data-recovery lab at Sydney Mobile Phone Repairs, Kingsgrove.

- `index.html` — homepage with the pinned board-swap scroll sequence
- `data-recovery.html`, `board-repairs.html`, `trade.html`, `contact.html`, `portal.html` — service pages, contact, and the demo customer portal (localStorage)
- `sw.js` — service worker: caches the kit and photos, pages stay network-first
- `ref/PAGE-CONTRACT.md` — how every page is built; `ref/render-all.sh` renders all pages headless for review
- `assets/site.css`, `assets/site.js` — shared design kit and motion runtime (GSAP + Lenis)
- `assets/home.js` — homepage story
- `assets/*.jpg` — bench photos (edited); originals in `assets/src/`
- `build.py` — builds `gadget-data-recovery-standalone.html`, a single-file homepage with everything inlined
- `ref/` — design sources pulled from the Claude Design project, page contract, earlier versions

Published with GitHub Pages from the `main` branch.
