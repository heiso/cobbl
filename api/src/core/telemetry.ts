import { randomUUID } from 'crypto'
import { DefaultState, Middleware } from 'koa'
import { inspect } from 'util'
import { Context } from './context'
import { log } from './logger'

const SENSITIVE_KEYS = ['password', 'hashedPassword', 'pass', 'secure', 'secret']

type Options = {
  serviceName: string
  version?: string
}

type User = Record<string, unknown> & { email: string }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isObjectWithToJSON(value: any): value is { toJSON: () => any } {
  return value?.toJSON && typeof value.toJSON === 'function'
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return String(value) === '[object Object]'
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

  if (isObjectWithToJSON(value)) {
    return secureValue(value.toJSON())
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
  public errors: Error[]
  public tags: Record<string, string>
  public user: User | null

  constructor() {
    this.id = randomUUID()
    this.meta = {}
    this.errors = []
    this.tags = { id: this.id }
    this.user = null

    this.updateLoggerDefaultMeta()
  }

  private updateLoggerDefaultMeta() {
    log.defaultMeta = {
      tags: this.tags,
      meta: this.meta,
      errors: this.errors,
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

  setErrors(errors: Error[]) {
    this.errors = [
      ...this.errors,
      ...(secureValue(errors.map((err) => ({ ...err, stack: err.stack }))) as Error[]),
    ]

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

/**
 * Log errors and warning asap
 * log and tracing are not the same. Do not mix everything.
 * What about log level ? is info too much ?
 * But logs can be used for perfs dashboards
 * maybe use Debug all the time and
 *
 * be more observability compliant
 */

export function telemetryMiddleware(options: Options): Middleware<DefaultState, Context> {
  return async function telemetryMiddleware(ctx, next) {
    ctx.onerror = (err) => {
      if (err) {
        log.error(err)
      }
    }

    const start = Date.now()
    const telemetry = new Telemetry()
    const operationName = ctx.request.body?.operationName

    ctx.telemetry = telemetry

    telemetry.setTag('service', options.serviceName)
    telemetry.setTag('version', options.version)

    telemetry.setMeta('headers', ctx.request.headers)
    telemetry.setMeta('body', ctx.request.body)
    telemetry.setMeta('graphql', {
      operationName,
      query: ctx.request.body?.query,
      variables: ctx.request.body?.variables,
    })

    if (ctx.request.path === '/health') {
      ctx.body = { service: options.serviceName, status: 'running', version: options.version }
    }

    await next().finally(() => {
      const duration = Date.now() - start

      telemetry.setMeta('status', ctx.response.status)
      telemetry.setMeta('duration', duration)

      log.info(`${ctx.path}${operationName ? ` ${operationName}` : ''} -> ${duration}ms`)
    })
  }
}
