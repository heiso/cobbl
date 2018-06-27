const { gql } = require('apollo-server')
const GraphQLJSON = require('graphql-type-json')
const { version } = require('../../package.json')

const typeDefs = gql`
  type Query {
    health: JSON
    version: String
  }

  type Mutation {
    noop(bool: Boolean): Boolean
  }

  scalar JSON

  schema {
    query: Query
    mutation: Mutation
  }
`

const resolvers = {
  Query: {
    health: () => ({
      app: true
    }),
    version: () => version
  },
  Mutation: {
    noop: (parent, args, context) => args.bool
  },
  JSON: GraphQLJSON
}

module.exports = {
  typeDefs,
  resolvers
}
