import type { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "react-native-mdocs-holder-tutorial-sample-app",
  slug: "react-native-mdocs-holder-tutorial-sample-app",
  version: "1.0.0",
  // Online presentation - Step 1.1: Update application custom scheme.
  scheme: "mdoc-openid4vp",
  orientation: "portrait",
  icon: "./assets/icon.png",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  ios: {
    // Update the bundle identifier
    bundleIdentifier: "",
    infoPlist: {
      // Add Face ID and Camera usage permissions
      NSFaceIDUsageDescription: "Face ID is used to secure your credentials.",
      NSCameraUsageDescription: "Camera is used to scan QR codes.",
      // Add Bluetooth permissions
    },
    config: {
      usesNonExemptEncryption: false,
    },
  },
  android: {
    package: "io.mattrlabs.sample.reactnativemobilecredentialholdertutorialapp",
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    permissions: ["CAMERA"],
    intentFilters: [
      {
        action: "VIEW",
        data: {
          scheme:
            "io.mattrlabs.sample.reactnativemobilecredentialholdertutorialapp",
          host: "credentials",
          pathPrefix: "/",
        },
        category: ["BROWSABLE", "DEFAULT"],
      },
      {
        action: "VIEW",
        data: {
          scheme:
            "io.mattrlabs.sample.reactnativemobilecredentialholdertutorialapp",
          host: "expo-development-client",
          pathPrefix: "/",
        },
        category: ["BROWSABLE", "DEFAULT"],
      },
    ],
  },
  plugins: [
    "expo-router",
    [
      "expo-build-properties",
      {
        ios: {
          deploymentTarget: "15.1",
        },
      },
    ],
    [
      "react-native-vision-camera",
      {
        cameraPermissionText: "$(PRODUCT_NAME) needs access to your Camera.",
        enableCodeScanner: true,
      },
    ],
    // Configure the SDK plugins
    /*
     * withAndroidHolderSDK plugin handles the Android SDK setup according to
     * https://api-reference-sdk.mattr.global/mobile-credential-holder-react-native/latest/index.html#md:platform-android
     *
     */
    "./withRemoveAPNSCapability.js",
    [
      "./withAndroidHolderSDK.js",
      {
        mattrDomain: "credentials",
        mattrScheme:
          "io.mattrlabs.sample.reactnativemobilecredentialholdertutorialapp",
      },
    ],

    // You may not have the APNS Capability enabled in your profile.
  ],
  experiments: {
    typedRoutes: true,
  },
});
