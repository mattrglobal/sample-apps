[![MATTR](../docs/assets/mattr-logo-square.svg)](https://github.com/mattrglobal)

# React-oidc-client-js

> OpenID Connect (OIDC) client with React and typescript

- This is sample application, full credit to [Jan Škoruba](https://github.com/skoruba/react-oidc-client-js)

- It contains [oidc-client-js](https://github.com/IdentityModel/oidc-client-js) and `React` with `Typescript`.

- The application is based on `create-react-app` - [Create React App](https://github.com/facebook/create-react-app)

- You will need access to the MATTR Platform and have configured the OIDC Bridge extension as a Verifier and setup a Client. See our [Learn site](https://learn.mattr.global/tutorials/verify/oidc-bridge/verify-oidc) for details.

# Project status
The sample app is ready to be installed locally for trying out the connection to MATTR Identity Agent Platform.

# Installation

## Tenant Setup
On your tenant, use the OIDC Bridge to create a Verifier and setup a Client
The Client will need to be configured with this:

``` json
{
	"name": "Verify React OIDC Sample App",
	"redirectUris": [
		"http://localhost:3000/signin-callback.html"
	],
	"responseTypes": [
		"code"
	],
	"grantTypes": [
		"authorization_code"
	],
	"tokenEndpointAuthMethod": "none",
	"idTokenSignedResponseAlg": "ES256",
	"applicationType": "native",
	"logoUri": "https://learn.mattr.global/MATTR-logo_light-full.svg"
}
```

Use the `id` value as the `client-id` value.

## Cloning the samples-apps repo

``` sh
git clone https://github.com/mattrglobal/sample-apps
```

## Change to the dir and install dependencies

- Install dependencies
``` sh
cd react-oidc-client
yarn install
```

## Update the .env file
Rename the `.env-template` file to `.env` and add your variables

```
REACT_APP_STSAUTHORITY=https://<your-tenant>.vii.mattr.global/oidc/v1/verifiers/<verifier-id>
REACT_APP_CLIENTID=<client-id>
REACT_APP_CLIENTROOT=https://localhost:3000/
REACT_APP_CLIENTSCOPE=openid_credential_presentation
```

## Running app

- `yarn start` - start the web server 

---

<p align="center"><a href="https://mattr.global" target="_blank"><img height="40px" src ="../docs/assets/mattr-logo-tm.svg"></a></p><p align="center">Copyright © MATTR Limited. <a href="./LICENSE">Some rights reserved.</a><br/>“MATTR” is a trademark of MATTR Limited, registered in New Zealand and other countries.</p>
