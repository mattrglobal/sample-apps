# Interaction Hook

## Description

This project provides an example web application that can be used as an Interaction hook component as part of the [Interaction hook tutorial](https://learn.mattr.global/guides/oid4vci/interaction-hook-tutorial).

## Configuration

The interaction hook component needs to be publically accessible using [ngrok.com](ngrok.com) or a similar tool.

The project contains a `.env-example` file that you can use and rename to `.env`. In the end, the `.env` file should look like this:

```
INTERACTION_HOOK_SECRET="YOUR__INTERACTION_HOOK_SECRET"
APP_URL="YOUR_APP_URL"
ISSUER_TENANT_URL="YOUR_TENANT_URL"
```

## Starting the app

You can start the app using:

```bash
npm install
npm run start
```
