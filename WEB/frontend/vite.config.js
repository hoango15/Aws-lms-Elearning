const host = process.env.API_URL || 'http://localhost:5000';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: host,
        changeOrigin: true,
        secure: false
      },
      '/uploads': {
        target: host,
        changeOrigin: true,
        secure: false
      }
    }
  }
});
