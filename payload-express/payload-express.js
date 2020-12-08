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

var ngrokUrl;
const ngrok = require('ngrok');
(async function () {

    // Start ngrok
    ngrokUrl = await ngrok.connect(2001);

// Construct the didcomm URL and check Ngrok is running
    var got = require('got')
    var response = await got.get(`${ngrokUrl}/test`);
    console.log("Ngrok statusCode: ", response.statusCode);

    // Obtain the Access Token
    const token = process.argv[2]

    // Provision Presentation Request
    var tenant = process.env.TENANT;
    var presReq = `https://${tenant}.platform.mattr.global/v1/presentations/requests`
    console.log(presReq);

    response = await got.post(presReq, {

        headers: {
            "Authorization": `Bearer ${token}`
        },
        json: {
            "challenge": "GW8FGpP6jhFrl37yQZIM6w",
            "did": process.env.VERIFIERDID,
            "templateId": process.env.TEMPLATEID,
            "expiresTime": 1638836401000,
            "callbackUrl": `${ngrokUrl}/callback`
        },
        responseType: 'json'
    });
    console.log(response.statusCode);
    const requestPayload = response.body.request;
    console.log(requestPayload);

    // Get DIDUrl from Verifier DID Doc
    var dids = `https://${tenant}.platform.mattr.global/v1/dids/` + process.env.VERIFIERDID
    console.log(dids);

    response = await got.get(dids, {

        headers: {
            "Authorization": `Bearer ${token}`
        },
        responseType: 'json'
    });
    console.log(response.body.didDocument.publicKey[0].id);
    const didUrl = response.body.didDocument.publicKey[0].id;

    // Sign payload
    var signMes = `https://${tenant}.platform.mattr.global/v1/messaging/sign`
    console.log(signMes);

    response = await got.post(signMes, {

        headers: {
            "Authorization": `Bearer ${token}`
        },
        json: {
            "didUrl": didUrl,
            "payload": requestPayload
        },
        responseType: 'json'
    });
    const jws = response.body
    console.log(jws);

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
