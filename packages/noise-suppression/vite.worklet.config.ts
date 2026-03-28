import nodePath from 'node:path';

import { defineConfig } from 'vite';
import tsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig(() => {
  return {
    publicDir: false,
    plugins: [tsConfigPaths()],
    build: {
      lib: {
        entry: {
          noiseSuppressorWorkletRnnoise: nodePath.resolve(
            'src',
            'noiseSuppressorWorkletRnnoise.ts',
          ),
          noiseSuppressorWorkletDtln: nodePath.resolve('src', 'noiseSuppressorWorkletDtln.ts'),
        },
        name: 'index',
        formats: ['es'],
        fileName: (format, entryName) => {
          return `${entryName}.${format === 'cjs' ? 'cjs' : 'js'}`;
        },
        target: 'esnext',
      },
      emptyOutDir: false,
      minify: true,
      esbuild: {
        minify: true,
      },
    },
  };
});
