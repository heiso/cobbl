const _ = require('lodash')
const { localConnector } = require('./local.connector')

class LocalModel {
  constructor (name) {
    this.store = localConnector.getStore(name)
  }

  async count (query, context) {
    return _.size(this.store)
  }

  async get (id, context) {
    return this.store[id]
  }

  async getSome (ids = [], context) {
    return _.filter(this.store, (item) => ids.includes(item.id))
  }

  async list (options, context) {
    return _.values(this.store)
  }

  async toMany (parent, key, fKey, options, context) {
    return _.filter(this.store, (item) => item[fKey] === parent[key])
  }

  async create (input, context) {
    input = {
      ...input,
      id: _.snakeCase(input.name),
      createdAt: new Date()
    }
    this.store[input.id] = input
    return input
  }

  async update (id, input, context) {
    this.store[id] = {
      ...this.store[id],
      ...input,
      updatedAt: new Date()
    }
    return this.store[id]
  }

  async delete (id, context) {
    const deleted = _.clone(this.store[id])
    this.store[id] = undefined
    return deleted
  }
}

module.exports = {
  LocalModel
}
