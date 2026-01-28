# Verifier Web Tutorial App

This NextJS app is the result of the [Verifier Web SDK tutorial](https://learn.mattr.global/guides/remote/web/mdocs-tutorial). If you follow the tutorial, you should be able to present credentials remotely using this minimal demo application.

## Running the sample app

To run the app, you need:

- Access to a MATTR VII tenant. Sign-up for a free trial [here](https://learn.mattr.global/docs/resources/get-started).
- Provide the following environment variables:

```
NEXT_PUBLIC_TENANT_URL=
NEXT_PUBLIC_APPLICATION_ID=
NEXT_PUBLIC_WALLET_PROVIDER_ID=
MATTR_CLIENT_ID=
MATTR_CLIENT_SECRET=
```

- `NEXT_PUBLIC_TENANT_URL`: Your MATTR VII [tenant URL](https://learn.mattr.global/docs/platform-management/portal#creating-a-tenant), required for the web app to interact with your tenant.
- `NEXT_PUBLIC_APPLICATION_ID` and `NEXT_PUBLIC_WALLET_PROVIDER_ID`: Unique identifiers of the relevant [verifier application](https://learn.mattr.global/docs/verification/remote-web-verifiers/tutorial#create-a-verifier-application-configuration) and [wallet provider](https://learn.mattr.global/docs/verification/remote-web-verifiers/tutorial#create-a-supported-wallet-configuration) configured on your MATTR VII tenant. Required for the interactions between the web application, the wallet and your tenant.
- `MATTR_CLIENT_ID=` and `MATTR_CLIENT_SECRET`: Required to retrieve the presentation results via an authenticated backend API call. You can use the MATTR Portal to [create new clients](https://learn.mattr.global/docs/platform-management/create-client) for your MATTR VII tenant.

This project contains an `env-template` file which you can use to create your local `.env.local` file (which is the default environment file for NextJS apps).

Once your environment variables are configured, you can run the app via

```bash
npm install
npm run dev
```

