import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { runtimeErrorModal } from '@replit/vite-plugin-runtime-error-modal'
import { cartographer } from '@replit/vite-plugin-cartographer'

export default defineConfig({
  plugins: [
    react(),
    cartographer(),
    runtimeErrorModal(),
  ],
  server: {
    host: true,
    hmr: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@assets': path.resolve(__dirname, './attached_assets'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
  build: {
    outDir: 'dist',
  },
});
