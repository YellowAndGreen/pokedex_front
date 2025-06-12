// Import Workbox from Google CDN
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');

/***************** 核心修复：全局协议过滤器 *****************/
const ALLOWED_PROTOCOLS = ['http:', 'https:'];

// HTTP请求仲裁函数 (关键修复)
function isAllowedRequest(request) {
  // 优先使用URL对象检测协议类型
  try {
    const url = new URL(request.url);
    return ALLOWED_PROTOCOLS.includes(url.protocol);
  } catch(e) {
    // 对非标准URL进行安全处理
    return request.url.startsWith('http') && !request.url.includes('chrome-extension');
  }
}
/***************** 修复结束 *****************/

if (workbox) {
  console.log(`Workbox loaded successfully!`);

  // 设置缓存名前缀
  workbox.core.setCacheNameDetails({ prefix: 'pokedex-im' });

  // 预缓存核心资源
  const APP_SHELL_RESOURCES = [
    { url: '/', revision: null },
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

  // 预缓存并路由资源
  workbox.precaching.precacheAndRoute(APP_SHELL_RESOURCES, {
    ignoreURLParametersMatching: [/.*/],
  });
  
  // 清理过期缓存
  workbox.precaching.cleanupOutdatedCaches();

  // 协议过滤函数
  const isHTTP = ({ url }) => url.protocol === 'http:' || url.protocol === 'https:';

  /***************** 缓存策略区域 *****************/
  
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
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new workbox.expiration.ExpirationPlugin({
          maxAgeSeconds: 60 * 60 * 24 * 365,
          maxEntries: 30,
        }),
      ],
    })
  );

  // 缓存 ECharts 脚本
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

  // 缓存 API 图片
  workbox.routing.registerRoute(
    ({ url, request }) => isHTTP({ url }) && 
                         url.origin === new URL(API_BASE_URL_CONFIG).origin && 
                         request.destination === 'image',
    new workbox.strategies.CacheFirst({
      cacheName: 'api-images',
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        /***** 安全修复：仅允许有效请求 *****/
        {
          cacheWillUpdate: async ({response}) => {
            return isAllowedRequest(response) ? response : null;
          }
        },
        /*********************************/
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
        new workbox.cacheableResponse.CacheableResponsePlugin({
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

  // 离线回退页面（增强错误处理）
  const offlinePage = '/offline.html';
  
  workbox.routing.registerRoute(
    new workbox.routing.NavigationRoute(
      async ({ event }) => {
        // 使用新的安全仲裁方法
        if (!isAllowedRequest(event.request)) {
          return fetch(event.request);
        }
        
        try {
          return await new workbox.strategies.NetworkOnly().handle({ event });
        } catch (error) {
          console.warn('网络请求失败，显示离线页面', error);
          return caches.match(offlinePage) || Response.error();
        }
      }
    )
  );

  /*************** 核心命令 ***************/
  self.skipWaiting();
  workbox.core.clientsClaim();
  /**************************************/

  console.log(`Workbox configured successfully.`);
} else {
  console.error(`Workbox failed to load.`);
}

/*************** 全局请求拦截器 ***************/
self.addEventListener('fetch', (event) => {
  // 拦截非HTTP协议请求
  if (!isAllowedRequest(event.request)) {
    console.warn(`拦截非安全协议请求: ${event.request.url}`);
    event.respondWith(fetch(event.request)); // 直接传递请求
    return;
  }
});
