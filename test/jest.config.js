/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

process.env.TZ = 'UTC';

module.exports = {
  rootDir: '../',
  setupFiles: ['<rootDir>/test/setupTests.ts'],
  setupFilesAfterEnv: ['<rootDir>/test/setup.jest.ts', '<rootDir>/test/suppress-console.js'],
  roots: ['<rootDir>'],
  testMatch: ['**/*.test.js', '**/*.test.jsx', '**/*.test.ts', '**/*.test.tsx'],
  clearMocks: true,
  modulePathIgnorePatterns: ['<rootDir>/offline-module-cache/'],
  testPathIgnorePatterns: ['<rootDir>/build/', '<rootDir>/node_modules/'],
  snapshotSerializers: ['enzyme-to-json/serializer'],
  coveragePathIgnorePatterns: [
    '<rootDir>/build/',
    '<rootDir>/node_modules/',
    '<rootDir>/test/',
    '<rootDir>/public/requests/',
  ],
  transformIgnorePatterns: ['<rootDir>/node_modules'],
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': '<rootDir>/test/__mocks__/styleMock.js',
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/test/__mocks__/fileMock.js',
    '\\@algolia/autocomplete-theme-classic$': '<rootDir>/test/__mocks__/styleMock.js',
    '^!!raw-loader!.*': 'jest-raw-loader',
  },
  testEnvironment: 'jsdom',
  collectCoverage: false, // Set to true to always collect coverage
  collectCoverageFrom: [
    'public/components/**/*.{js,jsx,ts,tsx}',
    '!public/**/*.d.ts',
    '!public/**/*.test.{js,jsx,ts,tsx}',
    '!public/**/__tests__/**',
    '!public/**/node_modules/**',
    '!public/**/build/**',
    '!public/**/target/**',
    '!public/**/index.ts',
    '!public/**/index.tsx',
    '!public/**/home.tsx',
    '!public/**/types.ts',
    '!public/**/types/**',
    '!public/components/experiment/configuration/form/**',
    '!public/components/experiment/configuration/template_configuration.tsx',
    '!public/components/experiment/metrics/**',
    '!public/components/experiment/views/**',

    '!public/components/common/**',
    '!public/components/common_utils/**',
    '!public/components/resource_management_home/**',
    '!public/components/service_card/**',
    '!public/components/app.tsx',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
