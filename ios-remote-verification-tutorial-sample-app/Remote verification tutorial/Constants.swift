import Foundation

// MARK: - Constants
// These values are specific to your own MATTR VII tenant and to the verifier
// application configuration you create within it (handled out of band, see the README).
// Replace both placeholders before running a real verification:
//   - tenantHost: the base URL of your MATTR VII tenant.
//   - applicationID: the `id` returned when you create the presentation application
//     configuration in your tenant.
// The app will launch with these placeholder values, but a credential request will only
// succeed once they point at a real tenant and application configuration.
enum Constants {
    static let tenantHost = URL(string: "https://your-tenant.vii.your-region.mattr.global")!
    static let applicationID = "your-application-id"
}
