# Webhook App

## Description

This project provides a simple webhook receiver for MATTR VII webhooks with HTTP signature validation. It can be used to receive and verify webhook events from your MATTR tenant.

## Configuration

The webhook receiver must be publicly accessible. This project uses ngrok to create a tunnel for you. You can get a free account at [ngrok.com](https://ngrok.com), and need to configure your `NGROK_AUTHTOKEN` in the `.env` file.

You also need to configure your MATTR tenant URL so the app can fetch the JWKS for webhook signature verification, and your webhook ID to validate incoming webhook events.

The project contains a `env-example` file that you can use and rename to `.env`. In the end, the `.env` file should look like this:

```
MATTR_TENANT_URL=https://your-tenant.vii.mattr.global
MATTR_WEBHOOK_ID=<your-webhook-id>
NGROK_AUTHTOKEN=<your-ngrok-authtoken>
PORT=3000
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MATTR_TENANT_URL` | Yes | Your MATTR VII tenant URL |
| `MATTR_WEBHOOK_ID` | Yes | The ID of your registered webhook |
| `NGROK_AUTHTOKEN` | Yes | Your ngrok authentication token |
| `PORT` | No | Port for the webhook server (default: 3000) |

## Starting the app

You can start the app either via npm:

```bash
npm install
npm start
```

Or using Docker:

```bash
docker compose up --build
```
