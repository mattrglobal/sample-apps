import SwiftUI

// MARK: - App Entry Point
// This is the main entry point for the Remote Mobile Verification tutorial app.
// It launches ContentView, which lets you request an mDoc from a wallet app on the
// same device using OID4VP and ISO/IEC 18013-7 Annex B, then displays the verified
// claims that are returned via a deep link.
@main
struct Remote_verification_tutorialApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
