import SwiftUI
import Combine

// MARK: - Section: Initialize the SDK (Step 2)
// Import the MobileCredentialVerifierSDK framework to access the SDK's capabilities
// for verifying mDocs presented via the remote (same-device) OID4VP workflow,
// as per ISO/IEC 18013-7 Annex B.
import MobileCredentialVerifierSDK

// MARK: - ContentView
// ContentView is the main entry point for the verifier UI. It shows a single
// "Request credentials" button that starts a presentation request and, once the
// wallet redirects back via a deep link, navigates to a view that renders the
// verified documents.
struct ContentView: View {
    @ObservedObject var viewModel: VerifierViewModel = VerifierViewModel()

    var body: some View {
        NavigationStack(path: $viewModel.navigationPath) {
            VStack {
                Button("Request credentials") {
                    viewModel.requestCredentials()
                }
                .padding()
            }
            .navigationDestination(for: NavigationState.self) { destination in
                switch destination {
                case .viewResponse:
                    presentationResponseView
                }
            }
        }
        // Handle the deep link back from the wallet app. The custom URL scheme is
        // registered in the Info.plist and bound to the app's bundle identifier.
        .onOpenURL { url in
            viewModel.navigationPath.append(NavigationState.viewResponse)
            viewModel.mobileCredentialVerifier.handleDeepLink(url)
        }
    }

    var presentationResponseView: some View {
        ZStack {
            if viewModel.receivedDocuments.isEmpty {
                VStack(spacing: 40) {
                    Text("Waiting for response...")
                        .font(.title)
                    ProgressView()
                        .progressViewStyle(.circular)
                        .scaleEffect(2)
                }
            } else {
                ScrollView {
                    ForEach(viewModel.receivedDocuments, id: \.docType) { doc in
                        DocumentView(viewModel: DocumentViewModel(from: doc))
                            .padding(10)
                    }
                }
            }
        }
    }
}

// MARK: - VerifierViewModel
// The VerifierViewModel holds the SDK instance, the credential request definition,
// and the received verification results. It initializes the SDK with the tenant
// configuration, sends the presentation request, and exposes the response for display.
final class VerifierViewModel: ObservableObject {
    @Published var navigationPath = NavigationPath()
    @Published var receivedDocuments: [MobileCredentialPresentation] = []

    // From v6.0.0, the applicationId is supplied via PlatformConfiguration (it is no longer passed
    // to requestMobileCredentials) and also drives SDK Tethering.
    let platformConfiguration = PlatformConfiguration(
        tenantHost: Constants.tenantHost,
        applicationId: Constants.applicationID
    )

    var mobileCredentialVerifier: MobileCredentialVerifier

    // MARK: Verify mDocs - Step 1: Create a presentation request
    // MobileCredentialRequest defines what information the verifier requests from the holder.
    // - docType: the credential type to request (e.g. mobile driver's license).
    // - namespaces: the specific claims requested under each namespace. Each claim maps to a
    //   boolean indicating whether the verifier intends to retain (persist) the value.
    let mobileCredentialRequest = MobileCredentialRequest(
        docType: "org.iso.18013.5.1.mDL",
        namespaces: [
            "org.iso.18013.5.1":  [
                "family_name": false,
                "given_name": false,
                "birth_date": false
            ]
        ]
    )

    // MARK: Initialize the SDK (Step 2)
    // Assigns the shared MobileCredentialVerifier instance and initializes it with the
    // platform configuration (your tenant host). Trusted issuer certificates are managed
    // in your MATTR VII tenant rather than in the app for this workflow.
    init() {
        mobileCredentialVerifier = MobileCredentialVerifier.shared
        // From v6.0.0, initialize is asynchronous and drives SDK Tethering: on first launch it
        // registers this app instance with the tenant and obtains a license, so it can throw
        // failedToRegister and invalidLicense.
        Task {
            do {
                try await mobileCredentialVerifier.initialize(platformConfiguration: platformConfiguration)
            } catch MobileCredentialVerifierError.failedToRegister {
                // Registration with the MATTR VII tenant failed — check connectivity and configuration.
            } catch MobileCredentialVerifierError.invalidLicense {
                // The SDK license is missing, invalid, or expired.
            } catch {
                print(error.localizedDescription)
            }
        }
    }

    // MARK: Verify mDocs - Step 3: Request the credential
    // Sends the presentation request to a compliant wallet on the device. The challenge is a
    // unique, unpredictable value used to bind the response to this request. The result is
    // delivered back to the app via the deep link handled in ContentView's onOpenURL.
    func requestCredentials() {
        Task { @MainActor in
            receivedDocuments = []
            do {
                // From v6.0.0, applicationId is no longer passed here (it comes from
                // PlatformConfiguration) and challenge is optional — omit it to let the SDK generate
                // a secure challenge, or pass your own to bind the response to this request.
                let onlinePresentationResult = try await mobileCredentialVerifier.requestMobileCredentials(
                    request: [mobileCredentialRequest],
                    challenge: UUID().uuidString
                )
                // From v6.0.0, OnlinePresentationSessionResult is a @frozen enum with success and
                // failure cases, so branch over it with switch/case instead of inspecting nullable
                // fields. success carries (sessionId, challenge, mobileCredentialResponse); failure
                // carries (sessionId, challenge, error).
                switch onlinePresentationResult {
                case .success(_, _, let mobileCredentialResponse):
                    receivedDocuments = mobileCredentialResponse?.credentials ?? []
                case .failure(_, _, let error):
                    print("No response received: \(error.message)")
                    return
                }
            } catch {
                print(error.localizedDescription)
            }
        }
    }
}

// MARK: - Navigation
// NavigationState defines the screens the app can navigate to. The remote workflow only
// needs a single destination: the view that displays the verification response.
enum NavigationState: Hashable {
    case viewResponse
}
