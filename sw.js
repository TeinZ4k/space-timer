/* Space Timer – Service Worker: macht die App offline nutzbar */
const CACHE = "space-timer-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-512-maskable.png"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* App-Seite: erst Netz (damit Updates ankommen), sonst Cache (offline).
   Alles andere: erst Cache, sonst Netz. */
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).then(r => {
        const cp = r.clone();
        caches.open(CACHE).then(c => c.put("./index.html", cp));
        return r;
      }).catch(() => caches.match("./index.html"))
    );
  } else {
    e.respondWith(
      caches.match(req).then(r => r || fetch(req).then(rr => {
        const cp = rr.clone();
        caches.open(CACHE).then(c => c.put(req, cp));
        return rr;
      }))
    );
  }
});
