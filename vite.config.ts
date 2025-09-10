import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: false,
    hmr: {
      port: 5174,
      host: 'localhost'
    },
    watch: {
      usePolling: true,
      interval: 1000
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  preview: {
    host: true,
    port: 4173,
    strictPort: false
  }
});
