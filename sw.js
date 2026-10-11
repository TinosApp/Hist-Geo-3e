/* Service worker : fonctionnement hors ligne de l'application HG 3e.
   Pour publier une mise à jour, changer le numéro de version ci-dessous. */
const VERSION = "hg3e-v1";
const FICHIERS = [
  "./",
  "index.html",
  "manifest.json",
  "icon-192.png",
  "icon-512.png",
  "icon-maskable-512.png",
  "apple-touch-icon.png",
  "favicon-32.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(FICHIERS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((cles) => Promise.all(cles.filter((c) => c !== VERSION).map((c) => caches.delete(c))))
      .then(() => self.clients.claim())
  );
});

/* Réponse immédiate depuis le cache, avec mise à jour en arrière-plan. */
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((enCache) => {
      const reseau = fetch(req)
        .then((rep) => {
          if (rep && rep.ok) {
            const copie = rep.clone();
            caches.open(VERSION).then((cache) => cache.put(req, copie));
          }
          return rep;
        })
        .catch(() => enCache || caches.match("index.html"));
      return enCache || reseau;
    })
  );
});
