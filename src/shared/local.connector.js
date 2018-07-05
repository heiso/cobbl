class LocalConnector {
  constructor () {
    this.store = {}
  }

  getStore (name = 'default') {
    if (!this.store[name]) {
      this.store[name] = {}
    }
    return this.store[name]
  }
}

module.exports = {
  localConnector: new LocalConnector()
}
