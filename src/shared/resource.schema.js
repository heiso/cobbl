const { gql } = require('apollo-server')

const typeDefs = gql`
  type Resource {
    id: ID
    createdAt: String
    updatedAt: String
  }
`

module.exports = {
  typeDefs
}
