import { redis } from './redis'

/**
 * Implement a redis rate limiter for a given ip
 * <index> is allowed to perform <limit> requests per <timeRange> seconds
 * See example here https://redis.io/commands/INCR#pattern-rate-limiter-2
 *
 * @param label
 * @param index What we want to track (ip, email...)
 * @param limit How many it can run without throwing
 * @param timeRange For how long the limit will stack itslef
 * @example if (await isRateLimited('login-by-ip', ctx.ip, 10, 60)) {
 *     log.warn('too many request per ip per minute')
 * }
 */
export async function isRateLimited(label: string, index: string, limit = 10, timeRange = 60) {
  const key = `${process.env.NODE_ENV}:rate-limiter:${label}:${index}`
  const count = await redis.incr(key)
  if (count === 1) {
    await redis.expire(key, timeRange)
  }
  return count > limit
}
