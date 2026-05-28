[![MATTR](../docs/assets/mattr-logo-square.svg)](https://github.com/mattrglobal)

# iOS Remote Mobile Verifier Tutorial Sample App

A SwiftUI sample app that uses MATTR's `MobileCredentialVerifierSDK` to verify a mobile document (mDoc, for example a mobile driver's license) presented from a wallet app on the same device. The exchange follows OID4VP and ISO/IEC 18013-7 Annex B (the "remote" same-device presentation workflow).

This project accompanies the [Remote mobile verifiers tutorial](https://learn.mattr.global/docs/verification/remote-mobile-verifiers/tutorial).

## What the app does

1. Shows a **Request credentials** button that builds a presentation request for an mDL (`org.iso.18013.5.1.mDL`) and asks for the `family_name`, `given_name`, and `birth_date` claims.
2. Redirects to a compliant wallet app on the device, where the holder consents to share the requested claims.
3. Receives the verification result back via a deep link (a custom URL scheme) and displays the verified claims, the overall verification status, and any claim errors.

## Prerequisites

- Xcode 26.4 or later and a physical iOS device for testing (the wallet redirect flow needs a real device).
- The `MobileCredentialVerifierSDK` xcframework. This is distributed by MATTR and is **not** included in this repository.
- A configured MATTR VII tenant with a verifier application configuration, a supported wallet configuration, and a trusted issuer. These are configured out of band; see the tutorial for details.

## Setup

1. **Add the SDK.** Unzip `MobileCredentialVerifierSDK-<version>.xcframework.zip`, drag the `.xcframework` into the project in Xcode, and set it to **Embed & Sign** under the target's *General > Frameworks, Libraries, and Embedded Content*.

2. **Set your bundle identifier and signing.** Select the target and, under *Signing & Capabilities*, choose your development team and set `PRODUCT_BUNDLE_IDENTIFIER` to a value you own (it defaults to `com.example.RemoteVerificationTutorial`). The custom URL scheme in `Remote-verification-tutorial-Info.plist` is bound to `$(PRODUCT_BUNDLE_IDENTIFIER)`, so it tracks your bundle identifier automatically.

3. **Point the app at your tenant.** Open [Constants.swift](Remote%20verification%20tutorial/Constants.swift) and replace the placeholders:

   ```swift
   enum Constants {
       static let tenantHost = URL(string: "https://your-tenant.vii.your-region.mattr.global")!
       static let applicationID = "your-application-id"
   }
   ```

   - `tenantHost` is the base URL of your MATTR VII tenant.
   - `applicationID` is the `id` of the verifier application configuration created in your tenant.

4. **Match the redirect URI.** When you create the verifier application configuration in your tenant, set its redirect URI to use this app's URL scheme, for example `{bundleId}://my/path` where `{bundleId}` is the bundle identifier from step 2.

## Project structure

| File | Purpose |
| --- | --- |
| `Remote verification tutorial/Constants.swift` | Tenant host and application id (replace the placeholders). |
| `Remote verification tutorial/ContentView.swift` | SDK initialization, the credential request, deep-link handling, and navigation. |
| `Remote verification tutorial/DocumentView.swift` | Renders a verified document and its claims. |
| `Remote verification tutorial/Remote_verification_tutorialApp.swift` | App entry point. |
| `Remote-verification-tutorial-Info.plist` | Registers the custom URL scheme used for the wallet redirect. |

## Notes

- The placeholder values let the app build and launch, but a credential request only succeeds once `Constants` points at a real tenant and application configuration and a compatible wallet is installed.
- Trusted issuer certificates for this workflow are managed in your MATTR VII tenant, not in the app.

---

<p align="center"><a href="https://mattr.global" target="_blank"><img height="40px" src="../docs/assets/mattr-logo-tm.svg"></a></p><p align="center">Copyright © MATTR Limited. <a href="../LICENSE">Some rights reserved.</a><br/>“MATTR” is a trademark of MATTR Limited, registered in New Zealand and other countries.</p>
