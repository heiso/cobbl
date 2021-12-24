module.exports = {
  apps: [
    {
      name: 'codegen-api',
      cwd: 'api',
      autorestart: false,
      script: 'npm run codegen -- --watch',
      watch: ['codegen.yml'],
    },

    {
      name: 'prisma',
      cwd: 'api',
      script: 'npm run prisma generate',
      autorestart: false,
      watch: ['./prisma/schema.prisma'],
    },

    {
      name: 'build-api',
      cwd: 'api',
      autorestart: false,
      script: 'npm run watch',
      watch: ['./tsconfig.json', '../tsconfig.json', './.env.development'],
    },

    {
      name: 'api',
      cwd: 'api',
      autorestart: false,
      script: 'npm run dev',
      watch: ['./dist/src'],
      env: {
        NODE_ENV: 'development',
      },
    },

    {
      name: 'codegen-app',
      cwd: 'app',
      autorestart: false,
      script: 'npm run codegen -- --watch',
      watch: ['codegen.yml'],
    },

    {
      name: 'app',
      cwd: 'app',
      autorestart: false,
      script: 'npm run start',
      watch: ['./tsconfig.json', '../tsconfig.json', './.env.development'],
      env: {
        NODE_ENV: 'development',
      },
    },
  ],
}
