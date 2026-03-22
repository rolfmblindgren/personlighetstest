import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const proxyTarget = env.VITE_API_PROXY;
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      },
      extensions: [
        '.js', '.jsx', '.ts', '.tsx', '.json'
      ]
    },
    server: proxyTarget ? {
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: proxyTarget.startsWith('https://'),
          rewrite: p => p.replace(/^\/api/, '/portal/api'),
        }
      }
    } : undefined
  }
})
