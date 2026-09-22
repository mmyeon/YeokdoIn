/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    '**/features/**/__tests__/**/*.test.ts',
    '**/actions/__tests__/**/*.test.ts',
    // 컴포넌트 렌더 테스트. 파일 상단 docblock으로 jsdom 환경을 지정한다.
    '**/components/**/__tests__/**/*.test.tsx',
    '**/features/**/__tests__/**/*.test.tsx',
    '**/hooks/__tests__/**/*.test.tsx',
  ],
  transform: {
    // tsconfig의 jsx는 Next가 쓰는 "preserve"라 ts-jest가 그대로 두면 실행할 수
    // 없다. 테스트에서만 react-jsx로 바꿔 변환한다.
    '^.+\\.tsx?$': [
      'ts-jest',
      { tsconfig: { jsx: 'react-jsx' } },
    ],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'features/notation/model/**/*.ts',
    '!features/notation/model/**/__tests__/**',
    'features/programs/model/**/*.ts',
    '!features/programs/model/**/__tests__/**',
    'features/movement-analysis/model/**/*.ts',
    '!features/movement-analysis/model/**/__tests__/**',
    'features/personal-records/model/**/*.ts',
    '!features/personal-records/model/**/__tests__/**',
    'features/workout-grid/model/**/*.ts',
    '!features/workout-grid/model/**/__tests__/**',
    'actions/personalRecords.ts',
  ],
  coverageThreshold: {
    'features/notation/model/': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    'features/programs/model/': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    'features/movement-analysis/model/': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    'features/personal-records/model/': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
