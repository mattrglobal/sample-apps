'use strict'

require('dotenv').config();
const express = require('express')
const app = express()

app.get('/qr', function (req, res) {
    const body = res.body
    console.log(jwsUrl)
    res.redirect(jwsUrl)
  })

app.get('/test', function (req, res) {
    const body = res.body
    res.sendStatus(200)
  })
  
  // listen on port 2001
  app.listen(2001, function (err) {
    if (err) {
      throw err
    }
  
    console.log('Server started on port 2001')
  })

var arg = process.argv.slice(2);


// add jws from argument and the tenant from .env
var jws = arg[0];
var tenant = process.env.TENANT;
var jwsUrl = `https://${tenant}.platform.mattr.global/?request=${jws}`;



// Construct the didcomm URL and check Ngrok from .env is running
var https = require('https');
var ngrokTest = `${process.env.NGROK}/test`
https.get(ngrokTest, function(res) {
    console.log("Ngrok statusCode: ", res.statusCode);
})

var didcommUrl = `didcomm://${process.env.NGROK}/qr`;
console.log(didcommUrl);

// generate a QR Code using the didcomm url
var QRCode = require('qrcode');

QRCode.toString(didcommUrl,{type:'terminal'}, function (err, url) {
    console.log(url)
  })



// Receive the Callback
const bodyParser = require('body-parser')

// Use body-parser middleware
app.use(bodyParser.json())

// Receive a POST request to /callback & print it out to the terminal
app.post('/callback', function (req, res) {
  const body = req.body
  console.log(body)
  res.sendStatus(200)
})

