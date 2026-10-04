/**
 * NEAR JOB — Progressive Web App Service Worker (v2)
 */

const CACHE_NAME = "nearjob-v2";
const STATIC_ASSETS = [
  "/",
  "/manifest.webmanifest",
  "/logo.png?v=2",
  "/icons/icon-192x192.png?v=2",
  "/icons/icon-512x512.png?v=2",
  "/icons/icon-maskable-512x512.png?v=2",
  "/apple-touch-icon.png?v=2",
  "/favicon.png?v=2",
];

// Install: Cache core static assets & skip waiting immediately
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .catch((err) => {
        console.warn("[PWA SW] Pre-caching failed:", err);
      })
  );
});

// Activate: Immediately purge all old caches and claim active clients
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              console.log("[PWA SW] Deleting obsolete cache:", key);
              return caches.delete(key);
            }
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch: Network-first for static icons & manifest, cache fallback
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests and non-POST/PUT requests
  if (url.origin !== self.location.origin || request.method !== "GET") {
    return;
  }

  // Skip Next.js hot reload / webpack dev server in development
  if (url.pathname.includes("/_next/webpack-hmr") || url.pathname.startsWith("/api/auth")) {
    return;
  }

  // For static icons & manifest: Network-first to always reflect brand updates, fallback to cache
  if (
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/logo") ||
    url.pathname === "/manifest.webmanifest" ||
    url.pathname.endsWith(".png")
  ) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // For page navigations: Network-first with cache fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            return cached || caches.match("/");
          });
        })
    );
    return;
  }

  // Default: Network with cache fallback
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// Listen for skip waiting message from app
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
