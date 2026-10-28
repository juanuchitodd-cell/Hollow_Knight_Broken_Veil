const CACHE_NAME = "broken-veil-v2";
const APP_FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./assets/background.webp",
  "./assets/arrow-sprite.png",
  "./assets/save-screen.jpg",
  "./assets/save-halo.webp",
  "./assets/title-top.png",
  "./assets/title-hollow-knight.png",
  "./assets/title-broken-veil.png",
  "./assets/title-bottom.png",
  "./assets/team-cherry-footer.png",
  "./assets/ornament.png",
  "./assets/team-cherry-intro.png",
  "./assets/menu-music.mp3",
  "./assets/move-sound.wav",
  "./assets/confirm-sound.wav"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) => key.startsWith("broken-veil-") && key !== CACHE_NAME)
        .map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;

    try {
      const response = await fetch(request);
      if (response.ok) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, response.clone()).catch(() => {});
      }
      return response;
    } catch (error) {
      if (request.mode === "navigate") {
        return (await caches.match("./index.html")) || Response.error();
      }
      return Response.error();
    }
  })());
});
