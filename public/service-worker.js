
// Import Workbox from Google CDN
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');

if (workbox) {
  console.log(`Workbox loaded successfully!`);

  // Set a prefix for Workbox-generated cache names
  workbox.core.setCacheNameDetails({ prefix: 'pokedex-im' });

  // Precache and route the app shell and critical static assets
  // This list should match your PRECACHE_RESOURCES
  const APP_SHELL_RESOURCES = [
    { url: '/', revision: null }, // index.html
    { url: '/index.html', revision: null },
    { url: '/offline.html', revision: null },
    { url: '/manifest.json', revision: null },
    { url: '/icons/icon-144x144.png', revision: null },
    { url: '/icons/icon-192x192.png', revision: null },
    { url: '/icons/icon-512x512.png', revision: null },
    { url: '/data/analytics_summary.json', revision: null },
    { url: '/data/bird_sightings.json', revision: null },
    { url: '/data/region_bird_stats.json', revision: null },
    { url: '/data/social_stats.json', revision: null },
    { url: '/data/top_birds.json', revision: null },
    // Add other critical static assets if any
    // Note: Hashed JS/CSS bundles are handled by runtime caching below
  ];

  workbox.precaching.precacheAndRoute(APP_SHELL_RESOURCES, {
    ignoreURLParametersMatching: [/.*/], // Ignore all URL parameters for precached assets
  });
  workbox.precaching.cleanupOutdatedCaches();

  // Cache Google Fonts
  workbox.routing.registerRoute(
    ({ url }) => url.origin === 'https://fonts.googleapis.com',
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'google-fonts-stylesheets',
    })
  );

  workbox.routing.registerRoute(
    ({ url }) => url.origin === 'https://fonts.gstatic.com',
    new workbox.strategies.CacheFirst({
      cacheName: 'google-fonts-webfonts',
      plugins: [
        new workbox.cacheable_response.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new workbox.expiration.ExpirationPlugin({
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
          maxEntries: 30,
        }),
      ],
    })
  );

  // Cache ECharts CDN script
  workbox.routing.registerRoute(
    ({ url }) => url.origin === 'https://cdn.jsdelivr.net' && url.pathname.startsWith('/npm/echarts@'),
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'cdn-scripts',
    })
  );

  // Cache app's own JS and CSS files (StaleWhileRevalidate for updates)
  workbox.routing.registerRoute(
    ({ request }) => request.destination === 'script' || request.destination === 'style',
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'static-resources',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 50, // Cache up to 50 scripts/styles
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
        }),
      ],
    })
  );

  const API_BASE_URL = 'http://39.107.88.124:8000'; // This must match your app's constant

  // Cache images from the API/Image base URL (CacheFirst)
  workbox.routing.registerRoute(
    ({ url, request }) => url.origin === new URL(API_BASE_URL).origin && request.destination === 'image',
    new workbox.strategies.CacheFirst({
      cacheName: 'api-images',
      plugins: [
        new workbox.cacheable_response.CacheableResponsePlugin({
          statuses: [0, 200], // Cache opaque responses and successful responses
        }),
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 100, // Store up to 100 images
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
          purgeOnQuotaError: true, // Automatically cleanup if quota is exceeded
        }),
      ],
    })
  );

  // Cache API GET requests (StaleWhileRevalidate)
  workbox.routing.registerRoute(
    ({ url, request }) => url.origin === new URL(API_BASE_URL).origin && request.method === 'GET',
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'api-data',
      plugins: [
        new workbox.cacheable_response.CacheableResponsePlugin({
          statuses: [200], // Only cache successful API responses
        }),
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 1 * 24 * 60 * 60, // 1 Day
        }),
      ],
    })
  );

  // For non-GET API requests, use NetworkOnly
  workbox.routing.registerRoute(
    ({ url, request }) => url.origin === new URL(API_BASE_URL).origin && request.method !== 'GET',
    new workbox.strategies.NetworkOnly()
  );

  // Navigation Fallback: Serve offline.html for navigation requests that fail
  const offlinePage = '/offline.html'; // Ensure this is precached
  const navigationHandler = new workbox.strategies.NetworkOnly();

  workbox.routing.registerRoute(
    new workbox.routing.NavigationRoute(
      async (params) => {
        try {
          // Attempt to fulfill the request from the network.
          return await navigationHandler.handle(params);
        } catch (error) {
          // The network failed; fall back to the offline page.
          console.log('[Service Worker] Navigation failed, serving offline page.');
          return caches.match(offlinePage, {
            cacheName: workbox.core.cacheNames.precache // Ensure it comes from precache
          });
        }
      }
    )
  );

  // Control the clients without waiting for them to close and reopen.
  self.skipWaiting();
  workbox.core.clientsClaim();

  console.log(`Workbox configured successfully.`);

} else {
  console.error(`Workbox failed to load.`);
}
