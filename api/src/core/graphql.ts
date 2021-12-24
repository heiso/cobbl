import { addMocksToSchema } from '@graphql-tools/mock'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { DocumentNode, graphql, GraphQLSchema } from 'graphql'
import { DefaultState, Middleware } from 'koa'
import { defaultsDeep } from 'lodash'
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
      (acc, { mockResolvers }) => (!!mockResolvers ? defaultsDeep(acc, mockResolvers) : acc),
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

async function processGraphql(ctx: Context, schema: GraphQLSchema, mockedSchema: GraphQLSchema) {
  const { body } = ctx.request
  ctx.request.body
  const { query, operationName, variables, extensions } = body

  ctx.body = await graphql({
    schema: extensions?.mock ? mockedSchema : schema,
    operationName,
    contextValue: ctx,
    source: query,
    variableValues: variables,
  })

  if (ctx.body.errors) {
    log.error(ctx.body.errors)
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
