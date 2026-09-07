/* Gadget Data Recovery — homepage: the board-swap story (needs assets/site.js loaded first) */
(function(){
  'use strict';
  var GDR = window.GDR; if (!GDR) return;
  var el = GDR.el, rnd = GDR.rnd;

  /* hero board: a few hundred passives (MLCCs / resistors) scattered between the parts, like a real logic board */
  var pv = document.querySelector('#pcbArt .passives');
  if (pv) {
    var blocks = [[578,0,182,104],[40,40,130,110],[40,296,150,94],[662,140,78,150],[300,120,150,150],[520,150,120,150],[200,60,60,40],[280,50,40,40],[470,48,70,46],[200,300,50,50],[400,300,80,60],[520,320,60,40],[600,316,50,44],[230,180,40,30],[520,60,30,30],[200,230,70,30],[60,180,110,90],[600,230,44,60],[320,388,120,14]];
    function free(x, y, w, h){ for (var i = 0; i < blocks.length; i++) { var bk = blocks[i]; if (x < bk[0]+bk[2]+4 && x+w > bk[0]-4 && y < bk[1]+bk[3]+4 && y+h > bk[1]-4) return false; } return true; }
    var frag = document.createDocumentFragment(), placed = 0, tries = 0;
    while (placed < 260 && tries < 4000) {
      tries++;
      var vert = rnd() < 0.5, w = vert ? 3 : 7, h = vert ? 7 : 3;
      var x = 24 + rnd()*(736 - w - 24), y = 24 + rnd()*(396 - h - 24);
      if (!free(x, y, w, h)) continue;
      blocks.push([x, y, w, h]); placed++;
      var body = el('rect', { x: x.toFixed(1), y: y.toFixed(1), width: w, height: h, fill: '#a3a8ad' });
      var mid = vert ? el('rect', { x: x.toFixed(1), y: (y+2).toFixed(1), width: w, height: h-4, fill: rnd() < 0.7 ? '#6b5642' : '#2b2e33' }) : el('rect', { x: (x+2).toFixed(1), y: y.toFixed(1), width: w-4, height: h, fill: rnd() < 0.7 ? '#6b5642' : '#2b2e33' });
      frag.appendChild(body); frag.appendChild(mid);
    }
    pv.appendChild(frag);
  }

  if (!GDR.motion) return; // reduced motion / no GSAP: CSS shows the finished frame

  var G = GDR.gsap, ST = GDR.ST, EXPO = GDR.EXPO;

  /* ---------- hero text + board placement ---------- */
  var l1words = GDR.splitWords(document.getElementById('l1'));
  G.set(l1words, { opacity: 0, y: 12, filter: 'blur(10px)' });
  G.set(['.story-copy .kicker', '.hud', '.hint'], { opacity: 0, y: 10 });
  var deskBoard = window.matchMedia('(min-width:901px)');
  function boardBaseY(){ return deskBoard.matches ? -50 : 0; }
  function placeBoard(){ G.set('.story-board', { yPercent: boardBaseY(), xPercent: 0 }); G.set('#storyPhoto', { yPercent: boardBaseY() }); }
  placeBoard(); deskBoard.addEventListener('change', placeBoard);

  GDR.onIntro(function(){
    var t = G.timeline();
    t.to('.story-copy .kicker', { opacity: 1, y: 0, duration: 0.6, ease: EXPO })
     .to(l1words, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6, ease: 'power2.out', stagger: 0.09 }, '-=0.3')
     .to(['.hud', '.hint'], { opacity: 1, y: 0, duration: 0.7, ease: EXPO, stagger: 0.1 }, '-=0.3')
     .fromTo('.story-board', { opacity: 0, x: 60 }, { opacity: 1, x: 0, duration: 1.2, ease: EXPO }, 0.1)
     .to('#cracks path', { strokeDashoffset: 0, duration: 0.5, ease: 'power2.out', stagger: 0.05 }, 0.5);
    G.to('.hint i', { scaleX: 0.2, repeat: -1, yoyo: true, duration: 1.1, ease: 'sine.inOut' });
  });

  /* ---------- the story: smashed phone → donor board → chips lifted → board swap → data back ---------- */
  var hudStage = document.getElementById('hudStage'), hudGrip = document.getElementById('hudGrip'), hudLift = document.getElementById('hudLift'), hudTemp = document.getElementById('hudTemp');
  function clamp01(v){ return Math.max(0, Math.min(1, v)); }
  var story = G.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: '.story', start: 'top top', end: 'bottom bottom', scrub: 0.9,
      onUpdate: function(self){
        var p = self.progress;
        hudStage.textContent = p < 0.14 ? '01 · Smashed' : p < 0.32 ? '02 · Donor board' : p < 0.64 ? '03 · Chips lifted' : p < 0.9 ? '04 · Board swap' : '05 · Data back';
        var gripping = (p >= 0.30 && p < 0.44) || (p >= 0.54 && p < 0.66);
        hudGrip.textContent = gripping ? 'Closed' : 'Open';
        var lift = p < 0.5 ? clamp01((p - 0.32) / 0.12) : clamp01((p - 0.57) / 0.1);
        if (p >= 0.78) lift = 1 - clamp01((p - 0.78) / 0.1);
        hudLift.textContent = (lift * 3.2).toFixed(1) + ' mm';
        var t = p < 0.78 ? 25 : p < 0.92 ? 25 + clamp01((p - 0.78) / 0.14) * 193 : 218 - clamp01((p - 0.92) / 0.08) * 120;
        hudTemp.textContent = Math.round(t) + ' °C';
      } }
  });
  story
    .to('#phone', { scale: 1.22, opacity: 0, transformOrigin: '50% 50%', duration: 0.12, ease: 'power1.in' }, 0)
    .to('#donorBoard', { opacity: 1, duration: 0.1 }, 0.03)
    .to('.story-board', { scale: 1.06, transformOrigin: '55% 50%', duration: 0.25 }, 0)
    .to('.hint', { opacity: 0, duration: 0.05 }, 0.02)
    .to(['#calloutCPU .lead', '#calloutNAND .lead'], { strokeDashoffset: 0, duration: 0.08, stagger: 0.03 }, 0.13)
    .to(['#calloutCPU .label', '#calloutNAND .label'], { opacity: 1, duration: 0.05, stagger: 0.03 }, 0.19)
    .fromTo('#tweezers', { x: 200, y: 1200 }, { x: 688, y: 522, duration: 0.14, ease: 'power1.out' }, 0.16)
    .to('#tweezerUpper', { rotation: 2.5, transformOrigin: '0% 100%', duration: 0.03 }, 0.30)
    .to('#calloutCPU', { opacity: 0, duration: 0.04 }, 0.30)
    .to('#chipCPU', { x: -60, y: -270, rotation: -8, scale: 1.08, transformOrigin: '50% 50%', duration: 0.12, ease: 'power1.in' }, 0.32)
    .to('#tweezers', { x: 628, y: 252, duration: 0.12, ease: 'power1.in' }, 0.32)
    .to('#shCPU', { opacity: 0, duration: 0.1 }, 0.32)
    .to('#tweezerUpper', { rotation: 0, duration: 0.03 }, 0.44)
    .to('#tweezers', { x: 906, y: 552, duration: 0.08, ease: 'power1.inOut' }, 0.46)
    .to('#calloutNAND', { opacity: 0, duration: 0.04 }, 0.46)
    .to('#tweezerUpper', { rotation: 2.5, duration: 0.03 }, 0.54)
    .to('#chipNAND', { x: 20, y: -250, rotation: 6, scale: 1.06, transformOrigin: '50% 50%', duration: 0.1, ease: 'power1.in' }, 0.57)
    .to('#tweezers', { x: 926, y: 302, duration: 0.1, ease: 'power1.in' }, 0.57)
    .to('#shNAND', { opacity: 0, duration: 0.08 }, 0.57)
    .to('#l1', { opacity: 0.35, duration: 0.06 }, 0.6)
    .to('#tweezers', { x: 1600, y: 1000, duration: 0.1, ease: 'power1.in' }, 0.66)
    .to('#donorBoard', { x: -1300, opacity: 0, duration: 0.14, ease: 'power1.in' }, 0.64)
    .fromTo('#newBoard', { x: 1300, opacity: 0 }, { x: 0, opacity: 1, duration: 0.16, ease: 'power2.out' }, 0.66)
    .to('#chipCPU', { x: 0, y: 0, rotation: 0, scale: 1, duration: 0.1, ease: 'power2.in' }, 0.78)
    .fromTo('#flashCPU', { opacity: 0, scale: 0.8, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1.12, duration: 0.03 }, 0.88)
    .to('#flashCPU', { opacity: 0, duration: 0.04 }, 0.91)
    .to('#chipNAND', { x: 0, y: 0, rotation: 0, scale: 1, duration: 0.09, ease: 'power2.in' }, 0.83)
    .fromTo('#flashNAND', { opacity: 0, scale: 0.8, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1.12, duration: 0.03 }, 0.92)
    .to('#flashNAND', { opacity: 0, duration: 0.04 }, 0.95)
    .to('#fpTraces path', { strokeDashoffset: 0, duration: 0.06, stagger: 0.005 }, 0.9)
    .to('#l2', { opacity: 1, duration: 0.06 }, 0.9)
    .fromTo('#ph3', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.06, ease: 'power2.out' }, 0.93)
    .to('.story-board', { opacity: 0, duration: 0.04 }, 0.9)
    .fromTo('#storyPhoto', { opacity: 0, scale: 1.06 }, { opacity: 1, scale: 1, duration: 0.06, ease: 'power2.out' }, 0.92);
  if (GDR.flag('nostory')) story.scrollTrigger.disable();

  /* ---------- 21st.dev "Beams Background" (jahed), ported, recoloured to the bench ---------- */
  (function beams(){
    var canvas = document.getElementById('beams'), host = document.getElementById('stage');
    if (!canvas || !host || GDR.lite || GDR.flag('nobeams')) return; var ctx = canvas.getContext('2d'); if (!ctx) return;
    window.addEventListener('gdr:lite', function(){ visible = false; ctx.clearRect(0,0,width,height); });
    var density = 14, speed = 0.55, aberration = 3, opacity = 42, width = 0, height = 0, time = 0, visible = true;
    function noise(x, t){ return (Math.sin(x*0.01 + t) + Math.sin(x*0.03 + t*2)*0.5 + Math.sin(x*0.1 + t*4)*0.25) / 1.75; }
    function resize(){ width = Math.max(1, Math.floor(host.offsetWidth/4)); height = Math.max(1, Math.floor(host.offsetHeight/4)); canvas.width = width; canvas.height = height; }
    var frameToggle = false;
    function drawBeam(x, t, color, widthMod){ var n = noise(x, t*0.5), bh = height*(0.6 + n*0.4), bw = (width/density)*widthMod; var gr = ctx.createLinearGradient(x, height, x, height - bh); gr.addColorStop(0, color); gr.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(x - bw/2, height); ctx.lineTo(x + bw/2, height); ctx.lineTo(x + bw, height - bh); ctx.lineTo(x - bw, height - bh); ctx.fill(); }
    function draw(){
      if (!visible) return;
      frameToggle = !frameToggle; if (frameToggle) return; // 30fps is plenty for an ambient layer
      ctx.clearRect(0,0,width,height); ctx.globalCompositeOperation = 'screen'; time += 0.01*speed; var bw = width/density;
      for (var i = 0; i <= density; i++) { var x = i*bw;
        drawBeam(x - aberration, time + i*0.1, 'rgba(232,163,61,' + ((opacity/100)*(0.5 + 0.5*Math.cos(i*0.5 + time))*0.5) + ')', 1.5);
        drawBeam(x + aberration, time + i*0.12 + 10, 'rgba(120,190,215,' + ((opacity/100)*(0.5 + 0.5*Math.sin(i*0.6 + time*1.1))*0.35) + ')', 1.5);
        drawBeam(x, time + i*0.1 + 5, 'rgba(255,240,220,' + ((opacity/100)*(0.6 + 0.4*Math.sin(i*0.3 - time))*0.22) + ')', 0.8); }
    }
    window.addEventListener('resize', resize); resize(); G.ticker.add(draw);
    ST.create({ trigger: host, start: 'top bottom', end: 'bottom top', onToggle: function(s){ visible = s.isActive; } });
  })();

  /* ---------- hero pointer parallax on the board ---------- */
  (function(){
    var stage = document.getElementById('stage'), board = document.querySelector('.story-board');
    if (!stage || !board || !window.matchMedia('(hover:hover)').matches) return;
    var bx = G.quickTo(board, 'xPercent', { duration: 0.9, ease: 'power3' }), by = G.quickTo(board, 'yPercent', { duration: 0.9, ease: 'power3' });
    stage.addEventListener('pointermove', function(e){ var r = stage.getBoundingClientRect(); bx(((e.clientX - r.left)/r.width - 0.5) * 2.4); by(boardBaseY() + ((e.clientY - r.top)/r.height - 0.5) * 2.4); });
    stage.addEventListener('pointerleave', function(){ bx(0); by(boardBaseY()); });
  })();
})();
