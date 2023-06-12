import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import ngrok from 'ngrok'
import QRCode from 'qrcode'
import bodyParser from 'body-parser'


const app = express()

var jwsUrl;

// Obtain the Access Token
const token = process.argv[2];

if (token === undefined) {
  throw new Error('Access token is missing - include a valid JWT as an argument')
}

// Create an Express server that will serve a redirect that the mobile app can use
app.get('/qr', function(_req, res) {
  res.redirect(302, jwsUrl)
})

app.get('/test', function(_req, res) {
  res.sendStatus(200)
})

// listen on port 2000
app.listen(2000, function(err) {
  if (err) {
    throw err
  }

  console.log('\n', 'Server started on port 2000', '\n')
})


var ngrokUrl;
(async function() {

  // Start ngrok and check that it is running
  ngrokUrl = await ngrok.connect(2000);
  var response = await fetch(`${ngrokUrl}/test`, { method: "GET" });
  console.log("Ngrok statusCode: ", response.status);


  // Provision Presentation Request
  var tenant = process.env.TENANT;
  var presReq = `https://${tenant}/v2/credentials/web-semantic/presentations/requests`
  console.log("Creating Presentation Request at ", presReq);

  response = await fetch(presReq, {
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
  console.log("Create Presentation Request statusCode: ", response.status);
  const { request: requestPayload } = await response.json();


  // Get DIDUrl from Verifier DID Doc
  var dids = `https://${tenant}/core/v1/dids/` + process.env.VERIFIERDID
  console.log("Looking up DID Doc from Verifier DID :", dids);

  response = await fetch(dids, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });
  const didUrlResponse = await response.json()
  const didUrl = didUrlResponse.didDocument.authentication[0];
  console.log("Public key from DID Doc found, DIDUrl is: ", didUrl, '\n');


  // Sign payload
  var signMes = `https://${tenant}/core/v1/messaging/sign`
  console.log("Signing the Presentation Request payload at: ", signMes);

  response = await fetch(signMes, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    method: "POST",
    body: JSON.stringify({
      "didUrl": didUrl,
      "payload": requestPayload
    })
  });
  const jws = await response.json()
  console.log("The signed Presentation Request message is: ", jws, '\n');

  jwsUrl = `https://${tenant}/?request=${jws}`;


  // Construct DIDComm url and generate QR code
  var didcommUrl = `didcomm://${ngrokUrl}/qr`;
  console.log("The URL encoded in this QR code", didcommUrl);

  QRCode.toString(didcommUrl, { type: 'terminal' }, function(_err, url) {
    console.log(url)
  })


  // Generate the Deeplink for the MATTR Wallet
  let buf = Buffer.from(didcommUrl);
  let encodedData = buf.toString('base64');
  var deep = `global.mattr.wallet://accept/${encodedData}`
  console.log('\n', 'Deeplink for the MATTR Mobile Wallet: \n', deep, '\n')


  // Use body-parser middleware
  app.use(bodyParser.json())


  // Receive a POST request to /callback & print it out to the terminal
  app.post('/callback', function(req, res) {
    const body = req.body
    console.log('\n Data from the Presentation is shown below \n', body)
    res.sendStatus(200)
    console.log('Exiting app')
    process.exit(0)
  })

})();
