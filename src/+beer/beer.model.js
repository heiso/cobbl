const { LocalModel } = require('../shared/local.model')

class BeerModel extends LocalModel {
  constructor () {
    super('beer')
  }

  async drink (id) {
    return `Gulp Gulp ${this.store[id].name}`
  }
}

module.exports = {
  BeerModel,
  beerModel: new BeerModel()
}
