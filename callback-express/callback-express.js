'use strict'

const express = require('express')
const bodyParser = require('body-parser')

const app = express()

// Use body-parser middleware
app.use(bodyParser.json())

// Receive a POST request to /callback & print it out to the terminal
app.post('/callback', function (req, res) {
  const body = req.body
  console.log(body)
})

// listen on port 2000
app.listen(2000, function (err) {
  if (err) {
    throw err
  }

  console.log('Server started on port 2000')
})