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
					"android:launchMode": "singleTask",
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
