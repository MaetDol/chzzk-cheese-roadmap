import { fileURLToPath, URL } from 'node:url';
import { defineConfig, LibraryFormats } from 'vite';

export default defineConfig(async () => ({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    minify: false,
    lib: {
      entry: 'src/main.ts',
      name: 'index',
      formats: ['es'] as LibraryFormats[],
      fileName: 'cheese-roadmap.user',
    },
  },
  esbuild: {
    banner: await import('./src/tampermonkey-docs').then((m) => m.default),
  },
}));
