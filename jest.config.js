export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/main.ts',
    '!src/rendering/GameRenderer.ts'
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/test/'
  ],
  moduleNameMapper: {
    '^konva$': '<rootDir>/test/__mocks__/konva.ts'
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: './test/tsconfig.json'
      }
    ]
  }
};
