import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    hmr: {
      overlay: false,
      clientPort: 5173,
      protocol: 'wss'
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
