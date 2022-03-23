[![MATTR](../docs/assets/mattr-logo-square.svg)](https://github.com/mattrglobal)

# Sample Credential Verification For QR Code Presentations

## Description

This app allows you to scan a QR code which is presenting a CBOR-LD VC, decode and verify it using MATTR services.

# Installation

## Get Started

Cloning the samples-apps repo

```sh
git clone https://github.com/mattrglobal/sample-apps
```

Change to the directory and install dependencies

```sh
cd verify-cborld-presentation
yarn install
yarn build
```

Rename `.env-template` to `.env` and provide the details from your tenant.

Configure your trusted credential issuers in `.env` file as a comma separated list of `domain+did`. `domain` can be left
empty in which case the entry would look like `+did`. When `domain` is defined, the app would try to retrieve
`manifest.json` from `GET https://${domain}/manifest.json`.

## Start the server

Append your valid Platform access token to the end of the start command

```shell
  yarn start <access_token>
```

## Steps

1. Have your QR Code presentation of a VC ready. You can obtain that using Mattr Wallet when the offline-credential
   feature is enabled and your phone is offline. Then open your desired credential and press the **Present** button at
   the bottom. If you want to produce the QR code in a different application, you need to know that a VC should be first
   presented in CBOR-LD format, then compressed using gzip, then encoded in base32 and finally the result should be
   displayed as a QR code. An example QR code presentation can be found at
   [localhost:3000/qr](https://localhost:3000/qr).
2. Open [lcoalhost:3000](https://localhost:3000)
3. Press **Scan**
4. Show your QR to the camera. **tip:** For a successful scan the lighting is important. Also make sure the code is
   close enough to the camera so the camera box in your browser is almost covered with the QR code image.
