import { LibraryFormats, defineConfig } from 'vite';

export default defineConfig(async () => ({
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
