import type { JestConfigWithTsJest } from 'ts-jest';

const jestConfig: JestConfigWithTsJest = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    'src/PresentationManager/@PresentationManager.ts',
    'src/CallManager/RemoteStreamsManager.ts',
    '!<rootDir>/node_modules/',
    '!<rootDir>/demoDist/**',
    '!<rootDir>/dist/**',
    '!**/__tests-utils__/**',
    '!**/__fixtures__/**',
    '!src/**/*.d.ts',
    '!src/**/types.ts',
    '!src/**/typings.ts',
    '!src/**/constants.ts',
    '!src/**/index.ts',
    '!src/doMock.ts',
  ],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  reporters: ['default', 'jest-junit'],
  coverageReporters: ['text', 'text-summary', 'lcov'],
  coverageDirectory: 'coverage',
  coverageProvider: 'babel',
  coverageThreshold: {
    global: {
      statements: 0,
      branches: 0,
      functions: 0,
      lines: 0,
    },
  },
  clearMocks: true,
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // Force CJS: jsdom resolution picks sinon’s browser export (ESM), which Jest cannot parse.
    '^sinon$': '<rootDir>/../../node_modules/sinon/lib/sinon.js',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        diagnostics: false,
      },
    ],
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.[jt]s?(x)',
    '<rootDir>/src/**/?(*.)+(spec|test).[jt]s?(x)',
  ],
};

export default jestConfig;
