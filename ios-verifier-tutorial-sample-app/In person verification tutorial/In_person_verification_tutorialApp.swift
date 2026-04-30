import SwiftUI

// MARK: - App Entry Point
// This is the main entry point for the In-Person Verification tutorial app.
// It launches ContentView, which provides the navigation structure for the three
// key capabilities built in this tutorial:
// 1. Initialize the SDK (automatic on launch)
// 2. Manage trusted issuer certificates
// 3. Verify mDocs via proximity presentation (scan QR, exchange credentials, view results)
@main
struct In_person_verification_tutorialApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
