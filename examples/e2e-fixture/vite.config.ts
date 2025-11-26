import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@cyber-sheet/core': path.resolve(__dirname, '../../packages/core/src'),
      '@cyber-sheet/renderer-canvas': path.resolve(__dirname, '../../packages/renderer-canvas/src')
    }
  },
  server: {
    port: 3000
  }
});
