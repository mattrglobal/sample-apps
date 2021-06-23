# Verify VC presenation via QR code

### Description

The app will allow you to scan a CBOR VC presentation in a QR code, decode and verify it using MATTR services.

## Set Up

1.  A VC presentation in a QR code: the presentation should be in CBOR data format, then compressed using gzip, then
    encoded using base32. The base32 encoded data should be put into the QR code. An example QR code presentation can be
    found at [localhost:3000/qr](localhost:3000/qr).
2.  The app relies on MATTR backend services to decode the CBOR data and verify the presenation. A proxy server is used
    to proxy the request to the MATTR backend. `API_TOKEN` and `PLATFORM_BASE_URL` env vars need to be set.
3.  Trusted issuers need to be configured to verify if issuer of the credential. These can be set in
    `src/trustedIssuers.ts`. Add any trusted issuers to the `trustedIssuers` array with their `DID` and `domain`(where a
    `manifest.json` can be retrieved).

## Run

```javascript
  yarn start
```
