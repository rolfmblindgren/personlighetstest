import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Bruk .env-filer automatisk, f.eks. .env.development
import dotenv from 'dotenv'
dotenv.config()

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: process.env.VITE_API_PROXY
    ? {
        proxy: {
          '/api': {
            target: process.env.VITE_API_PROXY,
            changeOrigin: true,
            secure: false,
          },
        },
      }
    : {},
})


