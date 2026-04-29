import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'CV Builder',
        short_name: 'CV Builder',
        description: 'AI-powered CV builder with job-specific adaptation',
        start_url: '/',
        scope: '/',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{css,html,ico,png,svg,woff,woff2}', '**/assets/index-*.js'],
        globIgnores: ['**/exportPdf-*.js', '**/html2canvas-*.js', '**/index.es-*.js'],
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            urlPattern: /\/assets\/(exportPdf|html2canvas|index\.es)-.+\.js$/,
            handler: 'CacheFirst',
            options: { cacheName: 'export-chunks', expiration: { maxEntries: 10 } },
          },
        ],
      },
    }),
  ],
})
