> [!NOTE]
> This is a tech preview. If you are interested in in trialling this capability, please reach out via [https://mattr.global/contact-us](https://mattr.global/contact-us).

# Mobile Credential Online Presentation Sample App

This sample app demonstrates using the Verifier Web SDK for online presentation of [Mobile Credentials](https://learn.mattr.global/docs/profiles/mobile) via either a same-device or cross-device workflow.

## Prerequisites

### MATTR verifier tenant configuration

You must create a verifier configuration on your MATTR VII tenant.
Refer to the [API reference](https://online-presentations-tech-preview.redoc.ly/tag/Mobile-Credentials-Verification#operation/putVerifierConfiguration) for a complete description of this configuration and different settings you can control.

<details>
  <summary>Sample configuration request</summary>
  ```bash
  curl -X PUT https://<YOUR_TENANT_DOMAIN>/v2/presentations/configuration \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
      "supportedMode": "all",
      "domains": ["<PUBLIC_DOMAIN_OF_THE_APP>"],
      "redirectUris": [
          "https://<PUBLIC_DOMAIN_OF_THE_APP>"
      ],
      "display": {
          "bodyText": "Please scan the QR code to the right to provide information required for this interaction.",
          "logoImage": {
              "url": "<YOUR_LOGO_URL>",
              "altText": "<YOUR_LOGO_ALT_TEXT>"
          },
          "headerText": "Verify your age before you continue",
          "primaryColorHex": "#000000"
      },
      "resultAvailableInFrontChannel": true
  }'
  ```
</details>

You also need to [create a trusted Mobile Credential issuer](https://online-presentations-tech-preview.redoc.ly/tag/Mobile-Credentials-Verification#operation/addMobileCredentialTrustedIssuer) using the issuer's certificate.

<details>
  <summary>Sample request to add a trusted issuer</summary>
  ```bash
  curl -X PUT https://<YOUR_TENANT_DOMAIN>/v2/credentials/mobile/trusted-issuers \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
      "certificatePem": "<ISSUER_CERTIFICATE_PEM>",
  }'
  ```
</details>

### Making the app publically available

The app needs to be publicly available for online presentation to work. You can either:
- Use a hosting service of your choice.
- Use cloudflare or ngrok tunnels to make your locally running app publicly available.
You can either use a hosting service of your choice, or use cloudflare or ngrok tunnels to expose your locally running app publically.

> [!IMPORTANT]
> If you use a tunneling service, make sure to
> * Update the [redirect URIs](https://online-presentations-tech-preview.redoc.ly/tag/Mobile-Credentials-Verification#operation/putVerifierConfiguration!path=redirectUris&t=request) in your verifier tenant configuration (see above).
> * Access the app via the public domain when you are interacting with it.
>
> The origin of the credential request is validated by the verifier tenant and the request will fail when it is being made from `localhost`.

### Credential holding in the wallet

The default credential query requests a credential of doctype `org.iso.18013.5.1.mDL`, but you can change the credential query in the sample app directly.
Make sure your wallet holds a credential that matches the credential query you are configuring.


## SDK Guide

### Automatic mode detection

If you don't provide a `mode` in the `RequestCredentialsOptions`, the SDK will determine the mode automatically by checking the user agent of the device in use:
* Mobile devices will use the same-device flow.
* Other devices will use the cross-device flow.

### Same-device workflows

When credentials are requested in the same-device flow, the user is redirected to a wallet to fulfil the request.
On completion of the request in the wallet, the user is redirected back to the browser using the redirect URI configured in the credential request.
The SDK's [`handleRedirectCallback`](https://api-reference-sdk.mattr.global/verifier-sdk-web/preview/functions/handleRedirectCallback.html) function extracts the `response_code` from the URL and retrieves the presentation results.

> [!NOTE]
> For the Verifier Web SDK to retrieve the results when rendering the page the user is redirected to, the SDK must be able to access the verifier tenant URL.
> The recommended way to achieve this is to provide the URL as an environment variable when running the app.
> Alternatively, you can persist the verifier tenant URL in `localStorage` when making the credential request, and retrieve it on the redirected tab.

### Cross-device workflows

In the cross-device flow you can pass an `onComplete` and an `onFailure` handler directly to the `crossDeviceCallback` option in the credential request. You do not need to invoke the `handleRedirectCallback` function.

## Running the app

This is a NextJS App Router app with only a single page.
The main code using the Verifier Web SDK can be found in `src/app/page.tsx`.

You can configure your verifier tenant URL by setting the `NEXT_PUBLIC_API_BASE_URL` environment variable, e.g. by adding
```
NEXT_PUBLIC_API_BASE_URL=<YOUR_TENANT_URL>
```
to a `.env.local` file at the root of the project.

To run the app, call the following commands in your terminal:

```bash
# Install dependencies
npm install

# Run the app locally
npm run dev
```

> [!NOTE]
> This sample app will load the session results immediately after the redirect when presenting a Mobile Credential via a same-device workflow.
> Because you can only retrieve the results once, this conflicts with React's _Strict Mode_, which is intentionally running every effect twice.
> If you experience any issues with disappearing results, check whether _Strict mode_ is disabled in your NextJS configuration (`next.config.mjs`).
