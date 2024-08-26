# Mobile Credential Online Presentation Sample App

This sample app demonstrates the usage of the Web Verifier SDK to present mobile credentials online on the same device and across devices.
To run this app, you need

- A MATTR tenant with a presentation configuration.
- Make this app publicly available, e.g. by using a ngrok or cloudflare tunnel.
- A wallet with a mobile credential of doctype `org.iso.18013.5.1.mDL`.

To run the app, call the following command in your terminal:
```bash
npm run dev
```
and point your tunnel to `http://localhost:3000`.

The app is a standard NextJS app, the main code on how to use the Web Verifier SDK can be found in `src/app/page.tsx`.
