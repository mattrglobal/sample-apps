import { Platform } from "react-native";

/**
 * Initialize SDK - Step 1.3: Configure the SDK Backend
 *
 * From SDK v10.0.0 the Verifier SDK is tethered to a MATTR VII tenant. On first initialization it
 * registers this app instance with the tenant and obtains the license the SDK needs to operate, so a
 * tenant and a verifier application are required even for in-person (proximity) verification.
 *
 * Replace these placeholders with your own values before running the app:
 * - `TENANT_HOST`: the URL of your MATTR VII tenant, available in the MATTR Portal under
 *   Platform Management > Tenant.
 * - `IOS_APPLICATION_ID` / `ANDROID_APPLICATION_ID`: the `id` returned when you created the verifier
 *   application configuration in the MATTR Portal under Credential Verification > Applications.
 *   iOS and Android each use their own verifier application, because the application is identified by
 *   the bundle ID and team ID (iOS) or the package fingerprint (Android) declared in `app.config.ts`.
 *   Configure one application ID per platform.
 */
const IOS_APPLICATION_ID = "your-ios-application-id";
const ANDROID_APPLICATION_ID = "your-android-application-id";

export const Constants = {
	TENANT_HOST: "https://your-tenant.vii.mattr.global",
	// Resolves to the verifier application ID for the current platform.
	APPLICATION_ID:
		Platform.OS === "ios" ? IOS_APPLICATION_ID : ANDROID_APPLICATION_ID,
};
