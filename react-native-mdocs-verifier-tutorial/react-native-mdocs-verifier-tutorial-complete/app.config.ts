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
    bundleIdentifier: "com.alabbasmattr.rnmdocsverifiersampleapp",
    infoPlist: {
      NSCameraUsageDescription: "This app uses the camera to scan QR codes.",
      NSBluetoothAlwaysUsageDescription: "This app uses Bluetooth to communicate with verifiers or holders.",
      NSBluetoothPeripheralUsageDescription: "This app uses Bluetooth to communicate with verifiers or holders.",
    },
  },
  android: {
    package: "com.alabbasmattr.rnmdocsverifiersampleapp",
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
  },
  plugins: [
    "./withMobileCredentialAndroidVerifierSdk",
    [
      "expo-build-properties",
      {
        android: {
          minSdkVersion: 24,
          kotlinVersion: "1.9.0",
        },
      },
    ],
    [
      "expo-camera",
      {
        cameraPermission: "Allow $(PRODUCT_NAME) to access your camera",
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
});
