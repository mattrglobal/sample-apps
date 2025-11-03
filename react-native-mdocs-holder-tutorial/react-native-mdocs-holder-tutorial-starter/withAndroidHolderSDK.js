/**
 * Expo Config Plugin for MATTR Mobile Credential Holder SDK (Android)
 *
 * This plugin configures the Android build for the MATTR Mobile Credential Holder SDK.
 * It performs three critical tasks:
 *
 * 1. MAVEN REPOSITORY SETUP
 *    - Adds the local Maven repository for the MATTR SDK native Android libraries
 *    - Required because the SDK includes native Android artifacts not available on public repos
 *
 * 2. MAINACTIVITY INTENT FILTER CLEANUP
 *    - Removes generic app scheme intent filters (without host) from MainActivity
 *    - This prevents MainActivity from catching ALL URLs with the app scheme
 *    - Preserves other schemes (mdoc-openid4vp://, exp+*, etc.) and host-specific app scheme URLs
 *    - Allows proper deep link routing where specific paths go to intended handlers
 *
 * 3. WEBCALLBACKACTIVITY REGISTRATION
 *    - Adds MATTR SDK's WebCallbackActivity to handle OAuth redirects
 *    - Configures it to ONLY handle: appscheme://credentials/callback
 *    - This activity processes OAuth responses and passes them to the SDK
 *
 * WHY THIS IS NEEDED:
 * - Without the Maven repo: SDK native libraries won't be found during build
 * - Without intent filter cleanup: MainActivity would catch appscheme://credentials/callback,
 *   preventing WebCallbackActivity from receiving OAuth redirects
 * - Without WebCallbackActivity: OAuth redirects have nowhere to go after browser authentication
 *
 * DEEP LINK ROUTING AFTER THIS PLUGIN:
 * - appscheme://credentials/callback → WebCallbackActivity → MATTR SDK (OAuth flow completion)
 * - Other app scheme URLs → handled by Expo Router configuration in app.config.ts
 * - mdoc-openid4vp:// URLs → MainActivity → Expo Router → /online-presentation
 */

const {
	withProjectBuildGradle,
	withAndroidManifest,
} = require("@expo/config-plugins");

function withAndroidHolderSDK(config) {
	// Add Maven repository for MATTR SDK
	config = withProjectBuildGradle(config, (config) => {
		if (config.modResults.contents) {
			// Check if the maven repository already exists
			const mavenRepoUrl =
				"$rootDir/../node_modules/@mattrglobal/mobile-credential-holder-react-native/android/frameworks";

			if (!config.modResults.contents.includes(mavenRepoUrl)) {
				// Find the allprojects/repositories block and add the maven repository
				config.modResults.contents = config.modResults.contents.replace(
					/(allprojects\s*\{[\s\S]*?repositories\s*\{[\s\S]*?)(mavenCentral\(\))/,
					(match, beforeMavenCentral, mavenCentral) => {
						return `${beforeMavenCentral}${mavenCentral}
    maven {
      url = "$rootDir/../node_modules/@mattrglobal/mobile-credential-holder-react-native/android/frameworks"
    }`;
					},
				);
			}
		}
		return config;
	});

	// Clean up MainActivity intent filters to prevent conflicts
	config = withAndroidManifest(config, (config) => {
		const androidManifest = config.modResults;
		const application = androidManifest.manifest.application[0];

		// Find MainActivity and clean up its intent filters
		const mainActivity = application.activity?.find(
			(activity) => activity.$["android:name"] === ".MainActivity",
		);

		if (mainActivity?.["intent-filter"]) {
			// Filter out conflicting schemes from MainActivity
			mainActivity["intent-filter"] = mainActivity["intent-filter"].flatMap(
				(filter) => {
					if (!filter.data) return filter;

					// Remove app scheme entries without host (these conflict with WebCallbackActivity)
					filter.data = filter.data.filter((dataNode) => {
						const attrs = dataNode.$;
						const scheme = attrs["android:scheme"];
						const hasHost = "android:host" in attrs;

						// Remove the app scheme if it doesn't have a host
						// This prevents MainActivity from catching all app scheme URLs
						if (
							scheme ===
								"io.mattrlabs.sample.reactnativemobilecredentialholdertutorialapp" &&
							!hasHost
						) {
							return false;
						}

						// Keep everything else (mdoc-openid4vp, exp+*, etc.)
						return true;
					});

					// If no data tags left, remove the entire intent-filter
					if (filter.data.length === 0) {
						return [];
					}

					return [filter];
				},
			);
		}

		return config;
	});

	// Add WebCallbackActivity to Android manifest
	config = withAndroidManifest(config, (config) => {
		const androidManifest = config.modResults;

		const application = androidManifest.manifest.application[0];

		// Check if the activity already exists
		const activityExists = application.activity?.some(
			(activity) =>
				activity.$["android:name"] ===
				"global.mattr.mobilecredential.common.webcallback.WebCallbackActivity",
		);

		if (!activityExists) {
			// Create the activity configuration
			const webCallbackActivity = {
				$: {
					"android:name":
						"global.mattr.mobilecredential.common.webcallback.WebCallbackActivity",
					"android:exported": "true",
					"android:label": "@string/app_name",
				},
				"intent-filter": [
					{
						action: [
							{
								$: {
									"android:name": "android.intent.action.VIEW",
								},
							},
						],
						category: [
							{
								$: {
									"android:name": "android.intent.category.DEFAULT",
								},
							},
							{
								$: {
									"android:name": "android.intent.category.BROWSABLE",
								},
							},
						],
						data: [
							{
								$: {
									"android:scheme":
										"io.mattrlabs.sample.reactnativemobilecredentialholdertutorialapp",
									"android:host": "credentials",
									"android:pathPrefix": "/callback",
								},
							},
						],
					},
				],
			};

			// Add the activity to the application
			if (!application.activity) {
				application.activity = [];
			}
			application.activity.push(webCallbackActivity);
		}

		return config;
	});

	return config;
}

module.exports = withAndroidHolderSDK;
