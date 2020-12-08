![Logo](https://mattr-dev-content.netlify.app/favicon-32x32.png)


# Verify Credentials using Presentation Request Callbacks

## Overview
This demo app can orchestrate a series of API calls to your tenant on the MATTR platform to setup a Presentation Request with a Callback to a Ngrok instance that tunnels to your localhost.
In order for a MATTR Mobile Wallet app to read the Presentation Request the terminal will display a QR Code for scanning or a Deeplink that can be sent to the Mobile Wallet using any existing messaging app.

## Get Started

Pre-requisites:

* You'll need a valid Access token for the MATTR Platform, if you do not have a tenent setup (get started here)[https://mattr.global/get-started/].
* Setup a valid Verifier DID and Presentation Request Template and know the ID's of each
* Have your local development environment setup with Node and NPM/Yarn

Clone the sample-apps repo
Change to the `verify-callback-express` directory
npm install dependencies


```
cd verify-call-back-express
npm install
```

Create your environment variables in a `.env` file and save to the folder.
```
TENANT=tenant.platform.mattr.global
TEMPLATEID=<presentation-request-template-uuid>
VERIFIERDID=<verifier-did>

```
* For `TENANT` add in the domain of your tenant
* Add the `id` of the [Presentation Request Template](https://learn.mattr.global/api-ref#operation/createPresTemplate) from your tenant to `TEMPLATEID`
* Add a DID to `VERIFIERDID` that that [exists on your tenant](https://learn.mattr.global/api-ref#operation/retrieveListOfDids)


Append you valid Platform access token to the end of the start command to start the Express server
```
npm start <access_token>
```




# Generate QR code and URL shortener in Express

Runs a QR code generator in the terminal and allows for shortened DIDcomm URLs to be provided to Mobile Wallet app

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