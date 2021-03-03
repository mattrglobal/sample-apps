[![MATTR](../docs/assets/mattr-logo-square.svg)](https://github.com/mattrglobal)

# Verify Credentials using Presentation Request Callbacks

## Overview
This demo app can orchestrate a series of API calls to your tenant on the MATTR platform to setup a Presentation Request with a Callback to a Ngrok instance that tunnels to your localhost.
In order for a MATTR Mobile Wallet app to read the Presentation Request the terminal will display a QR Code for scanning or a Deeplink that can be sent to the Mobile Wallet using any existing messaging app.

## Get Started

Pre-requisites:

* You'll need a valid Access token for the MATTR Platform, if you do not have a tenent set up [get started here](https://mattr.global/get-started).
* Have a valid [Verifier DID](https://learn.mattr.global/api-ref#operation/retrieveListOfDids) and [Presentation  Template](https://learn.mattr.global/api-ref#operation/createPresTemplate) and know the ID's of each.
* Download the MATTR Mobile Wallet app and hold a Credential matching the Presentation Request 
* Have your local development environment setup with Node and NPM/Yarn, you will need to make outbound calls to the internet

Clone the sample-apps repo
Change to the `verify-callback-express` directory
npm install dependencies


```
cd verify-callback-express
npm install
```

Environment variables are used from a `.env` file. 
Rename the `.env-template` to `.env` and provide the details from your tenant.
```
TENANT=tenant.platform.mattr.global
TEMPLATEID=<presentation-request-template-uuid>
VERIFIERDID=<verifier-did>

```
* For `TENANT` add in the domain of your tenant
* Add the `id` of the [Presentation Template](https://learn.mattr.global/api-ref#operation/createPresTemplate) from your tenant to `TEMPLATEID`
* Add a DID to `VERIFIERDID` that that [exists on your tenant](https://learn.mattr.global/api-ref#operation/retrieveListOfDids)

### Start the server
Append your valid Platform access token to the end of the start command to start the Express server
```
npm start <access_token>
```

> The access token is stored in memory and used to make API calls to your tenant over HTTPS

## Steps
The App starts an Ngrok tunnel to your localhost.

The App will call out to your tenant to:
1. Create a Presentation Request.
2. Look-up the DIDUrl of the Verifier DID
3. Sign the Presentation Request with the Verifier DIDUrl

It uses the signed Presentation Request JWS to display a QR Code. Open the MATTR Mobile Wallet holding a matching Verifiable Credential and scan the QR code.
Or, copy the displayed Deeplink URL and sent via alternate messaging means to the mobile device with the MATTR Mobile App and open the link.

The 'Verification Request' screen should be displayed.

## Uses
This app is provided as a learning tool to test Verifying Credentials using the Callback method.

It is not intended to run any production workloads.

---

<p align="center"><a href="https://mattr.global" target="_blank"><img height="40px" src ="../docs/assets/mattr-logo-tm.svg"></a></p><p align="center">Copyright © MATTR Limited. <a href="../LICENSE">Some rights reserved.</a><br/>“MATTR” is a trademark of MATTR Limited, registered in New Zealand and other countries.</p>
