// Import Workbox from Google CDN
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');

if (workbox) {
  console.log(`Workbox loaded successfully!`);

  // Set a prefix for Workbox-generated cache names
  workbox.core.setCacheNameDetails({ prefix: 'pokedex-im' });

  // Precache and route the app shell and critical static assets
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
  ];

  workbox.precaching.precacheAndRoute(APP_SHELL_RESOURCES, {
    ignoreURLParametersMatching: [/.*/],
  });
  workbox.precaching.cleanupOutdatedCaches();

  // 协议过滤函数 - 核心修复点
  const isHTTP = ({ url }) => 
    url.protocol === 'http:' || url.protocol === 'https:';

  // 缓存谷歌字体
  workbox.routing.registerRoute(
    ({ url }) => isHTTP({ url }) && url.origin === 'https://fonts.googleapis.com',
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'google-fonts-stylesheets',
    })
  );

  workbox.routing.registerRoute(
    ({ url }) => isHTTP({ url }) && url.origin === 'https://fonts.gstatic.com',
    new workbox.strategies.CacheFirst({
      cacheName: 'google-fonts-webfonts',
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({  // 修复大小写
          statuses: [0, 200],
        }),
        new workbox.expiration.ExpirationPlugin({
          maxAgeSeconds: 60 * 60 * 24 * 365,
          maxEntries: 30,
        }),
      ],
    })
  );

  // 缓存 ECharts CDN 脚本
  workbox.routing.registerRoute(
    ({ url }) => isHTTP({ url }) && 
               url.origin === 'https://cdn.jsdelivr.net' && 
               url.pathname.startsWith('/npm/echarts@'),
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'cdn-scripts',
    })
  );

  // 缓存本地 JS/CSS
  workbox.routing.registerRoute(
    ({ request, url }) => isHTTP({ url }) && 
                         (request.destination === 'script' || request.destination === 'style'),
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'static-resources',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60,
        }),
      ],
    })
  );

  const API_BASE_URL_CONFIG = 'http://39.107.88.124:8000';

  // 缓存API图片 - 增加协议校验
  workbox.routing.registerRoute(
    ({ url, request }) => isHTTP({ url }) && 
                         url.origin === new URL(API_BASE_URL_CONFIG).origin && 
                         request.destination === 'image',
    new workbox.strategies.CacheFirst({
      cacheName: 'api-images',
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({  // 修复大小写
          statuses: [0, 200],
        }),
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60,
          purgeOnQuotaError: true,
        }),
      ],
    })
  );

  // 缓存 API GET 请求
  workbox.routing.registerRoute(
    ({ url, request }) => isHTTP({ url }) && 
                         url.origin === new URL(API_BASE_URL_CONFIG).origin && 
                         request.method === 'GET',
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'api-data',
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({  // 修复大小写
          statuses: [200],
        }),
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 1 * 24 * 60 * 60,
        }),
      ],
    })
  );

  // 非 GET API 请求
  workbox.routing.registerRoute(
    ({ url, request }) => isHTTP({ url }) && 
                         url.origin === new URL(API_BASE_URL_CONFIG).origin && 
                         request.method !== 'GET',
    new workbox.strategies.NetworkOnly()
  );

  // 离线回退页面
  const offlinePage = '/offline.html';
  const navigationHandler = new workbox.strategies.NetworkOnly();

  workbox.routing.registerRoute(
    new workbox.routing.NavigationRoute(
      async (params) => {
        try {
          return await navigationHandler.handle(params);
        } catch (error) {
          return caches.match(offlinePage, {
            cacheName: workbox.core.cacheNames.precache
          });
        }
      }
    )
  );

  self.skipWaiting();
  workbox.core.clientsClaim();

  console.log(`Workbox configured successfully.`);

} else {
  console.error(`Workbox failed to load.`);
}
