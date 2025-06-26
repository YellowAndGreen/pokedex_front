import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';

// 性能优化：预加载关键资源
const preloadCriticalResources = () => {
  // 字体已通过本地CSS文件加载，无需预加载
  
  // 预加载关键图标（仅在实际需要时预加载）
  // 移除不必要的图标预加载以减少警告
};

// 初始化性能监控
const initPerformanceMonitoring = () => {
  // 监控首屏渲染时间
  if ('performance' in window) {
    window.addEventListener('load', () => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      console.log('Performance Metrics:', {
        DOMContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        LoadComplete: perfData.loadEventEnd - perfData.loadEventStart,
        FirstPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint'),
        FirstContentfulPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint')
      });
    });
  }
};

// 错误边界处理
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // 在生产环境中，这里可以发送错误到监控服务
});

window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // 在生产环境中，这里可以发送错误到监控服务
});

// 检查根元素
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

// 优化首屏渲染
const renderApp = () => {
  const root = ReactDOM.createRoot(rootElement);
  
  root.render(
    <React.StrictMode>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </React.StrictMode>
  );
};

// 应用初始化序列
const initializeApp = async () => {
  try {
    // 1. 预加载关键资源
    preloadCriticalResources();
    
    // 2. 初始化性能监控
    initPerformanceMonitoring();
    
    // 3. 等待DOM完全加载
    if (document.readyState === 'loading') {
      await new Promise(resolve => {
        document.addEventListener('DOMContentLoaded', resolve);
      });
    }
    
    // 4. 渲染应用
    renderApp();
    
    console.log('App initialized successfully with splash screen');
    
  } catch (error) {
    console.error('App initialization failed:', error);
    // 即使初始化失败，也要尝试渲染应用
    renderApp();
  }
};

// 启动应用
initializeApp();

// 注册Service Worker (PWA功能)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
        
        // 检查Service Worker更新
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('New service worker available, please refresh to update');
                // 这里可以显示更新提示给用户
              }
            });
          }
        });
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  });
}

// 导出类型给TypeScript使用
export type { };

// PWA安装提示
let deferredPrompt: any;
window.addEventListener('beforeinstallprompt', (e) => {
  // 阻止Chrome 67及更早版本自动显示安装提示
  e.preventDefault();
  // 保存事件，以便稍后触发
  deferredPrompt = e;
  console.log('PWA install prompt available');
});

// 监听PWA安装完成
window.addEventListener('appinstalled', () => {
  console.log('PWA was installed');
  deferredPrompt = null;
});
