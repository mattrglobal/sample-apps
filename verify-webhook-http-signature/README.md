[![MATTR](../docs/assets/mattr-logo-square.svg)](https://github.com/mattrglobal)

# Sample http signature verification for webhook processing

## Description

# Pre-requisites:

- You'll need a valid Access token for the MATTR Platform, if you do not have a tenent set up [get started here](https://mattr.global/get-started).
- Have your local development environment setup with Node and NPM/Yarn, you will need to make outbound calls to the internet

# Installation

## Get Started

Cloning the samples-apps repo

```sh
git clone https://github.com/mattrglobal/sample-apps
```

Change to the directory and install dependencies

```sh
cd verify-webhook-http-signature
yarn install
yarn build
```

Rename `.env-template` to `.env` and provide the details from your tenant.

## Start the server

Append your valid Platform access token to the end of the start command

```shell
  yarn start <access_token>
```

## Steps

The App starts an Ngrok tunnel to your localhost.

The App will call out to your tenant to:

1. Retrieve the list of platform webhook JWKs.
2. Create a webhook to listen for the OidcIssuerCredentialIssued event
3. Start a web server to receive and verify webhook callbacks

You can then:

1. Follow the [instructions to issue a credential via OIDC bridge](https://learn.mattr.global/tutorials/web-credentials/issue/oidc-bridge/overview)
2. Observe the callback request being received and the http signature of the request being verified.
