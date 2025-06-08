import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const backendUrl = process.env.VITE_BACKEND_URL || 'http://localhost:8000'

if (!process.env.VITE_BACKEND_URL) {
  console.warn('\u26A0\uFE0F VITE_BACKEND_URL not set. Falling back to http://localhost:8000')
}

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: backendUrl,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  define: {
    'process.env': {},
  },
})
