import { Platform } from "react-native";

/**
 * Configuration values used to initialize the SDK and request credentials.
 *
 * Replace these placeholders with your own values before running the app:
 * - `TENANT_HOST`: the URL of your MATTR VII tenant, available in the MATTR Portal under
 *   Platform Management > Tenant.
 * - `IOS_APPLICATION_ID` / `ANDROID_APPLICATION_ID`: the `id` returned when you created the verifier
 *   application configuration in the MATTR Portal under Credential Verification > Applications.
 *   iOS and Android each use their own verifier application, because the redirect URI registered on
 *   the application must match that platform's URL scheme (see `app.config.ts`). Configure one
 *   application ID per platform.
 */
const IOS_APPLICATION_ID = "your-ios-application-id";
const ANDROID_APPLICATION_ID = "your-android-application-id";

export const Constants = {
	TENANT_HOST: "https://your-tenant.vii.mattr.global",
	// Resolves to the verifier application ID for the current platform.
	APPLICATION_ID: Platform.OS === "ios" ? IOS_APPLICATION_ID : ANDROID_APPLICATION_ID,
};
