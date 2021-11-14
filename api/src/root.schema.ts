import { gql } from 'graphql-tag'
import { Resolvers } from '../generated/graphql'

export const typeDefs = gql`
  enum ErrorCode {
    INTERNAL_SERVER_ERROR
    UNAUTHENTICATED
    FORBIDDEN
    BAD_USER_INPUT
  }

  type Query {
    noop: Boolean
  }

  type Mutation {
    noop: Boolean
  }

  type Subscription {
    noop: Boolean
  }

  directive @isPublic on FIELD_DEFINITION
`

export const resolvers: Resolvers = {
  Query: {
    noop: () => true,
  },

  Mutation: {
    noop: () => true,
  },

  // Subscription: {
  //   noop: () => true,
  // },
}
