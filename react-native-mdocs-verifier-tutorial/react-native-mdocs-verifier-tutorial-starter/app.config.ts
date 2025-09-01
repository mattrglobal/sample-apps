import type { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "rn-mdocs-verifier-sample-app",
  slug: "rn-mdocs-verifier-sample-app",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  ios: {
    // Update the bundle identifier
    bundleIdentifier: "",
    infoPlist: {
      // Add necessary permissions for camera and Bluetooth
    },
  },
  android: {
    package: "io.mattrlabs.sample.reactnativemobilecredentialholdertutorialapp",
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
  },
  plugins: [
    // Configure the app plugins
    /*
     * withMobileCredentialAndroidVerifierSdk plugin handles the Android SDK setup according to
     * https://api-reference-sdk.mattr.global/mobile-credential-verifier-react-native/latest/index.html#md:system-requirements
     * https://api-reference-sdk.mattr.global/mobile-credential-verifier-react-native/latest/index.html#md:platform-android
     *
     */
  ],
  experiments: {
    typedRoutes: true,
  },
});
