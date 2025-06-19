import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const isElectron = process.env.ELECTRON === 'true';
    
    return {
      // 根据环境调整base路径
      base: './', // 在Electron中始终使用相对路径
      
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.IS_ELECTRON': JSON.stringify(isElectron)
      },
      
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      
      build: {
        // Electron需要的构建配置
        outDir: 'dist',
        rollupOptions: {
          // 确保资源路径在Electron中正确解析
          output: {
            assetFileNames: (assetInfo) => {
              const info = assetInfo.name.split('.');
              const ext = info[info.length - 1];
              if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
                return `assets/images/[name]-[hash][extname]`;
              }
              return `assets/[name]-[hash][extname]`;
            },
            chunkFileNames: 'assets/js/[name]-[hash].js',
            entryFileNames: 'assets/js/[name]-[hash].js',
          }
        }
      },
      
      // 开发服务器配置
      server: {
        port: 3000,
        host: 'localhost'
      }
    };
});
