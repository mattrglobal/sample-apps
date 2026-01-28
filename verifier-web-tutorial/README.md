# Verifier Web Tutorial App

This NextJS app is the result of the [Verifier Web SDK tutorial](https://learn.mattr.global/guides/remote/web/mdocs-tutorial). If you follow the tutorial, you should be able to present credentials remotely using this minimal demo application.

## Running the sample app

To run the app, you need to have a configured MATTR tenant and need to provide the following environment variables:

```
NEXT_PUBLIC_TENANT_URL=
NEXT_PUBLIC_APPLICATION_ID=
NEXT_PUBLIC_WALLET_PROVIDER_ID=
MATTR_CLIENT_ID=
MATTR_CLIENT_SECRET=
``` 

The `MATTR_CLIENT_ID` and `MATTR_CLIENT_SECRET` are necessary to retrieve the presentation results via an authenticated backend API call. You can create a new verifier client id & secret via the portal in the "Users, clients & roles" menu.

This project contains a `env-template` file which you can use to create your local `.env.local` file (which is the default environment file for NextJS apps).

Once your environment variables are configured, you can run the app via

```bash
npm install
npm run dev
```

