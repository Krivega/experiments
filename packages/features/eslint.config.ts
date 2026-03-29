 
import { fileURLToPath } from 'node:url';

import { includeIgnoreFile } from '@eslint/compat';
import configJest from '@krivega/eslint-config/jest';
import configReact from '@krivega/eslint-config/react';
import { defineConfig } from 'eslint/config';
import formatjs from 'eslint-plugin-formatjs'; 

const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url));

export default defineConfig([
  includeIgnoreFile(gitignorePath),
  {
    extends: [configJest, configReact],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: fileURLToPath(new URL('./', import.meta.url)),
      },
    },
  },
  formatjs.configs.recommended,
  {
    plugins: { formatjs },
    rules: {
      'formatjs/enforce-id': ['error', { idInterpolationPattern: '[sha512:contenthash:base64:6]' }],
    },
  },
  {
    files: ['**/*.stories.tsx'],
    rules: {
      'formatjs/no-literal-string-in-jsx': 'off',
    },
  },
]);
