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
      name: 'codegen-api',
      cwd: 'api',
      script: 'npm run codegen -- --watch',
      watch: ['codegen.yml'],
    },

    {
      ...common,
      name: 'prisma',
      cwd: 'api',
      script: 'npm run prisma generate',
      watch: ['./prisma/schema.prisma'],
    },

    {
      ...common,
      name: 'build-api',
      cwd: 'api',
      script: 'npm run watch',
      watch: ['./tsconfig.json', '../tsconfig.json', './.env.development'],
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
      name: 'codegen-app',
      cwd: 'app',
      script: 'npm run codegen -- --watch',
      watch: ['codegen.yml'],
    },

    {
      ...common,
      name: 'app',
      cwd: 'app',
      script: 'npm run start',
      watch: ['./tsconfig.json', '../tsconfig.json', './.env.development'],
      env: {
        NODE_ENV: 'development',
      },
    },
  ],
}
