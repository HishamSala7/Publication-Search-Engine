import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    
    allowedHosts: [
      '.trycloudflare.com',
    ],

    proxy: {
      '/api': {
        target: 'https://localhost:7190',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})