/* ============================================================
   sw.js — Endcap service worker 

   APP SHELL (same-origin html/js/css/icons)
     stale-while-revalidate: instant loads, updates land next visit.

   FONTS AND THE FIREBASE SDK (cross-origin, versioned URLs)
     cache-first: they never change under a given URL.

   Caches are named endcap-*; this worker only ever deletes its own
   old versions. Every galaxyhockey.github.io site shares one origin,
   so it must never touch another school's caches.
   ============================================================ */

const VERSION = 'endcap-v2';
const SHELL   = `${VERSION}-shell`;
const VENDOR  = `${VERSION}-vendor`;

const SHELL_FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/style.css',
  './assets/app.js',
  './assets/store.js',
  './assets/config.js',
  './assets/labs.js',
  './assets/fieldkit.js',
  './assets/pwa.js',
  './assets/content/index.js',
  './assets/content/sources.js',
  './assets/content/r101.js',
  './assets/content/r201.js',
  './assets/content/r211.js',
  './assets/content/r221.js',
  './assets/content/r301.js',
  './assets/content/r311.js',
  './assets/content/r321.js',
  './assets/content/r331.js',
  './assets/content/r401.js',
  './assets/content/r411.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/favicon-32.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(SHELL_FILES)).catch(()=>{}));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k.startsWith('endcap-') && !k.startsWith(VERSION)).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('message', e => { if(e.data === 'SKIP_WAITING') self.skipWaiting(); });

self.addEventListener('fetch', e => {
  const req = e.request;
  if(req.method !== 'GET') return;
  const url = new URL(req.url);
  if(/gstatic\.com|googleapis\.com/.test(url.hostname)){ e.respondWith(cacheFirst(req, VENDOR)); return; }
  if(url.origin === location.origin) e.respondWith(staleWhileRevalidate(req, SHELL));
});

async function cacheFirst(req, cacheName){
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  if(hit) return hit;
  try{
    const res = await fetch(req);
    if(res && res.status === 200) cache.put(req, res.clone());
    return res;
  }catch(e){ return hit || Response.error(); }
}

async function staleWhileRevalidate(req, cacheName){
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  const net = fetch(req).then(res => {
    if(res && res.status === 200) cache.put(req, res.clone());
    return res;
  }).catch(() => hit);
  return hit || net;
}
