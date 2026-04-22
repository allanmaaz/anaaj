import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Vite config for Anaaj frontend.
 * Proxy: all /api/* and /login /logout /register requests are
 * forwarded to Tomcat running on port 8080.
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080/AnaajApp',
        changeOrigin: true,
        rewrite: (path) => path, // keep /api/... as-is
      },
      '/login': {
        target: 'http://localhost:8080/AnaajApp',
        changeOrigin: true,
        bypass: function(req, res, options) {
          if (req.headers.accept && req.headers.accept.includes('text/html')) {
            return '/index.html';
          }
        }
      },
      '/logout': {
        target: 'http://localhost:8080/AnaajApp',
        changeOrigin: true,
        bypass: function(req, res, options) {
          if (req.headers.accept && req.headers.accept.includes('text/html')) {
            return '/index.html';
          }
        }
      },
      '/register': {
        target: 'http://localhost:8080/AnaajApp',
        changeOrigin: true,
        bypass: function(req, res, options) {
          if (req.headers.accept && req.headers.accept.includes('text/html')) {
            return '/index.html';
          }
        }
      },
    },
  },
})
