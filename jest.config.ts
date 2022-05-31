import type { Config } from '@jest/types'

const common = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  clearMocks: true,
  testMatch: ['<rootDir>/**/*.spec.ts'],
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
}

const config: Config.InitialOptions = {
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  collectCoverage: true,
  coverageReporters: ['lcov', 'text-summary'],
  projects: [
    {
      ...common,
      displayName: 'api',
      rootDir: './api',
      setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
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

export default config
