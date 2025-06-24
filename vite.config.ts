import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
    const proxyConfig = {
      '/api': {
        target: 'http://39.107.88.124:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path: string) => path
      },
      '/thumbnails': {
        target: 'http://39.107.88.124:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path: string) => path
      },
      '/uploaded_images': {
        target: 'http://39.107.88.124:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path: string) => path
      }
    };

    return {
      plugins: [react()],
      base: '/', // 确保正确的基础路径
      build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: false,
        chunkSizeWarningLimit: 1000, // 增加chunk大小警告阈值
        rollupOptions: {
          output: {
                         manualChunks: (id) => {
               if (id.includes('node_modules')) {
                 if (id.includes('react') || id.includes('react-dom')) {
                   return 'vendor';
                 }
                 if (id.includes('react-router-dom')) {
                   return 'router';
                 }
                 if (id.includes('framer-motion')) {
                   return 'motion';
                 }
                 return 'vendor';
               }
               if (id.includes('webgl-viewer')) {
                 return 'webgl';
               }
             }
          }
        }
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      server: {
        proxy: proxyConfig
      },
      // 添加preview模式的代理配置
      preview: {
        proxy: proxyConfig,
        port: 4173,
        host: true
      }
    };
});
