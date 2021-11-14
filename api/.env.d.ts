declare module 'process' {
  global {
    namespace NodeJS {
      interface ProcessEnv {
        readonly NODE_ENV: 'development' | 'production' | 'test'
        readonly PORT: string | undefined
        readonly REDIS_URL: string | undefined
        readonly DATABASE_URL: string | undefined
      }
    }
  }
}
