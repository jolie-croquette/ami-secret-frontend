import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base : '/',
  build: {
    rollupOptions: {
      // Deux points d'entrée : même app, mais <head> (SEO, aperçus de partage)
      // en français à la racine et en anglais sous /en.
      input: { main: 'index.html', en: 'index.en.html' },
    },
    assetsDir: 'assets',
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
