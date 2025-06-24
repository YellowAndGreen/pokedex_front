import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
    return {
      plugins: [react()],
      base: '/', // 确保正确的基础路径
      build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: false,
        rollupOptions: {
          output: {
            manualChunks: {
              vendor: ['react', 'react-dom'],
              router: ['react-router-dom']
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
        proxy: {
          '/api': {
            target: 'http://39.107.88.124:8000',
            changeOrigin: true,
            secure: false,
            rewrite: (path) => path
          },
          '/thumbnails': {
            target: 'http://39.107.88.124:8000',
            changeOrigin: true,
            secure: false,
            rewrite: (path) => path
          },
          '/uploaded_images': {
            target: 'http://39.107.88.124:8000',
            changeOrigin: true,
            secure: false,
            rewrite: (path) => path
          }
        }
      }
    };
});
