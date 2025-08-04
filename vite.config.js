import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  console.log('🚀 Proxy target set to', env.VITE_API_PROXY)
  return {
    plugins: [react()],
    resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_PROXY,
          changeOrigin: true,
          secure: false,
        }
      }
    }
  }
})