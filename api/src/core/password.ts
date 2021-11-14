import { randomBytes, scryptSync, timingSafeEqual } from 'crypto'

const SEPARATOR = ':'

/**
 * We want to have a computation time ~500ms to prevent fast bruteforce attacks.
 * But when testing and developing, we want it to be fast.
 */
const OPTIONS =
  process.env.NODE_ENV === 'production'
    ? {
        cost: 2 << 16,
        maxmem: 32 * 16 * 1024 * 1024,
      }
    : {}

function hashPassword(password: string, salt: string) {
  return scryptSync(password, salt, 64, OPTIONS).toString('hex')
}

export function generateHash(password: string) {
  const salt = randomBytes(16).toString('hex')
  return `${hashPassword(password, salt)}${SEPARATOR}${salt}`
}

export function safeCompare(password: string, hash: string) {
  const [hashedPassword, salt] = hash.split(SEPARATOR)

  if (!salt) {
    throw new Error("Can't compare password, salt is undefined")
  }

  return timingSafeEqual(Buffer.from(hashedPassword), Buffer.from(hashPassword(password, salt)))
}
