import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Separate from vite.config.js (the production build config) so test-only
// settings never leak into `vite build`.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.js'],
    css: false,
  },
});
