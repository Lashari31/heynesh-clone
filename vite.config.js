import { defineConfig } from 'vite';

export default defineConfig({
  server: { port: 5180, host: true },
  preview: { port: 5181 },
  build: {
    target: 'es2020',
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 1500,
  },
});
