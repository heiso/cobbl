const _ = require('lodash')
const { localConnector } = require('./local.connector')

class LocalModel {
  constructor (name) {
    this.store = localConnector.getStore(name)
  }

  async count (query, context) {
    return _.size(this.store)
  }

  async get (_id, context) {
    return this.store[_id]
  }

  async getSome (ids = [], context) {
    return _.filter(this.store, (item) => ids.includes(item._id))
  }

  async list (options, context) {
    const items = _.values(this.store)
    return this._paginate(items, options)
  }

  async toMany (parent, key, fKey, options, context) {
    const items = _.filter(this.store, (item) => item[fKey] === parent[key])
    return this._paginate(items, options)
  }

  async create (input, context) {
    input = {
      ...input,
      _id: _.snakeCase(input.name),
      createdAt: new Date()
    }
    this.store[input._id] = input
    return input
  }

  async update (_id, input, context) {
    this.store[_id] = {
      ...this.store[_id],
      ...input,
      updatedAt: new Date()
    }
    return this.store[_id]
  }

  async delete (_id, context) {
    const deleted = _.clone(this.store[_id])
    this.store[_id] = undefined
    return deleted
  }

  _paginate (items = [], options) {
    const count = items.length
    let offset = options.offset || 0
    let limit = options.offset + (options.limit || items.length)
    if (options.sort) {
      items = _.sortBy(items, options.sort)
    }
    items = items.slice(offset, limit)
    return {
      options,
      count,
      items
    }
  }
}

module.exports = {
  LocalModel
}
