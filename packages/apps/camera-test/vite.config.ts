import { defineConfig } from 'vite';
import tsConfigPaths from 'vite-tsconfig-paths';

/**
 * Non-root base for static hosts (e.g. GitHub Pages).
 * - CI: `DEMO_BASE` = `/<repo>/`, `DEMO_APP_SEGMENT` = `camera-test` → `/<repo>/camera-test/`
 * - Local dev: default `/`
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
    plugins: [tsConfigPaths()],
    server: {
      https: {
        key: './.cert/key.pem',
        cert: './.cert/cert.pem',
      },
      host: true,
      cors: false,
    },
  };
});
