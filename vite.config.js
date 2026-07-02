import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base so it works on GitHub Pages project sites
// (e.g. https://<user>.github.io/gowtham_marriage/) without extra config.
export default defineConfig({
  plugins: [react()],
  base: './',
})
