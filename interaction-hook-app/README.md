# Interaction Hook

## Description

This project provides the minimal implementation of a claims source to be integrated into a OpenID4VCI flow and can be used for our [Claims Source Tutorial](https://learn.mattr.global/guides/oid4vci/claim-source-tutorial).

## Getting Started

Install project dependencies

```bash
npm install
```

Once your dependencies are installed you'll need to configure this interaction hook with your [OIDC configuration in MATTR VII](https://learn.mattr.global/api-reference/latest/tag/Interaction-Hook#operation/updateOpenIdConfiguration).

Here is the suggest configuration for this demo:

> Note: If you wish to test this locally, you will need to use NGROK or Cloudflare to expose your local localhost on a public url and set this as your APP_URL

```json
{
  "interactionHook": {
    "url": "https://YOUR_APP_URL.com",
    "claims": [],
    "sessionTimeoutInSec": 1200,
    "disabled": false
  }
}
```

Then, you'll need to configure your environment variables with the `secret` you're given

```Dotenv
INTERACTION_HOOK_SECRET="MY_SECRET"
APP_URL="https://example.com/mywebapp";
ISSUER_TENANT_URL="https://YOUR_TENANT_URL";
```

Now, we can run our development server or deploy our app in production:

```bash
npm run dev
```

Now open your proxied app link (via Cloudflare or Ngrok) and you're good to go.