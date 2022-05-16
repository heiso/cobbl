import { addMocksToSchema } from '@graphql-tools/mock'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { DocumentNode, graphql, GraphQLError, GraphQLSchema } from 'graphql'
import { DefaultState, Middleware } from 'koa'
import { ErrorCode } from '../../generated/graphql'
import { Context } from './context'
import { log } from './logger'

type Safelist = {
  version: string
} & Record<string, string>

type SafelistsByVersion = Record<Safelist['version'], Safelist>

type Resolvers = {
  Mutation?: Record<string, unknown>
  Query?: Record<string, unknown>
}

export type TypeDefsAndResolvers = {
  typeDefs: DocumentNode
  resolvers: Resolvers
  mockResolvers?: Resolvers
}

export type GraphqlOptions = {
  path?: string
  definitions: TypeDefsAndResolvers[]
  transformers?: ((schema: GraphQLSchema) => GraphQLSchema)[]
  isSafelistEnabled?: boolean
  safelists?: Safelist[]
  lazyLoadSafelist?: (version: Safelist['version']) => Promise<Safelist | null>
}

let safelistsByVersion: SafelistsByVersion

export function computeSchemas({ definitions, transformers = [] }: GraphqlOptions) {
  let schema = makeExecutableSchema({
    typeDefs: definitions.map(({ typeDefs }) => typeDefs),
    resolvers: definitions.map(({ resolvers }) => resolvers),
  })

  let mockedSchema = addMocksToSchema({
    schema,
    resolvers: definitions.reduce(
      (acc, { mockResolvers }) => (!mockResolvers ? acc : { ...acc, ...mockResolvers }),
      {}
    ),
    preserveResolvers: true,
  })

  transformers.forEach((transformer) => {
    schema = transformer(schema)
    mockedSchema = transformer(mockedSchema)
  })

  return { schema, mockedSchema }
}

async function processSafelist(ctx: Context, { safelists = [], lazyLoadSafelist }: GraphqlOptions) {
  safelistsByVersion = safelists.reduce<SafelistsByVersion>(
    (acc, safelist) => ({ ...acc, [safelist.version]: safelist }),
    {}
  )
  const safelist = ctx.request.body?.extensions?.safelist

  if (!safelist || !safelist.hash || !safelist.version) {
    throw new Error(ErrorCode.FORBIDDEN)
  }

  const { version, hash } = safelist

  if (!safelistsByVersion[version] && lazyLoadSafelist) {
    const safelist = await lazyLoadSafelist(version)
    if (safelist) {
      safelistsByVersion[version] = safelist
    }
  }

  const query = safelistsByVersion[version]?.[hash]
  if (!query) {
    throw new Error(ErrorCode.FORBIDDEN)
  }

  ctx.request.body.query = query
}

function getDeduplicatedErrors(errors: GraphQLError[]) {
  return errors
    .reduce<GraphQLError[]>((acc, error) => {
      const existingError = error.stack && acc.find(({ stack }) => stack === error.stack)

      if (!existingError) {
        const newError = new GraphQLError(error.message, {
          ...error,
          path: undefined,
          extensions: {
            count: 1,
            paths: [error.path],
          },
        })
        newError.stack = error.stack
        acc.push(newError)
      } else {
        existingError.extensions.count = Number(existingError.extensions.count) + 1
        ;(existingError.extensions.paths as unknown[]).push(error.path)
      }

      return acc
    }, [])
    .map((error) => {
      if (typeof error.extensions.count === 'number' && error.extensions.count > 1) {
        error.message = `(x${error.extensions.count}) ${error.message}`
      }
      return error
    })
}

async function processGraphql(ctx: Context, schema: GraphQLSchema, mockedSchema: GraphQLSchema) {
  const { body } = ctx.request
  const { query, operationName, variables, extensions } = body

  if (typeof query !== 'string' || typeof operationName !== 'string') {
    throw new Error(ErrorCode.INTERNAL_SERVER_ERROR, {
      cause: new Error(
        'body.query or body.operationName is invalid, did you forget to enable Safelist ?'
      ),
    })
  }

  ctx.body = await graphql({
    schema: extensions?.mock ? mockedSchema : schema,
    operationName,
    contextValue: ctx,
    source: query,
    variableValues: variables,
  })

  if (ctx.body.errors) {
    getDeduplicatedErrors([...ctx.body.errors]).forEach((error) => {
      if (error.message in ErrorCode) {
        log.warn(error)
      } else {
        log.error(error)
      }
    })
  }
}

export function graphqlMiddleware(options: GraphqlOptions): Middleware<DefaultState, Context> {
  const { schema, mockedSchema } = computeSchemas(options)
  const path = options.path || '/graphql'

  return async function graphqlMiddleware(ctx, next) {
    if (ctx.path === path && ctx.method === 'POST') {
      if (options.isSafelistEnabled) {
        await processSafelist(ctx, options)
      }
      await processGraphql(ctx, schema, mockedSchema)
    }

    return next()
  }
}
