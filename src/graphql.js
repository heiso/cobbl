const _ = require('lodash')
const { makeExecutableSchema } = require('graphql-tools')
const { graphqlExpress } = require('apollo-server-express')
const rootSchema = require('./root/root.schema')

const beerSchema = require('./beer/beer.schema')
const brewerySchema = require('./brewery/brewery.schema')

const schemas = [beerSchema, brewerySchema]

function mergeSchemas (schemas = []) {
  return {
    typeDefs: [rootSchema.typeDefs, ..._.map(schemas, 'typeDefs')],
    resolvers: _.merge(rootSchema.resolvers, ..._.map(schemas, 'resolvers')),
    directiveResolvers: _.merge(rootSchema.directiveResolvers, ..._.map(schemas, 'directiveResolvers')),
    schemaDirectives: _.merge(rootSchema.schemaDirectives, ..._.map(schemas, 'schemaDirectives'))
  }
}

const schema = makeExecutableSchema(mergeSchemas(schemas))

const graphql = graphqlExpress((req, res) => {
  return {
    schema,
    context: {
      req,
      res
    }
  }
})

module.exports = { graphql }
