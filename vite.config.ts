// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)), // "@/.." → "/src/.."
    },
  },

  /** ------------------------------------------------------------------
   * Dev‑only proxy: any request that begins with /api/*
   * is forwarded to the FastAPI server running on port 8000.
   * This bypasses CORS while you’re developing locally.
   * -----------------------------------------------------------------*/
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // FastAPI dev server
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
