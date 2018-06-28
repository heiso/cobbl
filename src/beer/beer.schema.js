const { gql } = require('apollo-server')
const { beerModel } = require('./beer.model')
const { breweryModel } = require('../brewery/brewery.model')

const typeDefs = gql`
  type Beer @extends(type: "Resource") {
    name: String
    brewery: Brewery
  }

  type PaginatedBeers {
    options: JSON
    count: Int
    items: [Beer]
  }

  input CreateBeerInput {
    name: String!
    brewery: ID!
  }

  extend type Query {
    getBeer(_id: ID!): Beer
    getBeers(offset: Int = 0, limit: Int = 100, sort: String): PaginatedBeers
  }

  extend type Mutation {
    createBeer(input: CreateBeerInput!): Beer
    drinkBeer(_id: ID!): String
  }
`

const resolvers = {
  Query: {
    async getBeer (parent, args, context) {
      return beerModel.get(args, context)
    },
    async getBeers (parent, args, context) {
      return beerModel.list(args, context)
    }
  },
  Beer: {
    async brewery (parent, args, context) {
      return breweryModel.get(parent.brewery, context)
    }
  },
  Mutation: {
    async createBeer (parent, {input}, context) {
      return beerModel.create(input, context)
    },
    async drinkBeer (parent, {_id}, context) {
      return beerModel.drink(_id, context)
    }
  }
}

module.exports = {
  typeDefs,
  resolvers
}
