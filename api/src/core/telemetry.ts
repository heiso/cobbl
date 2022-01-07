import { randomUUID } from 'crypto'
import { DefaultState, Middleware } from 'koa'
import { inspect } from 'util'
import { Context } from './context'
import { log } from './logger'

const SENSITIVE_KEYS = ['password', 'hashedPassword', 'pass', 'secure', 'secret']

type Options = {
  service: string
  version?: string
}

type User = Record<string, unknown> & { email: string }

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && (typeof value === 'object' || typeof value === 'function')
}

function hasCircularStructure(value: unknown): boolean {
  try {
    JSON.stringify(value)
  } catch (err) {
    return (err as Error).toString().includes('Converting circular structure to JSON')
  }
  return false
}

function secureValue(value: unknown): unknown {
  if (value === undefined || value === null) {
    return null
  }

  if (typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'string') {
    let secured = value.replace(/\\n\s+|\\n|\\t\s+|\\t/g, ' ')
    SENSITIVE_KEYS.forEach((sensitiveKey) => {
      secured = secured
        .replace(new RegExp(`${sensitiveKey}: (\\".+\\"|".+")`, 'ig'), `${sensitiveKey}: ***`)
        .replace(new RegExp(`${sensitiveKey}=(\\".+\\"|".+")`, 'ig'), `${sensitiveKey}=***`)
    })
    return secured
  }

  if (Array.isArray(value)) {
    return value.map((item: unknown) => secureValue(item))
  }

  if (isPlainObject(value)) {
    const secured = { ...value }
    Object.keys(secured).forEach((key) => {
      const item = secured[key]
      if (typeof item === 'string' && SENSITIVE_KEYS.includes(key)) {
        secured[key] = '***'
      } else if (hasCircularStructure(item)) {
        secured[key] = 'Circular structure truncated'
      } else {
        secured[key] = secureValue(item)
      }
    })
    return secured
  }

  return value
}

function stringifyValue(value: unknown): string {
  const secured = secureValue(value)

  if (typeof secured === 'string') {
    return secured
  }

  try {
    return JSON.stringify(secured, null, 2)
  } catch (err) {
    return inspect(secured) // https://nodejs.org/api/util.html#util_util_inspect_object_options
  }
}

export class Telemetry {
  public id: string
  public meta: Record<string, unknown>
  public tags: Record<string, string>
  public user: User | null

  constructor(id: string = randomUUID()) {
    this.id = id
    this.meta = {}
    this.tags = { id: this.id }
    this.user = null

    this.updateLoggerDefaultMeta()
  }

  private updateLoggerDefaultMeta() {
    log.defaultMeta = {
      tags: this.tags,
      meta: this.meta,
      user: this.user,
    }
  }

  setMeta(key: string, value: unknown, stringify = false) {
    let securedValue = secureValue(value)

    if (stringify) {
      securedValue = stringifyValue(value)
    }

    this.meta[key] = securedValue

    this.updateLoggerDefaultMeta()
  }

  setTag(key: string, value?: string) {
    if (value) {
      const securedValue = stringifyValue(secureValue(value))

      this.tags[key] = securedValue
    }

    this.updateLoggerDefaultMeta()
  }

  setUser(user: User) {
    this.user = secureValue(user) as User

    this.updateLoggerDefaultMeta()
  }
}

export function telemetryMiddleware({
  service,
  version,
}: Options): Middleware<DefaultState, Context> {
  return async function telemetryMiddleware(ctx, next) {
    const start = Date.now()

    let transactionId = ctx.headers['x-transaction-id']
    if (Array.isArray(transactionId)) {
      transactionId = transactionId[0]
    }

    const telemetry = new Telemetry(transactionId)
    ctx.telemetry = telemetry

    telemetry.setTag('service', service)
    telemetry.setTag('version', version)

    telemetry.setMeta('query', ctx.query)
    telemetry.setMeta('headers', ctx.request.headers)
    telemetry.setMeta('path', ctx.originalUrl)

    if (ctx.request.path === '/health') {
      ctx.body = { service, status: 'running', version }
    }
    let error: unknown

    try {
      await next()
    } catch (err) {
      if (err instanceof Error) {
        error = err
        ctx.body = err.message
        ctx.status = ctx.status === 200 ? 500 : ctx.status
      }
    }

    const duration = Date.now() - start

    telemetry.setMeta('ip', ctx.ip)
    telemetry.setMeta('body', ctx.request.body)
    telemetry.setMeta('status', ctx.response.status)
    telemetry.setMeta('duration', duration)

    log[!!error ? 'error' : 'info'](
      `${ctx.method} ${ctx.path}${
        ctx.request.body?.operationName ? ` ${ctx.request.body?.operationName}` : ''
      } -> ${ctx.status}: ${duration}ms`,
      error
    )
  }
}
