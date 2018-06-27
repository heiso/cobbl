const config = require('config')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const { graphql } = require('./graphql')

const app = express()

app.use(cors({
  origin: config.get('cors'),
  credentials: true
}))

app.use(bodyParser.json(config.get('bodyParser')))

app.use('/graphql', graphql)

app.listen(config.get('port'), () => {
  console.log('Express running')
})
