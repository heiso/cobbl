import { gql } from 'graphql-tag'
import {
  Resolvers,
  testGetPublicAndPrivateQuery,
  testMutatePublicThenPrivateMutation,
} from '../../generated/graphql.test'
import { graphqlOptions } from '../app'
import { computeSchemas } from '../core/graphql'
import { getArgs } from '../core/__tests__/graphql'
import { prisma } from '../core/__tests__/prisma'

const typeDefs = gql`
  type Test {
    something: Boolean
  }

  type Query {
    public: Test @isPublic
    private: Test
  }

  type Mutation {
    public: Test @isPublic
    private: Test
  }

  directive @isPublic on FIELD_DEFINITION
`

const resolvers: Resolvers = {
  Test: {
    something: () => true,
  },

  Query: {
    public: () => ({}),
    private: () => ({}),
  },

  Mutation: {
    public: () => ({}),
    private: () => ({}),
  },
}

gql`
  query GetPublicAndPrivate {
    public {
      something
    }

    private {
      something
    }
  }

  mutation MutatePublicThenPrivate {
    public {
      something
    }

    private {
      something
    }
  }
`

const { schema } = computeSchemas({
  transformers: graphqlOptions.transformers,
  definitions: [...graphqlOptions.definitions, { typeDefs, resolvers }],
})

describe('Authentication', () => {
  let args: Awaited<ReturnType<typeof getArgs>>
  let authenticatedArgs: Awaited<ReturnType<typeof getArgs>>

  beforeAll(async () => {
    const user = await prisma.user.create({ data: { email: 'hubert.fiorentini@wazabi.co' } })

    args = await getArgs()
    args.schema = schema

    authenticatedArgs = await getArgs({ asUser: user })
    authenticatedArgs.schema = schema
  })

  it('should respond to query as a not authenticated user', async () => {
    const result = await testGetPublicAndPrivateQuery(args)
    expect(result.data?.public?.something).toBeTruthy()
    expect(result.data?.private).toBeNull()
    expect(result.errors).toHaveLength(1)
  })

  it('should respond to mutation as a not authenticated user', async () => {
    const result = await testMutatePublicThenPrivateMutation(args)
    expect(result.data?.public?.something).toBeTruthy()
    expect(result.data?.private).toBeNull()
    expect(result.errors).toHaveLength(1)
  })

  it('should respond to query as an authenticated user', async () => {
    const result = await testGetPublicAndPrivateQuery(authenticatedArgs)
    expect(result.data?.public?.something).toBeTruthy()
    expect(result.data?.private?.something).toBeTruthy()
    expect(result.errors).toBeUndefined()
  })

  it('should respond to mutation as an authenticated user', async () => {
    const result = await testMutatePublicThenPrivateMutation(authenticatedArgs)
    expect(result.data?.public?.something).toBeTruthy()
    expect(result.data?.private?.something).toBeTruthy()
    expect(result.errors).toBeUndefined()
  })
})
