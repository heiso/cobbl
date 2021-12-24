import cors from '@koa/cors'
import Koa, { DefaultState } from 'koa'
import bodyParser from 'koa-bodyparser'
import helmet from 'koa-helmet'
import trustProxy from 'koa-trust-proxy'
import safelist from '../generated/safelist.json'
import * as account from './account.schema'
import { authenticationMiddleware, authenticationSchemaTransformer } from './core/authentication'
import { Context } from './core/context'
import { graphqlMiddleware } from './core/graphql'
import { log } from './core/logger'
import { prismaMiddleware } from './core/prisma'
import { sessionMiddleware } from './core/session'
import { telemetryMiddleware } from './core/telemetry'
import * as root from './root.schema'
import * as todo from './todo.schema'

const app = new Koa<DefaultState, Context>()

export const graphqlOptions = {
  definitions: [root, todo, account],
  transformers: [authenticationSchemaTransformer],
  isSafelistEnabled: true,
  safelists: [safelist],
}

app.use(trustProxy())
app.use(helmet())
app.use(bodyParser())
app.use(
  cors({
    origin: process.env.APP_URL,
    credentials: true,
    allowMethods: ['GET', 'POST'],
  })
)
app.use(telemetryMiddleware({ serviceName: 'example' }))
app.use(prismaMiddleware())
app.use(sessionMiddleware())
app.use(authenticationMiddleware())
app.use(graphqlMiddleware(graphqlOptions))

app.listen({ port: Number(process.env.PORT) }, () => {
  log.info(`🚀 To infinity...and beyond!`)
})
