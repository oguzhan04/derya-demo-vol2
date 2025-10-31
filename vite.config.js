import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Only proxy in development (local server)
    proxy: process.env.NODE_ENV === 'development' ? {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    } : undefined
  },
  build: {
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          'jspdf': ['jspdf']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['jspdf']
  }
})
