import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      // 127.0.0.1 rather than "localhost": Node can resolve localhost to IPv6, where the backend isn't listening.
      // ws: true so /api/ws upgrades are proxied too.
      '/api': { target: 'http://127.0.0.1:3001', ws: true },
    },
  },
});
