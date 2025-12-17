# Webhook App

## Description

This project provides a webhook receiver for MATTR VII webhooks with HTTP signature validation. It can be used to receive and verify webhook events from your MATTR VII tenant.

## Prerequisites

### Environment Variables

The project contains an `env-example` file that you can use and rename to `.env` and add the required variables:

```
MATTR_TENANT_URL=https://your-tenant.vii.mattr.global
MATTR_WEBHOOK_ID=<your-webhook-id>
NGROK_AUTHTOKEN=<your-ngrok-authtoken>
PORT=3000
```

- `MATTR_TENANT_URL` : Your MATTR VII tenant URL.
- `MATTR_WEBHOOK_ID` : The ID of your MATTR VII Webhook.
- `NGROK_AUTHTOKEN` : Your ngrok authentication token.
- `PORT` : Port for the webhook server (optional, defaults to 3000).

### MATTR VII Configuration

You will need to configure a Webhook on your MATTR VII tenant. Refer to the MATTR Learn [Webhooks tutorial](https://learn.mattr.global/docs/platform-management/webhooks-tutorial) for step-by-step instructions on how to configure a Webhook to send events to this sample app webhook receiver.

### Exposing the webhook receiver

The webhook receiver must be publicly accessible. This project uses ngrok to create a tunnel for you. You can get a free account at [ngrok.com](https://ngrok.com).

## Starting the app

You can start the app either via npm:

```bash
npm install
npm run start
```

Or using Docker:

```bash
docker compose up --build
```

Once the app is running and the MATTR VII Webhook is properly configured, Webhook event payloads will appear in the terminal where the app is running as they are received from the configured MATTR VII tenant.