import { randomUUID } from 'crypto'
import { DefaultState, Middleware } from 'koa'
import { Context } from './context'
import { getKey, redis } from './redis'

const COOKIE_NAME = 'session'
const TTL = 30 * 24 * 60 * 60 * 1000 // 30 days
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: true,
  maxAge: TTL,
  domain: process.env.SESSION_COOKIE_DOMAIN,
}

export class Session<TData extends Record<string, unknown> = Record<string, unknown>> {
  id: string | null = randomUUID()
  shouldPersistClientSide = false
  hasBeenLoadedFromClient = false
  data: Partial<TData> = {}

  async load(id: string) {
    const data = await redis.get(getKey(COOKIE_NAME, id))
    if (data) {
      this.data = JSON.parse(data)
      this.id = id
      this.hasBeenLoadedFromClient = true
    } else {
      this.id = null
      this.shouldPersistClientSide = true
    }
  }

  async persist() {
    if (this.id) {
      if (!this.hasBeenLoadedFromClient) {
        this.shouldPersistClientSide = true
      }
      await redis.set(getKey(COOKIE_NAME, this.id), JSON.stringify(this.data), 'PX', TTL)
    }
  }

  async delete() {
    if (this.id) {
      await redis.del(getKey(COOKIE_NAME, this.id))
      this.data = {}
      this.id = null
      this.shouldPersistClientSide = true
    }
  }
}

export function sessionMiddleware(): Middleware<DefaultState, Context> {
  return async function sessionMiddleware(ctx, next) {
    const session = new Session()
    ctx.session = session

    const cookie = ctx.cookies.get(COOKIE_NAME)
    if (cookie) {
      await session.load(cookie)
    }

    await next()

    /**
     * @todo renew token
     */
    if (session.shouldPersistClientSide) {
      ctx.cookies.set(COOKIE_NAME, session.id || '', COOKIE_OPTIONS)
    }
  }
}
