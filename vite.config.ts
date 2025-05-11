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
  build: {
    outDir: 'dist', // Ensure the output directory matches Vercel's configuration
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // Ensure this matches your backend URL
        changeOrigin: true,
        secure: false,
      },
    },
  },
});