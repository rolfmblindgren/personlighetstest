import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  // henter kun VITE_*-variablene
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  return {
    plugins: [react()],
    resolve: {
      alias: { '@': path.resolve(__dirname, 'src') }
    },
    server: {
      proxy: {
        // alt som treffer /api/* på Vite-serveren videresendes
        '^/api/.*': {
          target: env.VITE_API_PROXY,
          changeOrigin: true,
          secure: false,
          // fjerner /api-prefix om Flask ligger på roten
        }
      }
    }
  }
})