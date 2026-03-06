import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Em GitHub Pages o app fica em /api-bootcamp-front/; localmente fica em /
  base: process.env.GITHUB_ACTIONS ? '/api-bootcamp-front/' : '/',
  server: {
    proxy: {
      '/auth': 'http://localhost:3000',
      '/users': 'http://localhost:3000',
      '/ofertas': 'http://localhost:3000',
      '/agendamentos': 'http://localhost:3000',
    }
  }
})
