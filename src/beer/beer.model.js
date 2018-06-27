const { LocalModel } = require('../local.model')

class BeerModel extends LocalModel {
  constructor () {
    super('beer')
  }

  async drink (_id) {
    return `Gulp Gulp ${this.store[_id].name}`
  }
}

module.exports = {
  BeerModel,
  beerModel: new BeerModel()
}
