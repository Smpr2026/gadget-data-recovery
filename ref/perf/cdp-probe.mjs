// Usage: node ref/perf/cdp-probe.mjs <label> <url> [tracefile]
// Drives a headed Chrome (remote-debugging-port 9333): loads url, waits for boot, then measures rAF frame
// intervals at idle (2.5s) and during a 3.5s programmatic scroll, optionally recording a CDP trace meanwhile.
import fs from 'node:fs';
import { execSync } from 'node:child_process';
const [label, url, traceFile] = process.argv.slice(2);
const port = 9333;
const res = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' });
const target = await res.json();
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
let id = 0; const pending = new Map(); const events = []; let traceEvents = [];
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); } else if (d.method) { events.push(d); if (d.method === 'Tracing.dataCollected') traceEvents.push(...d.params.value); } };
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const waitFor = (method, timeout = 20000) => new Promise((r) => { const t0 = Date.now(); (function poll(){ const e = events.find(e => e.method === method); if (e) return r(e); if (Date.now() - t0 > timeout) return r(null); setTimeout(poll, 50); })(); });
await send('Page.enable'); await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: +(process.env.PW || 1440), height: +(process.env.PH || 900), deviceScaleFactor: 2, mobile: false });
await send('Page.navigate', { url });
await waitFor('Page.loadEventFired');
await new Promise(r => setTimeout(r, 4000));
if (traceFile) await send('Tracing.start', { categories: 'disabled-by-default-devtools.timeline,blink,cc,viz,gpu,disabled-by-default-devtools.timeline.frame', transferMode: 'ReportEvents' });
const probe = `(async()=>{const stats=(ms)=>new Promise(r=>{const t=[];let l=performance.now();const t0=l;requestAnimationFrame(function f(n){t.push(n-l);l=n;if(n-t0<ms)requestAnimationFrame(f);else{t.shift();const raw=t.slice();t.sort((a,b)=>a-b);const mean=t.reduce((a,b)=>a+b,0)/t.length;r({frames:t.length,mean:+mean.toFixed(1),p95:+t[Math.floor(t.length*.95)].toFixed(1),max:+t[t.length-1].toFixed(1),slow:raw.filter(d=>d>34).length})}})});
window.scrollTo(0,0);await new Promise(r=>setTimeout(r,500));const idle=await stats(2500);const y=Math.min(document.documentElement.scrollHeight-innerHeight,5000);if(window.GDR&&GDR.lenis)GDR.lenis.scrollTo(y,{duration:3.5});else window.scrollTo({top:y,behavior:'smooth'});const scroll=await stats(3500);
const bottom=document.documentElement.scrollHeight-innerHeight;if(window.GDR&&GDR.lenis)GDR.lenis.scrollTo(bottom,{duration:3});else window.scrollTo({top:bottom,behavior:'smooth'});await new Promise(r=>setTimeout(r,3600));const tour=await stats(1500);window.scrollTo(0,0);await new Promise(r=>setTimeout(r,1500));const heap=performance.memory?Math.round(performance.memory.usedJSHeapSize/1048576):null;
return {idle,scroll,tour,heapMB:heap,vis:document.visibilityState,dpr:devicePixelRatio,w:innerWidth,h:innerHeight,lite:window.GDR&&GDR.lite,circuit:document.getElementById('circuit')&&document.getElementById('circuit').tagName}})()`;
const r = await send('Runtime.evaluate', { expression: probe, awaitPromise: true, returnByValue: true, timeout: 30000 });
if (traceFile) { await send('Tracing.end'); await waitFor('Tracing.tracingComplete', 60000); fs.writeFileSync(traceFile, JSON.stringify({ traceEvents })); }
const ps = execSync("ps -axo rss,command | grep gdr-headed | grep -v grep").toString().split('\n').filter(Boolean);
const mem = {}; for (const l of ps) { const rss = parseInt(l) / 1024; const t = (l.match(/--type=([a-z-]+)/) || [])[1] || 'browser'; mem[t] = Math.round((mem[t] || 0) + rss); }
const v = r.result?.value ?? r; if (v && typeof v === 'object') v.rssMB = mem;
console.log(label, JSON.stringify(v, null, 0));
await send('Target.closeTarget', { targetId: target.id }).catch(()=>{});
ws.close(); process.exit(0);
