# Claims Source

## Description

This project provides the minimal implementation of a claims source to be integrated into a OpenID4VCI flow and can be used for our [Claims Source Tutorial](https://learn.mattr.global/guides/oid4vci/claim-source-tutorial).

## Database

The `database.json` file acts as our database and holds an array of user objects. Add your own claims to that array and ensure that every object has the `email` claim used to query the array, plus any claims that your credential configuration requires.

## Configuration

The claims source must be publically accessible. This project uses ngrok and starts a tunnel for you. You can get a free account at [ngrok.com](ngrok.com), and need to configure your `NGROK_AUTHTOKEN` in the `.env` file.

You also need to add the claims source API secret to the `.env` file. If you are following the [Claims Source Tutorial](https://learn.mattr.global/guides/oid4vci/claim-source-tutorial), the value being used there is `supersecretapikey`.

The project contains a `env-example` file that you can use and rename to `.env`. In the end, the `.env` file should look like this:

```
CLAIMS_SOURCE_API_KEY=supersecretapikey
NGROK_AUTHTOKEN=<your-ngrok-authtoken>
```

## Starting the app

You can start the app either via npm

```bash
npm install
npm run start
```

or using docker

```bash
docker compose up --build
```
