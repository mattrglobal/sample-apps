[![MATTR](../docs/assets/mattr-logo-square.svg)](https://github.com/mattrglobal)

# Sample Direct Credential Issuance

This demostrates the flow of issuing a direct verifibale credential via QR Code, DeepLink, or Async Messaging.

- You need to create your issuer DID in MATTR Platform. See our [Learn site](https://learn.mattr.global/guides/platform/identifiers/dids/web) for details.

# Installation

## Get Started

Cloning the samples-apps repo

``` sh
git clone https://github.com/mattrglobal/sample-apps
```

Change to the directory and install dependencies

``` sh
cd issue-direct-credential-express
yarn install
```

Update the .env file

Environment variables are used from a `.env` file.
Rename the `.env-template` to `.env` and provide the details from your tenant.

```
TENANT=<your-tenant>.vii.dev.mattrlabs.io
ISSUER_DID=<issuer-did>
```

## Start the server

Append your valid Platform access token to the end of the start command to start the Express server

```
yarn start <access_token>
```

> The access token is stored in memory and used to make API calls to your tenant over HTTPS

## Steps

You can obtain the Subject DID via DIDAuth flow by clicking the `DIDAuth` button, and scan the generated QR Code with MATTR Mobile Wallet.

The App will call out to your tenant to:
1. Create a DIDAuth Presentation Template if not already exists.
2. Create a Presentation Request.
3. Look-up the DIDUrl of the Messaging DID
4. Sign the Presentation Request with the Messaging DIDUrl

Then you can issue a verifibale credential by clicking the `Issue Credential` button.

The App will call out to your tenant to:
1. Issue a Veriable Credential with the specified issuer DID and credential claims
2. Create an encrypted Direct Credential Offer with the messaging endpoint

To obtain the credential, you can either:
- Scan the generated QR Code with MATTR Mobile Wallet that contains the credential offer
- Navigate to the DeepLink by clicking on the QR Code
- Send the credential offer via Async Messaging

---

<p align="center"><a href="https://mattr.global" target="_blank"><img height="40px" src ="../docs/assets/mattr-logo-tm.svg"></a></p><p align="center">Copyright © MATTR Limited. <a href="./LICENSE">Some rights reserved.</a><br/>“MATTR” is a trademark of MATTR Limited, registered in New Zealand and other countries.</p>
