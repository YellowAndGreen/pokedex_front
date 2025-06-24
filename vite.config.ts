import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
    return {
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
