const { withAndroidManifest } = require("@expo/config-plugins");

// Fully qualified name of the callback activity shipped with the native Android Verifier SDK.
// The SDK relies on this activity to receive the OpenID4VP redirect from the wallet and resolve
// the pending `requestMobileCredentials` call.
const CALLBACK_ACTIVITY = "global.mattr.mobilecredential.verifier.a2apresentation.callback.Openid4VpCallbackActivity";

/**
 * Declares the SDK's OpenID4VP callback activity in AndroidManifest.xml.
 *
 * The intent filter is bound to `${applicationId}://oid4vp-callback`, so it automatically matches the
 * redirect URI configured on the MATTR VII verifier application (provided that redirect URI uses the
 * app's package name as its scheme and `oid4vp-callback` as its host).
 */
module.exports = function withOpenid4VpCallbackActivity(config) {
  return withAndroidManifest(config, (config) => {
    const application = config.modResults.manifest.application?.[0];
    if (!application) {
      return config;
    }

    application.activity = application.activity || [];

    const alreadyDeclared = application.activity.some(
      (activity) => activity.$?.["android:name"] === CALLBACK_ACTIVITY
    );

    if (!alreadyDeclared) {
      application.activity.push({
        $: {
          "android:name": CALLBACK_ACTIVITY,
          "android:exported": "true",
        },
        "intent-filter": [
          {
            action: [{ $: { "android:name": "android.intent.action.VIEW" } }],
            category: [
              { $: { "android:name": "android.intent.category.DEFAULT" } },
              { $: { "android:name": "android.intent.category.BROWSABLE" } },
            ],
            // `${applicationId}` is substituted with the Android package name at build time.
            data: [{ $: { "android:scheme": "${applicationId}", "android:host": "oid4vp-callback" } }],
          },
        ],
      });
    }

    return config;
  });
};
