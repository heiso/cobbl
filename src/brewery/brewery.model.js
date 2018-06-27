const { LocalModel } = require('../local.model')

class BreweryModel extends LocalModel {
  constructor () {
    super('brewery')
  }
}

module.exports = {
  BreweryModel,
  breweryModel: new BreweryModel()
}
