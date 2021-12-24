import Redis from 'ioredis'

export const redis = new Redis(process.env.REDIS_URL)

export function getKey(namespace: string, key: string): string {
  return `${process.env.NODE_ENV}:${namespace}:${key}`
}
