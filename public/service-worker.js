
const CACHE_NAME = 'pokedex-image-manager-v1';
const OFFLINE_URL = '/offline.html';

// IMPORTANT: Update this list with all essential files for your app shell
const PRECACHE_RESOURCES = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/constants.ts',
  '/services/api.ts',
  '/components/AlertDialog.tsx',
  '/components/AnalyticsPage.tsx',
  '/components/BirdSightingTable.tsx',
  '/components/BirdSightingTimeline.tsx',
  '/components/CategoryCard.tsx',
  '/components/CategoryCardSkeleton.tsx',
  '/components/CategoryDetail.tsx',
  '/components/CategoryForm.tsx',
  '/components/CategoryList.tsx',
  '/components/CategorySearch.tsx',
  '/components/ChinaBirdMap.tsx',
  '/components/ErrorDisplay.tsx',
  '/components/icons.tsx',
  '/components/ImageCard.tsx',
  '/components/ImageCardSkeleton.tsx',
  '/components/ImageDetailModal.tsx',
  '/components/ImageUploadForm.tsx',
  '/components/Layout.tsx',
  '/components/LoadingSpinner.tsx',
  '/components/LoginPage.tsx',
  '/components/Modal.tsx',
  '/components/PieChart.tsx',
  '/components/SpeciesDetailCard.tsx',
  '/components/SpeciesSearch.tsx',
  '/components/TagPage.tsx',
  '/contexts/AuthContext.tsx',
  '/contexts/CategoryContext.tsx',
  '/contexts/ThemeContext.tsx',
  '/icons/icon-144x144.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/data/analytics_summary.json',
  '/data/bird_sightings.json',
  '/data/region_bird_stats.json',
  '/data/social_stats.json',
  '/data/top_birds.json'
  // Note: CDN assets (Tailwind, ECharts, esm.sh, Google Fonts) are not pre-cached here.
  // They will be cached by the browser's standard mechanisms or by the service worker
  // on first fetch if the 'fetch' event handler successfully caches them.
  // For robust offline for CDN assets, Workbox with specific strategies is typically used.
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Pre-caching offline page and core assets.');
        return cache.addAll(PRECACHE_RESOURCES);
      })
      .then(() => self.skipWaiting())
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
          // If network fails, serve the offline page from cache
          return caches.match(OFFLINE_URL).then(cachedResponse => {
            return cachedResponse || new Response("Offline page not found in cache.", { status: 404, headers: { 'Content-Type': 'text/plain' }});
          });
        })
    );
  } else {
    // For non-navigation requests (assets, API calls, etc.)
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          // Return cached response if found
          if (cachedResponse) {
            return cachedResponse;
          }
          // Otherwise, fetch from network
          return fetch(event.request).then(networkResponse => {
            // Optionally, cache new requests dynamically (be careful with opaque responses or large files)
            // For example, cache images if successful:
            // if (event.request.destination === 'image') {
            //   const responseToCache = networkResponse.clone();
            //   caches.open(CACHE_NAME).then(cache => {
            //     cache.put(event.request, responseToCache);
            //   });
            // }
            return networkResponse;
          }).catch(() => {
            // For non-navigation requests, if not in cache and network fails,
            // the browser will handle the error (e.g., broken image, failed API call).
            // You could return a placeholder for images here if desired:
            // if (event.request.destination === 'image') {
            //   return caches.match('/icons/image-placeholder.svg'); // Make sure this placeholder is precached
            // }
            // For other requests, let them fail naturally.
          });
        })
    );
  }
});
