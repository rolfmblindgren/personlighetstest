import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  return {
    plugins: [react()],
    resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_PROXY,        // f.eks. https://flaskapps.grendel.no
          changeOrigin: true,
          secure: true,                      // bruk true når du går mot https
          rewrite: p => p.replace(/^\/api/, '/portal/api'),
        }
      }
    }
  }
})
