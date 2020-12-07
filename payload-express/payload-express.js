'use strict'

require('dotenv').config();
const express = require('express')
const app = express()

var jwsUrl;
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

// Start ngrok
var ngrokUrl;
const ngrok = require('ngrok');
(async function () {

    ngrokUrl = await ngrok.connect(2001);

// Construct the didcomm URL and check Ngrok is running
    var https = require('https');
    var ngrokTest = `${ngrokUrl}/test`
    let p = new Promise((resolve, reject) => {
        const req = https.get(ngrokTest, function (res) {
            console.log("Ngrok statusCode: ", res.statusCode);
            resolve();
        });
        req.end();
    });
    await p;

    // Ask the user for the JWS
    const readline = require('readline');

    function askQuestion(query) {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        return new Promise(resolve => rl.question(query, answer => {
            rl.close();
            resolve(answer);
        }))
    }

    console.log('ngrok callback URL to use in the presentation request: ', ngrokUrl + '/callback');
    const jws = await askQuestion("Please provide the JWS");

    // add jws provided by the user and the tenant from .env
    var tenant = process.env.TENANT;
    jwsUrl = `https://${tenant}.platform.mattr.global/?request=${jws}`;

    var didcommUrl = `didcomm://${ngrokUrl}/qr`;
    console.log(didcommUrl);

// generate a QR Code using the didcomm url
    var QRCode = require('qrcode');

    QRCode.toString(didcommUrl, {type: 'terminal'}, function (err, url) {
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

})();
