# Claims Source

## Description

This project provides the minimal implementation of a claims source to be integrated into a OpenID4VCI flow and can be used for our [Claims Source Tutorial]().

## Database

The `database.json` file acts as our database and holds an array of user objects. Add your own claims to that array and ensure that every object has the `email` claim used to query the array, plus any claims taht your credential configuration requires.

## Public tunnel

The claims source needs to be publically accessible. This projects uses ngrok and starts a tunnel for you. You can get a free account at [ngrok.com](ngrok.com), and need to configure your `NGROK_AUTHTOKEN` in the `.env` file.

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
