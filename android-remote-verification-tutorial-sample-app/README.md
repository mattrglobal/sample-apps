[![MATTR](../docs/assets/mattr-logo-square.svg)](https://github.com/mattrglobal)

# Android Remote Mobile Verifier Tutorial Sample App

A Jetpack Compose sample app that uses MATTR's `MobileCredentialVerifier` SDK to verify a mobile document (mDoc, for example a mobile driver's license) presented from a wallet app on the same device. The exchange follows OID4VP and ISO/IEC 18013-7 Annex B (the "remote" same-device presentation workflow).

This project accompanies the [Remote mobile verifiers tutorial](https://learn.mattr.global/docs/verification/remote-mobile-verifiers/tutorial).

## What the app does

1. Shows a **Request credentials** button that builds a presentation request for an mDL (`org.iso.18013.5.1.mDL`) and asks for the `family_name`, `given_name`, and `birth_date` claims.
2. Hands off to a compliant wallet app on the device, where the holder consents to share the requested claims.
3. Receives the verification result back via the OID4VP deep link declared in `AndroidManifest.xml` and renders the verified claims, the overall verification status, and any claim errors.

## Prerequisites

- Android Studio with a Kotlin DSL project setup.
- A physical Android device with API 24 or higher and internet access (the wallet redirect flow needs a real device).
- The MATTR `mobile-credential-verifier-<version>.zip` SDK distribution. This is distributed by MATTR and is **not** included in this repository.
- A configured MATTR VII tenant with a verifier application configuration (type `android`), a supported wallet configuration, and a trusted issuer. These are configured out of band; see the tutorial for details.

## Setup

1. **Add the SDK to the local repo.** Unzip `mobile-credential-verifier-<version>.zip`, then copy its `global` folder into the project's [repo/](repo/) directory at the root. Gradle resolves the `global.mattr.mobilecredential:verifier` dependency from there.

2. **Set your application id.** Open [app/build.gradle.kts](app/build.gradle.kts) and replace the placeholder `applicationId`:

   ```kotlin
   applicationId = "com.example.mobileverifiertutorial"
   ```

   The deep link scheme in [AndroidManifest.xml](app/src/main/AndroidManifest.xml) is bound to `${applicationId}`, so changing this value automatically updates the scheme that the wallet will redirect to.

3. **Point the app at your tenant.** Open [Constants.kt](app/src/main/java/com/example/mobileverifiertutorial/Constants.kt) and replace both placeholders:

   ```kotlin
   object Constants {
       const val TENANT_HOST = "https://your-tenant.vii.your-region.mattr.global"
       const val APPLICATION_ID = "your-application-id"
   }
   ```

   - `TENANT_HOST` is the base URL of your MATTR VII tenant.
   - `APPLICATION_ID` is the `id` of the verifier application configuration created in your tenant.

4. **Register your signing certificate with MATTR VII.** Get the SHA-256 thumbprint of your debug (or release) signing certificate:

   ```bash
   ./gradlew signingReport
   ```

   Strip the colons and lowercase it, then update your tenant's verifier application configuration so that `packageName` matches step 2, `openid4vpConfiguration.redirectUri` uses `<applicationId>://oid4vp-callback`, and `packageSigningCertificateThumbprints` includes the thumbprint. This is done out of band against your MATTR VII tenant; see the tutorial for the exact request.

## Project structure

| Path | Purpose |
| --- | --- |
| [app/src/main/java/com/example/mobileverifiertutorial/Constants.kt](app/src/main/java/com/example/mobileverifiertutorial/Constants.kt) | Tenant host and application id (replace the placeholders). |
| [app/src/main/java/com/example/mobileverifiertutorial/MainActivity.kt](app/src/main/java/com/example/mobileverifiertutorial/MainActivity.kt) | SDK initialization, the credential request, and the view model that exposes results. |
| [app/src/main/java/com/example/mobileverifiertutorial/DocumentView.kt](app/src/main/java/com/example/mobileverifiertutorial/DocumentView.kt) | Composable that renders a verified document and its claims. |
| [app/src/main/AndroidManifest.xml](app/src/main/AndroidManifest.xml) | Declares the OID4VP callback intent filter bound to `${applicationId}`. |
| [settings.gradle.kts](settings.gradle.kts) | Adds the local `repo/` directory as a maven repository for the SDK. |
| [repo/](repo/) | Drop the unzipped SDK `global` folder here. Empty until you do. |

## Notes

- The placeholder values let the project sync and the app launch, but a credential request only succeeds once `Constants` points at a real tenant and application configuration, the signing thumbprint is registered with that tenant, and a compatible wallet is installed on the device.
- Trusted issuer certificates for the remote workflow are managed in your MATTR VII tenant, not in the app.

---

<p align="center"><a href="https://mattr.global" target="_blank"><img height="40px" src="../docs/assets/mattr-logo-tm.svg"></a></p><p align="center">Copyright © MATTR Limited. <a href="../LICENSE">Some rights reserved.</a><br/>“MATTR” is a trademark of MATTR Limited, registered in New Zealand and other countries.</p>
