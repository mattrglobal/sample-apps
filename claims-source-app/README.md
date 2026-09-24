# Claims Source

## Description

This project provides the minimal implementation of a claims source to be integrated into a OpenID4VCI flow. It is used by two MATTR Learn tutorials:

* The [Claims source tutorial](https://learn.mattr.global/docs/issuance/claims-source/tutorial), which looks up a driver license by `licenseNumber`.
* The [Claim sets tutorial](https://learn.mattr.global/docs/issuance/claim-sets/tutorial), which looks up individual birth certificates by `recordId`, so that one holder can receive several credentials of the same type.

## Database

The `database.json` file acts as our database and holds an array of records. Add your own records to that array, plus any claims that your credential configuration requires. Every record needs one of these keys, which is used to query the array:

* `licenseNumber`: used by the Claims source tutorial, for example `GET /claims?licenseNumber=DL-123456`. Returns `404` when no record matches.
* `recordId`: used by the Claim sets tutorial, where MATTR VII maps it from the claim set identifier, for example `GET /claims?recordId=BC-1002`. Returns an empty object when no record matches, so MATTR VII can issue the credential using claims supplied on the credential offer instead.

## Configuration

The claims source must be publicly accessible. This project uses ngrok and starts a tunnel for you. You can get a free account at [ngrok.com](https://ngrok.com/), and need to configure your `NGROK_AUTHTOKEN` in the `.env` file.

You also need to add the claims source API secret to the `.env` file. Both tutorials use the value `supersecretapikey`.

The project contains an `env-template` file that you can copy to `.env`. In the end, the `.env` file should look like this:

```
CLAIMS_SOURCE_API_KEY=supersecretapikey
NGROK_AUTHTOKEN=<your-ngrok-authtoken>
```

## Starting the app

You can start the app either via npm

```bash
npm install
npm run dev
```

or using docker

```bash
docker compose up --build
```
