// Vite configuration: React plugin + dev proxy
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()], // enables fast refresh and JSX support
  server: {
    proxy: {
      // Proxy API requests to the local backend during development
      '/api': 'http://localhost:3001'
    }
  }
})
