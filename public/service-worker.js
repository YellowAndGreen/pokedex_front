// Import Workbox from Google CDN
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');

/***************** 全局协议过滤器 *****************/
// 定义允许缓存的协议类型
const ALLOWED_PROTOCOLS = ['http:', 'https:'];

/**
 * 检查请求是否使用了允许的协议 (http/https)
 * @param {Request} request - 要检查的请求对象
 * @returns {boolean} - 如果是http或https请求，则返回true
 */
function isAllowedRequest(request) {
  // 优先使用 URL 对象来解析和检查协议
  try {
    const url = new URL(request.url);
    return ALLOWED_PROTOCOLS.includes(url.protocol);
  } catch (e) {
    // 对于无法通过 new URL() 解析的非标准URL（如 data:），进行降级处理
    // 确保它至少以 'http' 开头，并排除浏览器扩展
    return request.url.startsWith('http') && !request.url.includes('chrome-extension');
  }
}
/***************** 过滤器结束 *****************/

if (workbox) {
  console.log(`Workbox loaded successfully!`);

  // 设置统一的缓存名前缀，方便管理
  workbox.core.setCacheNameDetails({ prefix: 'pokedex-app' });

  // 预缓存应用核心外壳（App Shell）资源
  const APP_SHELL_RESOURCES = [
    { url: '/', revision: null },
    { url: '/index.html', revision: null },
    { url: '/offline.html', revision: null },
    { url: '/manifest.json', revision: null },
    { url: '/icons/icon-144x144.png', revision: null },
    { url: '/icons/icon-192x192.png', revision: null },
    { url: '/icons/icon-512x512.png', revision: null },
    // 预缓存一些关键数据，确保离线时有内容
    { url: '/data/analytics_summary.json', revision: null },
    { url: '/data/bird_sightings.json', revision: null },
    { url: '/data/region_bird_stats.json', revision: null },
    { url: '/data/social_stats.json', revision: null },
    { url: '/data/top_birds.json', revision: null },
  ];

  // 执行预缓存，并忽略URL参数
  workbox.precaching.precacheAndRoute(APP_SHELL_RESOURCES, {
    ignoreURLParametersMatching: [/.*/],
  });
  
  // 自动清理旧版本的缓存
  workbox.precaching.cleanupOutdatedCaches();

  /***************** 缓存策略区域 *****************/
  
  // 缓存 Google Fonts 的 CSS 文件 (StaleWhileRevalidate: 优先使用缓存，同时后台更新)
  workbox.routing.registerRoute(
    ({ url }) => url.origin === 'https://fonts.googleapis.com',
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'google-fonts-stylesheets',
    })
  );

  // 缓存 Google Fonts 的字体文件 (woff2)
  // **修复**: 将 CacheFirst 改为 StaleWhileRevalidate，避免首次离线时因缓存未命中而报错
  workbox.routing.registerRoute(
    ({ url }) => url.origin === 'https://fonts.gstatic.com',
    new workbox.strategies.StaleWhileRevalidate({ // <--- 关键修改
      cacheName: 'google-fonts-webfonts',
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new workbox.expiration.ExpirationPlugin({
          maxAgeSeconds: 60 * 60 * 24 * 365, // 缓存一年
          maxEntries: 30,
        }),
      ],
    })
  );

  // 缓存来自 CDN 的 ECharts 脚本
  workbox.routing.registerRoute(
    ({ url }) => url.origin === 'https://cdn.jsdelivr.net' && url.pathname.startsWith('/npm/echarts@'),
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'cdn-scripts',
    })
  );

  // 缓存应用自身的静态资源 (JS/CSS)
  workbox.routing.registerRoute(
    ({ request }) => request.destination === 'script' || request.destination === 'style',
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'static-resources',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 缓存30天
        }),
      ],
    })
  );

  // **修复**: 将API地址修改为线上正确的地址
  const API_BASE_URL_CONFIG = 'https://pokeeeeedex.netlify.app'; // <--- 关键修改

  // 缓存来自 API 的图片 (CacheFirst: 优先从缓存读取，适用于不常变化的资源)
  workbox.routing.registerRoute(
    ({ url, request }) => url.origin === new URL(API_BASE_URL_CONFIG).origin && request.destination === 'image',
    new workbox.strategies.CacheFirst({
      cacheName: 'api-images',
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 100, // 最多缓存100张图片
          maxAgeSeconds: 30 * 24 * 60 * 60, // 缓存30天
          purgeOnQuotaError: true, // 超出配额时自动删除最旧的缓存
        }),
      ],
    })
  );

  // 缓存来自 API 的 GET 请求数据
  workbox.routing.registerRoute(
    ({ url, request }) => url.origin === new URL(API_BASE_URL_CONFIG).origin && request.method === 'GET',
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'api-data',
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [200], // 只缓存成功的请求
        }),
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 1 * 24 * 60 * 60, // 缓存1天
        }),
      ],
    })
  );

  // 对于非 GET 类型的 API 请求，始终使用网络 (NetworkOnly)
  workbox.routing.registerRoute(
    ({ url, request }) => url.origin === new URL(API_BASE_URL_CONFIG).origin && request.method !== 'GET',
    new workbox.strategies.NetworkOnly()
  );

  // 为页面导航请求设置离线回退
  const offlinePage = '/offline.html';
  workbox.routing.registerRoute(
    new workbox.routing.NavigationRoute(
      async ({ event }) => {
        // 首先，尝试从网络获取最新页面
        try {
          // 使用 NetworkOnly 策略处理导航请求
          return await new workbox.strategies.NetworkOnly().handle({ event });
        } catch (error) {
          // 如果网络请求失败（即离线状态），则返回预缓存的离线页面
          console.warn('Network request for navigation failed, serving offline page.', error);
          return caches.match(offlinePage);
        }
      }
    )
  );

  /*************** 核心命令 ***************/
  // 让新的 Service Worker 立即生效，无需等待页面刷新
  self.skipWaiting();
  // 让 Service Worker 立即控制所有客户端
  workbox.core.clientsClaim();
  /**************************************/

  console.log(`Workbox configured successfully.`);
} else {
  console.error(`Workbox failed to load.`);
}

// **修复**: 移除了末尾多余的全局 'fetch' 事件监听器。
// Workbox 内部已经处理了 fetch 事件，无需手动添加，这样可以避免冲突。
