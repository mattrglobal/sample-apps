> [!NOTE]
> This is a tech preview. If you are interested in in trialling this capability, please reach out via [https://mattr.global/contact-us](https://mattr.global/contact-us).

# Mobile Credential Online Presentation Sample App

This sample app demonstrates using the Web Verifier SDK for online presentation of [Mobile Credentials](https://learn.mattr.global/docs/profiles/mobile) via either a same-device or cross-device workflow.

## Prerequisites

### MATTR verifier tenant configuration

Your MATTR verifier tenant needs to be made aware of the public domain of the app.
You can also provide additional configuration, e.g. restricting the supported modes or customizing the iframe for the cross-device flow.

A sample request to configure your verifier tenant using `curl` looks like this:

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

### Making the app publically available

The app needs to be publicly available for online presentation to work. You can either:
- Use a hosting service of your choice.
- Use cloudflare or ngrok tunnels to make your locally running app publicly available.
You can either use a hosting service of your choice, or use cloudflare or ngrok tunnels to expose your locally running app publically.

> [!IMPORTANT]
> If you use a tunneling service, make sure to
> * Update the [redirect URIs](https://online-presentations-tech-preview.redoc.ly/tag/Mobile-Credentials-Verification#operation/putVerifierConfiguration!path=redirectUris&t=request) in your verifier tenant configuration (see above).
> * access the app yourself via the public domain.
>
> The credential request to the verifier tenant validates the origin of the request and the request will fail when it is being made from `localhost`.

### Credential holding in the wallet

The default credential query requests a credential of doctype `org.iso.18013.5.1.mDL`, but you can change the credential query in the sample app directly.
You need to ensure your wallet holds a credential that can fulfil the credential query you are using.


## SDK Guide

### Automatic mode detection

If you don't provide a `mode` in the `RequestCredentialsOptions`, the SDK will determine the mode automatically by checking the user agent of the device in use.
Mobile devices will use the same device flow, all other devices the cross device flow.

### Same device presentation

When request credentials in the same device flow, the user will be redirected to a wallet to fulfil the credential request.
On completion of the request in the wallet, the user is redirected back to the browser to the redirect URI from the credential request.
The `handleRedirectCallback` function from the SDK will extract the `response_code` from the URL, and retrieve the presentation results.

> [!NOTE]
> For the SDK to be able to retrieve the results on rendering the page the user is redirected to, the SDK needs to have the verifier tenant URL accessible.
> The simplest way is to provide it as an environment variable when running the app.
> Alternatively, you can persist the verifier tenant URL in `localStorage` when making the credential request, and retrieve it on the redirected tab.

### Cross device presentation

In the cross device flow, you don't need to invoke the `handleRedirectCallback`, but you can directly pass an `onComplete` and an `onFailure` handler to the `crossDeviceCallback` option in the credential request.

## Running the app

This is a NextJS app, using the App Router.
You can configure your verifier tenant URL by setting the `NEXT_PUBLIC_API_BASE_URL` environment variable, e.g. by adding
```
NEXT_PUBLIC_API_BASE_URL=<YOUR_TENANT_URL>
```
to a `.env.local` file to the root of the project.

This app only consists of a single page, and the main code on how to use the Web Verifier SDK can be found in `src/app/page.tsx`.

To run the app, call the following commands in your terminal:

```bash
# Install dependencies
npm install

# Run the app locally
npm run dev
```

> [!NOTE]
> When presenting a mobile credential with the same device flow, the SDK is performing a side effect after the redirect by loadnig the session results.
> This conflicts with Reacts "Strict Mode", which is intentionally running every every effect twice.
> If you expierence any issue with disappearing results, check whether "Strict mode" is disabled in your NextJS configuration (`next.config.mjs`).
