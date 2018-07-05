const { LocalModel } = require('../shared/local.model')

class BreweryModel extends LocalModel {
  constructor () {
    super('brewery')
  }
}

module.exports = {
  BreweryModel,
  breweryModel: new BreweryModel()
}
