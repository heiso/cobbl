declare module 'process' {
  global {
    namespace NodeJS {
      interface ProcessEnv {
        readonly NODE_ENV: 'development' | 'production' | 'test'
        readonly LOG_LEVEL:
          | 'error'
          | 'warn'
          | 'info'
          | 'http'
          | 'verbose'
          | 'debug'
          | 'silly'
          | undefined
        readonly PORT: string | undefined
        readonly REDIS_URL: string | undefined
        readonly DATABASE_URL: string | undefined
      }
    }
  }
}
