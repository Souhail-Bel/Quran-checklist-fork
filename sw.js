const CACHE = "check-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/style.css",
  "/script.js",
  "/quran.js",
  "/config.js",
  "/manifest.json",
];

const addResourcesToCache = async (resources) => {
  const cache = await caches.open(CACHE);
  await cache.addAll(resources);
};

self.addEventListener("install", (e) => {
  e.waitUntil(addResourcesToCache(ASSETS));
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request)),
  );
});
