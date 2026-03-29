import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vite';
import tsConfigPaths from 'vite-tsconfig-paths';

const configDir = dirname(fileURLToPath(import.meta.url));

/**
 * Dev HTTPS only when mkcert files exist (`yarn cert`). Otherwise HTTP — avoids
 * `PEM routines::no start line` if `.cert/` is missing or empty.
 */
function resolveDevHttps(): { cert: Buffer; key: Buffer } | undefined {
  const keyPath = join(configDir, '.cert/key.pem');
  const certPath = join(configDir, '.cert/cert.pem');

  if (!existsSync(keyPath) || !existsSync(certPath)) {
    return undefined;
  }

  try {
    const key = readFileSync(keyPath);
    const cert = readFileSync(certPath);
    const keyText = key.toString('utf8').trimStart();
    const certText = cert.toString('utf8').trimStart();

    if (!keyText.startsWith('-----BEGIN') || !certText.startsWith('-----BEGIN')) {
      return undefined;
    }

    return { cert, key };
  } catch {
    return undefined;
  }
}

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
  const https = resolveDevHttps();

  return {
    base: resolveDemoBase(),
    build: {
      outDir: 'dist',
    },
    plugins: [tsConfigPaths()],
    server: {
      ...(https !== undefined ? { https } : {}),
      host: true,
      cors: false,
    },
  };
});
