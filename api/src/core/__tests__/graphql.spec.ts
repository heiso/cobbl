import { gql } from 'graphql-tag'
import { Resolvers } from '../../../generated/graphql.test'
import { Context } from '../context'
import { graphqlMiddleware } from '../graphql'

const typeDefs = gql`
  type Query {
    isMocked: Boolean
  }
`

const resolvers: Resolvers = {
  Query: {
    isMocked: () => false,
  },
}

const mockResolvers: Resolvers = {
  Query: {
    isMocked: () => true,
  },
}

gql`
  query GetIsMocked {
    isMocked
  }
`

describe('Graphql', () => {
  it('should respond false when not mocked', async () => {
    const ctx = {
      path: '/graphql',
      method: 'POST',
      body: {},
      request: {
        body: {
          query: `query GetIsMocked {
            isMocked
          }`,
          extensions: { mock: false },
        },
      },
    } as Context

    await graphqlMiddleware({
      definitions: [{ typeDefs, resolvers, mockResolvers }],
    })(ctx, async () => {
      expect(ctx.request.body?.extensions?.mock).toBeFalsy()
      return
    })
  })

  it('should respond true when mocked', async () => {
    const ctx = {
      path: '/graphql',
      method: 'POST',
      body: {},
      request: {
        body: {
          query: `query GetIsMocked {
            isMocked
          }`,
          extensions: { mock: true },
        },
      },
    } as Context

    await graphqlMiddleware({
      definitions: [{ typeDefs, resolvers, mockResolvers }],
    })(ctx, async () => {
      expect(ctx.request.body?.extensions?.mock).toBeTruthy()
      return
    })
  })
})
