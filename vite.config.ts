import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vite'

const basePath = '/'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.svg'],
      manifest: {
        name: 'Outpost - Larp Spot Discovery',
        short_name: 'Outpost',
        description: 'Find your next Larp spot. Discover the best places to work from anywhere.',
        theme_color: '#2d4a3e',
        background_color: '#f5f0e8',
        display: 'standalone',
        orientation: 'portrait',
        scope: basePath,
        start_url: basePath,
        icons: [
          {
            src: `${basePath}icons/icon-192.svg`,
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: `${basePath}icons/icon-512.svg`,
            sizes: '512x512',
            type: 'image/svg+xml'
          },
          {
            src: `${basePath}icons/icon-512.svg`,
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
      }
    })
  ],
  base: basePath,
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
