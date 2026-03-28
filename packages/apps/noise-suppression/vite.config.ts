import basicSsl from '@vitejs/plugin-basic-ssl';
import { defineConfig } from 'vite';
import tsConfigPaths from 'vite-tsconfig-paths';

/**
 * Same rules as camera-test: `DEMO_BASE` + optional `DEMO_APP_SEGMENT` for GitHub Pages.
 */
function resolveDemoBase(): string {
  const segment = process.env.DEMO_APP_SEGMENT?.trim();
  const fromEnv = process.env.DEMO_BASE?.trim();

  if (segment) {
    const root =
      fromEnv !== undefined && fromEnv !== ''
        ? fromEnv.endsWith('/')
          ? fromEnv
          : `${fromEnv}/`
        : '/';
    if (root === '/') {
      return `/${segment}/`;
    }
    return `${root}${segment}/`;
  }

  if (fromEnv !== undefined && fromEnv !== '') {
    return fromEnv.endsWith('/') ? fromEnv : `${fromEnv}/`;
  }

  return '/';
}

export default defineConfig(() => {
  return {
    base: resolveDemoBase(),
    build: {
      outDir: 'dist',
    },
    plugins: [basicSsl(), tsConfigPaths()],
  };
});
