const { ApolloServer } = require('apollo-server')

const schemas = [
  './shared/resource.schema',

  './root/root.schema',
  './beer/beer.schema',
  './brewery/brewery.schema'
]

const directives = [
  './directives/extends.directive'
]

const graphqlServer = new ApolloServer({
  typeDefs: [...schemas, ...directives].map((path) => require(path).typeDefs),
  resolvers: schemas.map((path) => require(path).resolvers),
  schemaDirectives: directives.reduce((acc, path) => {
    acc = {
      ...acc,
      ...require(path).schemaDirectives
    }
    return acc
  }, {}),
  context: ({req, res}) => ({
    req,
    res
  })
})

module.exports = { graphqlServer }
