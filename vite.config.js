import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    cssMinify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          gsap: ['gsap'],
          vendor: ['lenis'],
        },
      },
    },
  },
  css: {
    postcss: './postcss.config.js',
  },
  server: {
    port: 3000,
    open: true,
  },
});
