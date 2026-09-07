/* Gadget Data Recovery — shared site runtime (every page loads this after gsap, ScrollTrigger and lenis)
   Exposes window.GDR = { motion, gsap, ST, lenis, EXPO, el, rnd, splitWords, onIntro, velocity }
   Pages register their own intro with GDR.onIntro(fn); elements marked data-intro get a generic staggered reveal. */
(function(){
  'use strict';
  // ?static renders the page at rest (no boot, no motion) — used for headless screenshots and as the reduced-motion path
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches || /[?&]static\b/.test(location.search);
  var G = window.gsap, ST = window.ScrollTrigger;
  var root = document.documentElement;
  root.classList.add('js'); if (RM) root.classList.add('rm');
  var svgNS = 'http://www.w3.org/2000/svg';
  function el(n, a){ var e = document.createElementNS(svgNS, n); for (var k in a) e.setAttribute(k, a[k]); return e; }
  var seed = 11; function rnd(){ seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  var intros = [];
  var GDR = window.GDR = { motion: !RM && !!G && !!ST, gsap: G, ST: ST, lenis: null, EXPO: 'expo.out', el: el, rnd: rnd, onIntro: function(fn){ intros.push(fn); }, velocity: function(){ return velocity; } };
  var velocity = 0;

  /* ---------- procedural geometry shared by pages ---------- */
  (function buildGeometry(){
    var t = document.getElementById('reticleTicks');
    if (t) { var f2 = document.createDocumentFragment(); for (var i = 0; i < 72; i++) { var major = i % 6 === 0; f2.appendChild(el('line', { x1: 167, y1: major ? 34 : 40, x2: 167, y2: 48, transform: 'rotate(' + (i*5) + ' 167 170)' })); } t.appendChild(f2); }
    var track = document.getElementById('marqueeTrack');
    if (track && !RM) { track.innerHTML += track.innerHTML; }
  })();

  /* ---------- circuit background: traces from both edges; current pulses driven by time + scroll velocity ---------- */
  var circuit = { svg: document.getElementById('circuit'), pulses: [], H: 0 };
  function buildCircuit(){
    var svg = circuit.svg; if (!svg) return;
    var W = window.innerWidth, H = Math.max(window.innerHeight, 600) * 1.6; circuit.H = H;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.style.height = H + 'px';
    var gT = document.getElementById('circuitTraces'), gP = document.getElementById('circuitPulses');
    gT.innerHTML = ''; gP.innerHTML = ''; circuit.pulses = [];
    var perSide = Math.max(10, Math.round(H / 46)); var paths = [];
    [-1, 1].forEach(function(side){
      var inner = W * 0.46;
      for (var i = 0; i < perSide; i++) {
        var y0 = 24 + (H - 48) * (i + rnd() * 0.8) / perSide;
        var bundle = rnd() < 0.3 ? 2 + Math.floor(rnd()*2) : 1;
        var segs = 2 + Math.floor(rnd()*4);
        var plan = []; var x = side < 0 ? -12 : W + 12; var y = y0; var dir = -side;
        var limit = side < 0 ? inner : W - inner;
        for (var sgi = 0; sgi < segs; sgi++) {
          var run = 50 + rnd()*200; x += dir*run;
          if ((side < 0 && x > limit) || (side > 0 && x < limit)) { x = limit - dir*(10 + rnd()*40); plan.push([x, y]); break; }
          plan.push([x, y]);
          if (sgi < segs - 1) { var jog = (rnd() < 0.5 ? -1 : 1) * (18 + rnd()*70); x += dir*Math.abs(jog); y += jog; plan.push([x, y]); }
        }
        for (var b = 0; b < bundle; b++) {
          var off = (b - (bundle-1)/2) * 13;
          var d = 'M' + (side < 0 ? -12 : W + 12) + ',' + (y0 + off);
          plan.forEach(function(pt){ d += ' L' + pt[0].toFixed(1) + ',' + (pt[1] + off).toFixed(1); });
          var last = plan[plan.length-1];
          gT.appendChild(el('path', { d: d, 'class': 'trace' }));
          if (rnd() < 0.72) gT.appendChild(el('circle', { cx: last[0], cy: last[1] + off, r: 4, 'class': 'pad' }));
          else gT.appendChild(el('rect', { x: last[0] - 5, y: last[1] + off - 5, width: 10, height: 10, 'class': 'sq' }));
          paths.push(d);
        }
      }
    });
    if (RM) return;
    var count = Math.min(18, Math.floor(paths.length * 0.32));
    for (var c = 0; c < count; c++) {
      var d2 = paths[Math.floor(rnd() * paths.length)];
      var halo = el('path', { d: d2, 'class': 'halo' }), pp = el('path', { d: d2, 'class': 'pulse' });
      gP.appendChild(halo); gP.appendChild(pp);
      var len = pp.getTotalLength(), dash = 70 + rnd()*90;
      halo.style.strokeDasharray = pp.style.strokeDasharray = dash + ' ' + (len + dash);
      circuit.pulses.push({ a: pp, b: halo, len: len, dash: dash, pos: -rnd()*len, speed: 160 + rnd()*260, wait: rnd()*3 });
    }
  }
  buildCircuit();
  var resizeT = 0; window.addEventListener('resize', function(){ clearTimeout(resizeT); resizeT = setTimeout(function(){ buildCircuit(); if (ST) ST.refresh(); }, 250); });

  /* ---------- nav compaction ---------- */
  var nav = document.getElementById('nav');
  function onScroll(){ if (nav) nav.classList.toggle('compact', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  if (!GDR.motion) {
    // no GSAP (CDN blocked) or reduced motion: never leave the boot overlay up, show the page as-is
    var bootEl = document.getElementById('boot'); if (bootEl) bootEl.style.display = 'none';
    var bar0 = document.querySelector('.progress');
    window.addEventListener('scroll', function(){ var m = root.scrollHeight - innerHeight; if (bar0) bar0.style.transform = 'scaleX(' + (m > 0 ? scrollY / m : 0) + ')'; }, { passive: true });
    return; // page is already at rest
  }

  G.registerPlugin(ST);
  var EXPO = GDR.EXPO;

  /* ---------- smooth scroll (Lenis) feeding GSAP ---------- */
  var lenis = null, lastY = window.scrollY;
  if (window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true });
    GDR.lenis = lenis;
    lenis.on('scroll', ST.update);
    G.ticker.add(function(time){ lenis.raf(time * 1000); });
    G.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach(function(a){ a.addEventListener('click', function(e){ var t = document.querySelector(a.getAttribute('href')); if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: -70 }); } }); });
  }
  var bar = document.querySelector('.progress');
  G.ticker.add(function(time, dt){
    var y = window.scrollY; var v = lenis ? lenis.velocity : (y - lastY) / Math.max(dt, 1) * 16; lastY = y;
    velocity += (v - velocity) * 0.15;
    var m = root.scrollHeight - innerHeight; if (bar) bar.style.transform = 'scaleX(' + (m > 0 ? y / m : 0) + ')';
    if (circuit.svg) {
      var pr = m > 0 ? y / m : 0;
      circuit.svg.style.transform = 'translate3d(0,' + (-(circuit.H - innerHeight) * pr).toFixed(1) + 'px,0)';
      var charge = Math.min(1, Math.abs(velocity) / 28);
      circuit.svg.style.setProperty('--charge', charge.toFixed(3));
      var boost = 1 + Math.min(6, Math.abs(velocity) / 6);
      var sdt = dt / 1000;
      circuit.pulses.forEach(function(p){
        if (p.wait > 0) { p.wait -= sdt; return; }
        p.pos += p.speed * boost * sdt;
        var off = p.len + p.dash - p.pos;
        if (off < -p.dash) { p.pos = 0; p.wait = 0.8 + rnd()*3.5; off = p.len + p.dash; }
        p.a.style.strokeDashoffset = p.b.style.strokeDashoffset = off.toFixed(1);
      });
    }
    if (marqueeTween) { marqueeTween.timeScale(1 + Math.min(4, Math.abs(velocity) / 10)); skewTo(Math.max(-12, Math.min(12, -velocity * 0.3))); }
  });

  /* ---------- probe cursor ---------- */
  if (window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
    var dot = document.querySelector('.cur'), ring = document.querySelector('.cur-ring');
    if (dot && ring) {
      root.classList.add('has-cursor');
      var dx = G.quickTo(dot, 'x', { duration: 0.08 }), dy = G.quickTo(dot, 'y', { duration: 0.08 });
      var rx = G.quickTo(ring, 'x', { duration: 0.45, ease: 'power3' }), ry = G.quickTo(ring, 'y', { duration: 0.45, ease: 'power3' });
      window.addEventListener('pointermove', function(e){ dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); G.to([dot, ring], { opacity: 1, duration: 0.3, overwrite: 'auto' }); });
      document.addEventListener('pointerleave', function(){ G.to([dot, ring], { opacity: 0, duration: 0.3 }); });
      document.querySelectorAll('a, button, input, select, textarea, label').forEach(function(a){
        a.addEventListener('pointerenter', function(){ G.to(ring, { scale: 1.9, borderColor: 'rgba(232,163,61,.95)', duration: 0.35, ease: EXPO }); G.to(dot, { scale: 0.5, duration: 0.3 }); });
        a.addEventListener('pointerleave', function(){ G.to(ring, { scale: 1, borderColor: 'rgba(232,163,61,.7)', duration: 0.4, ease: EXPO }); G.to(dot, { scale: 1, duration: 0.3 }); });
      });
    }
  }

  /* ---------- 21st.dev "Words Stagger" (tom_ui), ported to GSAP ---------- */
  function splitWords(rootEl){
    var spans = [];
    (function walk(node){
      Array.prototype.slice.call(node.childNodes).forEach(function(ch){
        if (ch.nodeType === 3) {
          var raw = ch.textContent, words = raw.split(/\s+/).filter(Boolean); if (!words.length) return;
          var frag = document.createDocumentFragment();
          if (/^\s/.test(raw)) frag.appendChild(document.createTextNode(' '));
          words.forEach(function(w, i){ var sp = document.createElement('span'); sp.className = 'w'; sp.textContent = w; frag.appendChild(sp); spans.push(sp); if (i < words.length - 1) frag.appendChild(document.createTextNode(' ')); });
          if (/\s$/.test(raw)) frag.appendChild(document.createTextNode(' '));
          node.replaceChild(frag, ch);
        } else if (ch.nodeType === 1) walk(ch);
      });
    })(rootEl);
    return spans;
  }
  GDR.splitWords = splitWords;

  /* ---------- generic page hero: [data-intro] elements stagger in after the boot wipe; data-intro="words" gets the word stagger ---------- */
  var introEls = Array.prototype.slice.call(document.querySelectorAll('[data-intro]'));
  var introWords = [];
  introEls.forEach(function(e){
    if (e.getAttribute('data-intro') === 'words') { var ws = splitWords(e); G.set(ws, { opacity: 0, y: 12, filter: 'blur(10px)' }); introWords.push(ws); }
    else G.set(e, { opacity: 0, y: 14 });
  });
  function genericIntro(){
    var t = G.timeline(); var at = 0;
    introEls.forEach(function(e, i){
      if (e.getAttribute('data-intro') === 'words') { var ws = introWords.shift(); t.to(ws, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6, ease: 'power2.out', stagger: 0.07 }, at); at += 0.25; }
      else { t.to(e, { opacity: 1, y: 0, duration: 0.7, ease: EXPO }, at); at += 0.1; }
    });
  }

  /* ---------- boot sequence, then every registered intro ---------- */
  var boot = document.getElementById('boot');
  var booted = false;
  function runIntros(){ if (introEls.length) genericIntro(); intros.forEach(function(fn){ try { fn(); } catch (e) { console.warn(e); } }); ST.refresh(); }
  function runBoot(){
    if (booted) return; booted = true;
    if (!boot) { runIntros(); return; }
    G.timeline()
      .to('#boot .bar i', { scaleX: 1, duration: 0.45, ease: 'power2.inOut' })
      .to('#boot .t', { letterSpacing: '.5em', opacity: 0, duration: 0.5, ease: 'power2.in' }, '-=0.2')
      .to(boot, { clipPath: 'inset(0 0 100% 0)', duration: 0.6, ease: 'expo.inOut' }, '-=0.25')
      .set(boot, { display: 'none' })
      .add(runIntros, '-=0.55');
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(runBoot);
  setTimeout(runBoot, 900);

  /* ---------- stats: count-ups + rules ---------- */
  document.querySelectorAll('[data-count]').forEach(function(n){
    var target = parseFloat(n.getAttribute('data-count')); n.textContent = '0';
    ST.create({ trigger: n, start: 'top 85%', once: true, onEnter: function(){ var o = { v: 0 }; G.to(o, { v: target, duration: 1.4, ease: 'power3.out', onUpdate: function(){ n.textContent = String(Math.round(o.v)); } }); } });
  });
  var stats = Array.prototype.slice.call(document.querySelectorAll('.stat'));
  stats.forEach(function(st){ st.classList.add('pre'); });
  if (stats.length) ST.create({ trigger: stats[0].parentNode, start: 'top 80%', once: true, onEnter: function(){ stats.forEach(function(st, i){ setTimeout(function(){ st.classList.add('in'); }, i*120); }); } });
  if (document.querySelector('.stats')) G.from('.stat', { opacity: 0, y: 24, duration: 0.9, ease: EXPO, stagger: 0.1, scrollTrigger: { trigger: '.stats', start: 'top 85%', once: true } });

  /* ---------- scenes: arm now, fire on enter; light parallax against the copy ---------- */
  document.querySelectorAll('.scene').forEach(function(sc){
    sc.classList.add('pre');
    ST.create({ trigger: sc, start: 'top 68%', once: true, onEnter: function(){ sc.classList.remove('pre'); sc.classList.add('in'); } });
    G.fromTo(sc, { yPercent: 6, scale: 0.96 }, { yPercent: -6, scale: 1, ease: 'none', scrollTrigger: { trigger: sc, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  /* ---------- copy reveals ---------- */
  document.querySelectorAll('.reveal-group').forEach(function(grp){
    G.from(grp.children, { opacity: 0, y: 22, duration: 0.9, ease: EXPO, stagger: 0.09, scrollTrigger: { trigger: grp, start: 'top 78%', once: true } });
  });
  document.querySelectorAll('.reveal').forEach(function(e, i){
    G.from(e, { opacity: 0, y: 16, duration: 0.9, ease: EXPO, delay: (i % 3) * 0.08, scrollTrigger: { trigger: e, start: 'top 85%', once: true } });
  });
  document.querySelectorAll('.draw-list').forEach(function(list){
    G.from(list.children, { opacity: 0, x: -14, duration: 0.7, ease: EXPO, stagger: 0.08, scrollTrigger: { trigger: list, start: 'top 80%', once: true } });
  });

  /* ---------- bench band: photo parallax ---------- */
  document.querySelectorAll('.band').forEach(function(band){
    var img = band.querySelector('.band-img'); if (!img) return;
    var tl = G.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: band, start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
    tl.fromTo(img, { yPercent: -7, scale: 1.12, transformOrigin: '50% 50%' }, { yPercent: 7, scale: 1.02 }, 0);
    var copy = band.querySelector('.copy'); if (copy) tl.fromTo(copy, { y: 40 }, { y: -40 }, 0);
  });

  /* ---------- marquee: infinite, velocity-reactive ---------- */
  var marqueeTween = null, skewTo = function(){};
  (function(){
    var track = document.getElementById('marqueeTrack'); if (!track) return;
    track.style.animation = 'none';
    marqueeTween = G.to(track, { xPercent: -50, ease: 'none', duration: 34, repeat: -1 });
    skewTo = G.quickTo(track, 'skewX', { duration: 0.5, ease: 'power3' });
    track.parentNode.addEventListener('pointerenter', function(){ G.to(marqueeTween, { timeScale: 0.15, duration: 0.6 }); });
    track.parentNode.addEventListener('pointerleave', function(){ G.to(marqueeTween, { timeScale: 1, duration: 0.6 }); });
  })();

  /* ---------- final CTA ---------- */
  if (document.querySelector('.cta-final')) G.from('.cta-final > *', { opacity: 0, y: 22, duration: 0.9, ease: EXPO, stagger: 0.1, scrollTrigger: { trigger: '.cta-final', start: 'top 80%', once: true } });

  /* ---------- magnetic primary buttons ---------- */
  if (window.matchMedia('(hover:hover)').matches) {
    document.querySelectorAll('.magnetic').forEach(function(btn){
      var mx = G.quickTo(btn, 'x', { duration: 0.4, ease: 'power3' }), my = G.quickTo(btn, 'y', { duration: 0.4, ease: 'power3' });
      btn.addEventListener('pointermove', function(e){ var r = btn.getBoundingClientRect(); mx((e.clientX - r.left - r.width/2) * 0.22); my((e.clientY - r.top - r.height/2) * 0.28); });
      btn.addEventListener('pointerleave', function(){ mx(0); my(0); });
    });
  }
  window.addEventListener('load', function(){ ST.refresh(); });
})();
