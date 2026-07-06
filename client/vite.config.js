import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The client talks to the API via the /api proxy in dev, so no CORS juggling.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: true },
      '/socket.io': { target: 'http://localhost:5000', ws: true, changeOrigin: true },
    },
  },
});
