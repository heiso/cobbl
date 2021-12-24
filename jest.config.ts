const common = {
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest'],
  },
  testEnvironment: 'node',
  clearMocks: true,
  testMatch: ['<rootDir>/**/*.spec.ts'],
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
}

export default {
  collectCoverage: true,
  coverageReporters: ['lcov', 'text-summary'],
  projects: [
    {
      ...common,
      displayName: 'api',
      rootDir: './api',
      setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.ts'],
    },
    {
      ...common,
      displayName: 'graphql-codegen-operations-safelist',
      rootDir: './packages/graphql-codegen-operations-safelist',
    },
    {
      ...common,
      displayName: 'graphql-codegen-typescript-operations-tester',
      rootDir: './packages/graphql-codegen-typescript-operations-tester',
    },
  ],
}
