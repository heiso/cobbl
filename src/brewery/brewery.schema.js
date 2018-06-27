const { beerModel } = require('../beer/beer.model')
const { breweryModel } = require('./brewery.model')

const typeDefs = `
  type Brewery {
    _id: ID
    name: String
    location: String
    beers: [Beer]
  }

  type PaginatedBreweries {
    options: JSON
    count: Int
    items: [Beer]
  }

  input CreateBreweryInput {
    name: String!
    location: String
  }
  
  extend type Query {
    getBrewery(_id: ID!): Brewery
    getBreweries(offset: Int, limit: Int, sort: String): PaginatedBreweries
  }

  extend type Mutation {
    createBrewery(input: CreateBreweryInput!): Brewery
  }
`

const resolvers = {
  Query: {
    async getBrewery (parent, args, context) {
      return breweryModel.get(args, context)
    },
    async getBreweries (parent, args, context) {
      return breweryModel.list(args, context)
    }
  },
  Brewery: {
    async beers (parent, args, context) {
      return beerModel.toMany(parent, '_id', 'brewery', args, context)
    }
  },
  Mutation: {
    async createBrewery (parent, {input}, context) {
      return breweryModel.create(input, context)
    }
  }
}

module.exports = {
  typeDefs,
  resolvers
}
