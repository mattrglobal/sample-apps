const { withEntitlementsPlist } = require("@expo/config-plugins");

/**
 * A Config Plugin to remove the `aps-environment` key from iOS entitlements.
 * This prevents Xcode from enabling the Push Notification capability.
 */
function withRemoveAPNsCapability(config) {
	return withEntitlementsPlist(config, (config) => {
		if (config.modResults?.["aps-environment"]) {
			delete config.modResults["aps-environment"];
		}
		return config;
	});
}

module.exports = withRemoveAPNsCapability;
