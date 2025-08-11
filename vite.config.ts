import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    cors: {
      origin: false,
      credentials: false
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
