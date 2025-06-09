import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const backendUrl = process.env.VITE_BACKEND_URL || 'http://localhost:8000'
const isDevelopment = process.env.NODE_ENV !== 'production'

if (!process.env.VITE_BACKEND_URL && isDevelopment) {
  console.warn('\u26A0\uFE0F VITE_BACKEND_URL not set. Falling back to http://localhost:8000')
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  build: {
    rollupOptions: {
      external: [],
      output: {
        manualChunks: undefined
      },
      onwarn(warning, warn) {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
          return
        }
        warn(warning)
      }
    }
  },
  server: {
    port: 5173,
    proxy: isDevelopment ? {
      '/api': {
        target: backendUrl,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      },
    } : undefined
  },
  define: {
    'process.env': {}
  }
})
