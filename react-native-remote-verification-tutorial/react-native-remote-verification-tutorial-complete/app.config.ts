import type { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
	...config,
	name: "rn-remote-verifier-sample-app",
	slug: "rn-remote-verifier-sample-app",
	version: "1.0.0",
	orientation: "portrait",
	icon: "./assets/icon.png",
	userInterfaceStyle: "light",
	// Update the scheme property
	scheme: "",
	splash: {
		image: "./assets/splash.png",
		resizeMode: "contain",
		backgroundColor: "#ffffff",
	},
	ios: {
		// Update the bundle identifier
		bundleIdentifier: "",
	},
	android: {
		// Update the package name
		package: "",
		adaptiveIcon: {
			foregroundImage: "./assets/adaptive-icon.png",
			backgroundColor: "#ffffff",
		},
	},
	plugins: [
		// Adds the Maven repository that hosts the native Android Verifier SDK.
		"./withMobileCredentialAndroidVerifierSdk",
		// Declares the SDK's OpenID4VP callback activity so the wallet can redirect back to this app
		// on Android. The activity is bound to `{package}://oid4vp-callback`.
		"./withOpenid4VpCallbackActivity",
		[
			"expo-build-properties",
			{
				android: {
					minSdkVersion: 24,
					compileSdkVersion: 36,
					targetSdkVersion: 34,
					kotlinVersion: "2.0.21",
				},
			},
		],
	],
});
