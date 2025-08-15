import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // you can change the dev server port
    open: true, // automatically opens browser
  },
  build: {
    outDir: 'dist',
  },
  resolve: {
    alias: {
      '@': '/src', // optional, allows imports like "@/components/Button"
    },
  },
});
