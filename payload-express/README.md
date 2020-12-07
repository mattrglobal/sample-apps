![Logo](https://mattr-dev-content.netlify.app/favicon-32x32.png)

# Generate QR code and URL shortener in Express

Runs a simple QR code generator in the terminal and allows for shortened DIDcomm URLs to be provided to Mobile Wallet app

To run
Once you have a valid JWS from of a Signed Presentation Request from your MATTR tenant.


```
cd payload-express
node payload-express.js <jws of signed presentation request>
```

# Sample Callback Route Handler in Express

A simple package listens to calls to a `/callback` route and parses the JSON body to the console.

## Uses
This is provided as a rudimentary method to test Verifying Credentials using the Callback method.