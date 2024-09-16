[![MATTR](../docs/assets/mattr-logo-square.svg)](https://github.com/mattrglobal)

# Sample Direct Credential Issuance

This demonstrates the flow of issuing a direct verifiable credential via QR Code, DeepLink, or Async Messaging.

- You need to create your issuer DID in MATTR Platform. See our [Learn site](https://learn.mattr.global/tutorials/dids/use-did) for details.

# Installation

- [.NET 8](https://dotnet.microsoft.com/en-us/download/dotnet)
- [Ngrok](https://ngrok.com/download)

## Get Started

Setup Ngrok, this example requires external access other than localhost to receive callbacks or redirects.

``` sh
ngrok authtoken $NGROK_TOKEN
ngrok http --host-header=localhost http://localhost:5051
```

Cloning the samples-apps repo

``` sh
git clone https://github.com/mattrglobal/sample-apps
```

Change to the directory and install dependencies

``` sh
cd issue-direct-credential-dotnet
```

Update the `.src/MattrIssueDirect/appsettings.Development.json` fie

Environment variables are used from a `appsettings.json` file.
Rename the `appsettings.template.json` to `.appsettings.Development.json` and provide the details from your tenant.

```json
"Tenant": "<your-tenant>.vii.dev.mattrlabs.io",
"IssuerDid": "ISSUER_DID",
"AuthTenant": "AUTH_TENANT",
"ClientId": "AUTH_CLIENT_ID",
"ClientSecret": "AUTH_CLIENT_SECRET",
"Audience": "AUTH_AUDIENCE",
"NgrokUrl": "NGROK_URL"
```

## Start the server

Append your valid Platform access token to the end of the start command to start the server

```
dotnet run --project ./src/MattrIssueDirect
```

> The access token is stored in memory and used to make API calls to your tenant over HTTPS

Once your up and running you can checkout the following resources
- [MATTR Sample UI](http://localhost:5051)
- Interactive [Swagger Api Docs](http://localhost:5051/swagger/index.html)

## Steps

You can obtain the Subject DID via DIDAuth flow by clicking the `DIDAuth` button, and scan the generated QR Code with MATTR Mobile Wallet.

The App will call out to your tenant to:
1. Create a DIDAuth Presentation Template if not already exists.
2. Create a Presentation Request.
3. Look-up the DIDUrl of the Messaging DID
4. Sign the Presentation Request with the Messaging DIDUrl

Then you can issue a verifiable credential by clicking the `Issue Credential` button.

The App will call out to your tenant to:
1. Issue a Variable Credential with the specified issuer DID and credential claims
2. Create an encrypted Direct Credential Offer with the messaging endpoint

To obtain the credential, you can either:
- Scan the generated QR Code with MATTR Mobile Wallet that contains the credential offer
- Navigate to the DeepLink by clicking on the QR Code
- Send the credential offer via Async Messaging

---

<p align="center"><a href="https://mattr.global" target="_blank"><img height="40px" src ="../docs/assets/mattr-logo-tm.svg"></a></p><p align="center">Copyright © MATTR Limited. <a href="./LICENSE">Some rights reserved.</a><br/>“MATTR” is a trademark of MATTR Limited, registered in New Zealand and other countries.</p>
