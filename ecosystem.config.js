const common = {
  instances: 1,
  autorestart: false,
  log_date_format: 'HH:mm:ss',
  vizion: false,
}

module.exports = {
  apps: [
    {
      ...common,
      name: 'build',
      script: 'npx turbo run build:apps --ignore="app"',
      watch: [
        './api/src/**/*',
        './packages/*/src/**/*',
        './**/codegen.yml',
        './**/prisma/schema.prisma',
        './**/tsconfig.json',
        './**/tsconfig.build.json',
        './**/.env.development',
        './package-lock.json',
      ],
      ignore_watch: ['node_modules'],
    },

    {
      ...common,
      name: 'api',
      cwd: 'api',
      script: 'npm run dev',
      watch: ['./dist/src'],
      env: {
        NODE_ENV: 'development',
      },
    },

    {
      ...common,
      name: 'app-codegen',
      cwd: 'app',
      script: 'npm run codegen:graphql',
      watch: [
        '../api/src/**/*.schema.ts',
        '../packages/*/dist/**/*',
        './codegen.yml',
        './app/**/*.tsx',
      ],
      ignore_watch: ['node_modules'],
    },

    {
      ...common,
      name: 'app',
      cwd: 'app',
      script: 'npm run dev',
      watch: ['./tsconfig.json', '../tsconfig.json'],
      env: {
        NODE_ENV: 'development',
      },
    },
  ],
}
