'use strict'

import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import ngrok from '@ngrok/ngrok'
import QRCode from 'qrcode'
import bodyParser from 'body-parser'


const token = process.argv[2];

if (token === undefined) {
  throw new Error('Access token is missing - include a valid JWT as an argument')
}

const startServer = () => {
  return new Promise((resolve, reject) => {
    const app = express()

    app.use(bodyParser.json())

    app.get('/test', function(_req, res) {
      res.sendStatus(200)
    })

    // Receive a POST request to /callback & print it out to the terminal
    app.post('/callback', function(req, res) {
      const body = req.body
      console.log('\n Data from the Presentation is shown below \n', body)
      res.sendStatus(200)
      console.log('Exiting app')
      process.exit(0)
    })

    // listen on port 2000
    const server = app.listen(2000, function(err) {
      if (err) {
        reject(err)
      } else {
        console.log('\n', 'Server started on port 2000', '\n')
        resolve(server);
      }
    })
  })
}

(async function() {
  await startServer();

  // Start ngrok and check that it is running
  const ngrokListener = await ngrok.forward({ addr: 2000, authtoken: process.env.NGROK_AUTHTOKEN });
  const ngrokUrl = ngrokListener.url();
  let ngrokResponse = await fetch(`${ngrokUrl}/test`, { method: "GET" });
  console.log("Ngrok statusCode: ", ngrokResponse.status);

  // Create Presentation Request
  let tenant = process.env.TENANT;
  let presentationRequestUrl = `https://${tenant}/v2/credentials/web-semantic/presentations/requests`
  console.log("Creating Presentation Request at ", presentationRequestUrl);

  let createPresentationRequestResponse = await fetch(presentationRequestUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "challenge": "GW8FGpP6jhFrl37yQZIM6w",
      "did": process.env.VERIFIERDID,
      "templateId": process.env.TEMPLATEID,
      "callbackUrl": `${ngrokUrl}/callback`
    })
  });
  console.log("Create Presentation Request statusCode: ", createPresentationRequestResponse.status);

  const { didcommUri } = await createPresentationRequestResponse.json();
  console.log("The URL encoded in this QR code", didcommUri);

  // Generate QR code
  QRCode.toString(didcommUri, { type: 'terminal' }, function(_err, url) {
    console.log(url)
  })

  // Generate the Deeplink for the MATTR Wallet
  let buf = Buffer.from(didcommUri);
  let encodedData = buf.toString('base64');
  var deep = `global.mattr.wallet://accept/${encodedData}`
  console.log('\n', 'Deeplink for the MATTR Mobile Wallet: \n', deep, '\n')
})();
