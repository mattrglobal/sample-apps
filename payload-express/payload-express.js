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


       // Ask the user for the Acces Token
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
   
       // const token = await askQuestion("Please provide the Access token for your tenant");
       const token = process.argv[2]

    // Provision Presentation Request 
    var got = require('got')

    var tenant = process.env.TENANT;
    var presReq = `https://${tenant}.platform.mattr.global/v1/presentations/requests`
    console.log(presReq);

   
        var {body, statusCode} = await got.post(presReq, {
            
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
        console.log(statusCode);
        console.log(body.request);
       const requestPayload = body.request

    // Get DIDUrl from Verifier DID Doc
    var dids = `https://${tenant}.platform.mattr.global/v1/dids/` + process.env.VERIFIERDID
    console.log(dids);
   
        var {body} = await got.get(dids, {
            
            headers: {
                    "Authorization": `Bearer ${token}`
                },
            responseType: 'json'
        });
     //   console.log(statusCode);
        console.log(body.didDocument.publicKey[0].id);
        const didUrl = body.didDocument.publicKey[0].id;
 

    // Sign payload
    var signMes = `https://${tenant}.platform.mattr.global/v1/messaging/sign`
    console.log(signMes);

   
        var {body} = await got.post(signMes, {
            
            headers: {
                    "Authorization": `Bearer ${token}`
                },
            json: {
                "didUrl": didUrl,
                "payload": requestPayload 
            },
            responseType: 'json'
        });
       // console.log(statusCode);
        console.log(body);

        const jws = body

    // add jws provided by the user and the tenant from .env
    
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
