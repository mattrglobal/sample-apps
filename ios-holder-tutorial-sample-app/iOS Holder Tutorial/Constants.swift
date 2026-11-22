//
//  Constants.swift
//  iOS Holder Tutorial
//

import Foundation

enum Constants {
	// From iOS Holder SDK v7.0.0, the SDK requires an SDK Backend on a MATTR VII tenant. Replace these
	// with your tenant host and the Holder Application `id` created on that tenant.
	static let tenantHost = URL(string: "https://your-tenant.vii.mattr.global")!
	static let applicationId = "<YOUR_HOLDER_APPLICATION_ID>"

	static let redirectUri: String = "io.mattrlabs.sample.mobilecredentialholderapp://credentials/callback"
	static let clientId: String = "ios-sample-mobile-credential-holder-app"
}
