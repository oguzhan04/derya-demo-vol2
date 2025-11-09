import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
<<<<<<< HEAD
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Proxying request:', req.method, req.url);
          });
        }
      }
    }
=======
    // Only proxy in development (local server)
    proxy: process.env.NODE_ENV === 'development' ? {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    } : undefined
>>>>>>> d75be3cf34afe3783ab8f88ef92f1a0e9b88a7f9
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
