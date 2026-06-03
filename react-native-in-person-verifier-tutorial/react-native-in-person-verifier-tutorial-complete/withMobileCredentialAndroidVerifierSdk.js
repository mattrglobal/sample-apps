const { withProjectBuildGradle } = require("@expo/config-plugins");

module.exports = function withMobileCredentialAndroidVerifierSdk(config) {
  return withProjectBuildGradle(config, (config) => {
    config.modResults.contents += `\nallprojects { repositories {  maven { url = "$rootDir/../node_modules/@mattrglobal/mobile-credential-verifier-react-native/android/frameworks"  } } }\n`;
    return config;
  });
};
