const { LocalModel } = require('../local.model')

class BeerModel extends LocalModel {
  constructor () {
    super('beer')
  }

  async drink (_id) {
    console.log(`Yum Yum ${this.store[_id].name}`)
  }
}

module.exports = {
  BeerModel,
  beerModel: new BeerModel()
}
