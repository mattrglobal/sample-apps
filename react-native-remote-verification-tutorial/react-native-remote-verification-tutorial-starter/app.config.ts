import type { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
	...config,
	name: "rn-remote-verifier-sample-app",
	slug: "rn-remote-verifier-sample-app",
	version: "1.0.0",
	orientation: "portrait",
	icon: "./assets/icon.png",
	userInterfaceStyle: "light",
	// Add the custom URL scheme used for the wallet redirect
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
		// Configure the app plugins
	],
});
