import { defineConfig } from 'vite';

function removeDataModulepreload() {
  return {
    name: 'remove-data-modulepreload',
    transformIndexHtml(html) {
      return html.replace(
        /<link\s+rel="modulepreload"\s+href="data:[^"]*"\s*\/?>/g,
        ''
      );
    },
  };
}

export default defineConfig({
  root: '.',
  publicDir: 'public',
  plugins: [removeDataModulepreload()],
  build: {
    outDir: 'dist',
    cssMinify: 'esbuild',
    modulePreload: false,
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
  server: {
    port: 3000,
    open: true,
  },
});
