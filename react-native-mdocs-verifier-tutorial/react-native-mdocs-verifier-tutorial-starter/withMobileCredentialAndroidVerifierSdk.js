/**
 * Expo config plugin that adds the MATTR mobile credential verifier SDK repository
 * to the Android project's build.gradle file.
 *
 * This plugin modifies the project-level build.gradle to include a maven repository
 * that points to the local Android frameworks directory within the React Native package.
 * This is necessary for the Android build system to locate and include the native
 * mobile credential verifier SDK dependencies.
 *
 */
const { withProjectBuildGradle } = require("@expo/config-plugins");

module.exports = function withMobileCredentialAndroidVerifierSdk(config) {
  return withProjectBuildGradle(config, (config) => {
    config.modResults.contents += `\nallprojects { repositories {  maven { url = "$rootDir/../node_modules/@mattrglobal/mobile-credential-verifier-react-native/android/frameworks"  } } }\n`;
    return config;
  });
};
