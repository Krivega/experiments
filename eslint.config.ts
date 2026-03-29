import { includeIgnoreFile } from '@eslint/compat';
import { defineConfig } from 'eslint/config';
import { fileURLToPath } from 'node:url'; 

// Базовые конфиги
import jestConfigImported from '@krivega/eslint-config/jest';
import reactConfigImported from '@krivega/eslint-config/react';

import type { Linter } from 'eslint';
 
const jestConfig = jestConfigImported as Linter.Config[];
const reactConfig = reactConfigImported as Linter.Config[];

const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url));

// Общие правила для всех пакетов
const commonRules = {};

// Функция для создания конфига пакета
function createPackageConfig(
  packagePath: string,
  extendsConfigs: Linter.Config[][],
  additionalRules: Linter.Config['rules'] = {},
) {
  const tsconfigRootDir = fileURLToPath(new URL(`./${packagePath}/`, import.meta.url));
  const tsconfigPath = fileURLToPath(new URL(`./${packagePath}/tsconfig.json`, import.meta.url));

  return {
    files: [`${packagePath}/src/**/*.{js,ts,tsx}`],
    extends: extendsConfigs,
    languageOptions: {
      parserOptions: {
        tsconfigRootDir,
        project: tsconfigPath, // Критически важно!
        sourceType: 'module' as const,
      },
    },
    rules: {
      ...commonRules,
      'import/no-extraneous-dependencies': [
        'error',
        {
          packageDir: [tsconfigRootDir],
        },
      ] as Linter.RuleEntry,
      ...additionalRules,
    },
  };
}

export default defineConfig([
  includeIgnoreFile(gitignorePath),
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/out/**',
      '**/*.config.js',
      '**/eslint.config.js',
      '**/coverage/**',
      '**/.nyc_output/**',
      '**/public/**',
      '**/releaseNotes/**',
    ],
  },
 
  createPackageConfig('packages/apps/camera-test', [jestConfig, reactConfig]),
  createPackageConfig('packages/apps/noise-suppression', [jestConfig, reactConfig]),
  createPackageConfig('packages/components', [jestConfig, reactConfig]),
  createPackageConfig('packages/mediastream-api', [jestConfig]),
  createPackageConfig('packages/system-devices', [jestConfig]),
  createPackageConfig('packages/video-processor', [jestConfig], {
    "unicorn/filename-case": "off",
  }),
  createPackageConfig('packages/utils', [jestConfig]),
  createPackageConfig('packages/timeout-requester', [jestConfig]),
  createPackageConfig('packages/audio-utils', [jestConfig]),
  createPackageConfig('packages/noise-suppression', [jestConfig]),
  // createPackageConfig('packages/features', [jestConfig, reactConfig]),
  createPackageConfig('packages/framework', [jestConfig, reactConfig]),
  createPackageConfig('packages/mst-tools', [jestConfig]),
  createPackageConfig('packages/test-utils', [jestConfig]),
]);
