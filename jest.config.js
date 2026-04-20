/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/features/**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'features/notation/model/**/*.ts',
    '!features/notation/model/**/__tests__/**',
  ],
  coverageThreshold: {
    'features/notation/model/': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
