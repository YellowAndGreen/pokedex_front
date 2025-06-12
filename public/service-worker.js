
const CACHE_NAME = 'pokedex-image-manager-v1';
const OFFLINE_URL = '/offline.html';

// IMPORTANT: This list should contain only essential static files for the app shell.
// JavaScript and CSS bundles will be cached dynamically by the fetch handler.
const PRECACHE_RESOURCES = [
  '/', // Alias for index.html
  '/index.html',
  '/offline.html',
  '/manifest.json',
  // Critical icons
  '/icons/icon-144x144.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Data files (if they are static and part of the app shell)
  '/data/analytics_summary.json',
  '/data/bird_sightings.json',
  '/data/region_bird_stats.json',
  '/data/social_stats.json',
  '/data/top_birds.json'
  // Note: Your main JavaScript bundle (e.g., index-KqiRWaZT.js) and CSS files
  // are not listed here because their names can change with each build (hashed).
  // They will be cached by the fetch handler below when first requested.
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Pre-caching offline page and core assets.');
        return cache.addAll(PRECACHE_RESOURCES);
      })
      .then(() => self.skipWaiting())
      .catch(error => {
        console.error('[Service Worker] Pre-caching failed:', error);
        // If precaching fails, the service worker might not install correctly.
        // This usually means one of the PRECACHE_RESOURCES was not found.
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => {
            console.log('[Service Worker] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(OFFLINE_URL).then(cachedResponse => {
            return cachedResponse || new Response("Offline page not found in cache.", { status: 404, headers: { 'Content-Type': 'text/plain' }});
          });
        })
    );
  } else if (event.request.destination === 'script' || event.request.destination === 'style') {
    // Cache-first, then network. Cache the network response if successful.
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(event.request).then(cachedResponse => {
          return cachedResponse || fetch(event.request).then(networkResponse => {
            // Check if the response is valid before caching
            if (networkResponse.ok) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(error => {
            console.warn(`[Service Worker] Network request failed for ${event.request.destination}: ${event.request.url}`, error);
            // Optionally, return a specific offline response for scripts/styles if needed
            // For now, let the browser handle the error for failed script/style loads
          });
        });
      })
    );
  } else {
    // For other requests (images, fonts, API calls, etc.), use cache-first then network.
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          return cachedResponse || fetch(event.request).then(networkResponse => {
            // Optionally, cache other successful GET requests if needed
            // Example: Caching images if they are successfully fetched
            if (networkResponse.ok && event.request.method === 'GET' && event.request.destination === 'image') {
               const responseToCache = networkResponse.clone();
               caches.open(CACHE_NAME).then(cache => {
                 cache.put(event.request, responseToCache);
               });
            }
            return networkResponse;
          }).catch(error => {
            console.warn(`[Service Worker] Network request failed for ${event.request.destination}: ${event.request.url}`, error);
             // If an image fails and is not in cache, you could provide a fallback placeholder
            // if (event.request.destination === 'image') {
            //   return caches.match('/icons/offline-placeholder.png'); // Ensure this placeholder is in PRECACHE_RESOURCES
            // }
            // For other failed requests, let the browser handle it.
          });
        })
    );
  }
});

// Optional: Listen for messages from clients (e.g., to trigger skipWaiting from app)
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
