export default {
  collectCoverage: true,
  coverageReporters: ['lcov', 'text-summary'],
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
  projects: [
    {
      preset: 'ts-jest',
      testEnvironment: 'node',
      clearMocks: true,
      displayName: 'int',
      testMatch: ['<rootDir>/tests/**/*.spec.ts'],
    },
  ],
}
