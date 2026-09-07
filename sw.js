/* Gadget Data Recovery — caches the site kit and photos so repeat visits are instant. Pages: network first. */
var CACHE = 'gdr-v1';
var ASSETS = ['assets/site.css','assets/site.js','assets/home.js','assets/cpu-tweezers-cut.png','assets/board-cut.png','assets/scope-gold-ic.jpg','assets/chip-reball.jpg','assets/scope-boards.jpg','assets/board-labeled.jpg','assets/cpu-tweezers.jpg'];
self.addEventListener('install', function(e){ e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ASSETS).catch(function(){}); }).then(function(){ return self.skipWaiting(); })); });
self.addEventListener('activate', function(e){ e.waitUntil(caches.keys().then(function(keys){ return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); })); }).then(function(){ return self.clients.claim(); })); });
self.addEventListener('fetch', function(e){
  var req = e.request; if (req.method !== 'GET') return;
  var url = new URL(req.url);
  var isAsset = /\.(css|js|png|jpg|jpeg|webp|svg|woff2?)$/i.test(url.pathname) || url.hostname.indexOf('cdnjs') >= 0 || url.hostname.indexOf('jsdelivr') >= 0 || url.hostname.indexOf('gstatic') >= 0 || url.hostname.indexOf('googleapis') >= 0;
  if (isAsset) {
    e.respondWith(caches.open(CACHE).then(function(c){ return c.match(req).then(function(hit){ if (hit) return hit; return fetch(req).then(function(res){ if (res && res.ok && (res.type === 'basic' || res.type === 'cors')) c.put(req, res.clone()); return res; }); }); }));
  } else if (url.origin === location.origin) {
    e.respondWith(fetch(req).then(function(res){ var copy = res.clone(); caches.open(CACHE).then(function(c){ c.put(req, copy); }); return res; }).catch(function(){ return caches.match(req); }));
  }
});
