import SwiftUI

// MARK: - Section: Initialize the SDK (Step 2)
// Import the MobileCredentialVerifierSDK framework to access the SDK's capabilities
// for verifying mDocs presented via a proximity workflow (ISO 18013-5).
// Initialize SDK - Step 2.1: import MobileCredentialVerifierSDK
import MobileCredentialVerifierSDK

// MARK: - Section: Create the Application Structure (Step 1)
// ContentView serves as the main entry point for the verifier app UI.
// It provides navigation to three key screens:
// 1. Certificate Management - for managing trusted issuer certificates (IACA)
// 2. Scan QR Code - for scanning the holder's QR code to initiate proximity verification
// 3. View Response - for displaying the verification results
struct ContentView: View {
    @State var viewModel: VerifierViewModel = VerifierViewModel()
    
    var body: some View {
        NavigationStack(path: $viewModel.navigationPath) {
            VStack {
                Button("Certificate Management") {
                    viewModel.navigationPath.append(NavigationState.certificateManagement)
                }
                .padding()
                
                Button("Scan QR Code") {
                    viewModel.navigationPath.append(NavigationState.scanQRCode)
                }
                .padding()
                
                Button("View Response") {
                    viewModel.navigationPath.append(NavigationState.viewResponse)
                }
                .padding()
            }
            .navigationDestination(for: NavigationState.self) { destination in
                switch destination {
                case .certificateManagement:
                    certificateManagementView
                case .scanQRCode:
                    codeScannerView
                case .viewResponse:
                    presentationResponseView
                }
            }
        }
    }
    
    // MARK: Verification Views
    
    // Verify mDocs - Step 2: Scan and process a QR code
    // As defined in ISO 18013-5, the proximity presentation workflow is initiated by the holder
    // presenting a QR code. The verifier scans this QR code to retrieve the device engagement
    // string, which is then used to establish a secure BLE connection with the holder's wallet.
    var codeScannerView: some View {
        // Verify mDocs - Step 2.4: Create QRScannerView
        QRScannerView(
            completion: { string in
                viewModel.setupProximityPresentationSession(string)
            }
        )
    }
    // MARK: Section: Manage Certificates (Step 1.2)
    // Navigate to the CertificateManagementView where the user can add, view,
    // and remove trusted IACA root certificates. These certificates are needed
    // to verify that a presented mDoc was issued by a trusted issuer.
    // Manage Certificates - Step 1.2: Create CertificateManagementView
    var certificateManagementView: some View {
        CertificateManagementView()
    }
    // Verify mDocs - Step 4: Display verification results
    // After the proximity presentation exchange completes, this view displays
    // the verification results for each received mDoc. It shows a loading indicator
    // while waiting for the holder's response, then renders a DocumentView for
    // each credential once results are available.
    var presentationResponseView: some View {
        // Verify mDocs - Step 4.2: Create PresentationResponseView
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
// The VerifierViewModel holds the core SDK instance, the credential request definition,
// and the received verification results. It coordinates the entire proximity presentation
// workflow: initialization, session creation, request sending, and response handling.
@Observable
final class VerifierViewModel {
    var navigationPath = NavigationPath()

    // Initialize SDK - Step 2.2: Add MobileCredentialVerifier var
    // This variable holds a shared instance of MobileCredentialVerifier, which provides
    // access to all SDK functions (certificate management, session creation, etc.).
    var mobileCredentialVerifier: MobileCredentialVerifier
    
    // MARK: Section: Verify mDocs - Step 1: Create a presentation request
    // MobileCredentialRequest defines what information the verifier requests from the holder.
    // - docType: The credential type to request (e.g. mobile driver's license).
    // - namespaces: The specific claims to request under each namespace.
    //   Each claim maps to a boolean indicating whether the verifier intends to retain (persist) the value.
    // For verification to succeed, the presented credential must include these claims
    // under the exact namespace specified in the request.
    // Verify mDocs - Step 1.1: Create MobileCredentialRequest instance
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
    
    // Verify mDocs - Step 1.2: Create receivedDocuments variable
    // Holds the wallet's response after verification. Each MobileCredentialPresentation
    // contains the verified claims, any claim errors, and the overall verification result.
    var receivedDocuments: [MobileCredentialPresentation] = []
    
    // Initialize SDK - Step 2.3: Initialize the SDK
    // Initialization assigns the shared MobileCredentialVerifier instance and calls initialize()
    // to prepare the SDK for use. A trusted IACA certificate is also pre-loaded so the app
    // can verify mDocs issued by the Montcliff DMV test issuer out of the box.
    init() {
        mobileCredentialVerifier = MobileCredentialVerifier.shared
        // From v6.0.0, initialize is asynchronous and requires a PlatformConfiguration. On first
        // launch it registers this app instance with the tenant and obtains a license, so it can
        // throw failedToRegister and invalidLicense.
        Task {
            do {
                let platformConfiguration = PlatformConfiguration(
                    tenantHost: Constants.tenantHost,
                    applicationId: Constants.applicationId
                )
                try await mobileCredentialVerifier.initialize(platformConfiguration: platformConfiguration)
                try? await mobileCredentialVerifier.addTrustedIssuerCertificates(certificates: [Constants.montcliffPEM])
            } catch MobileCredentialVerifierError.failedToRegister {
                // Registration with the MATTR VII tenant failed — check connectivity and configuration.
            } catch MobileCredentialVerifierError.invalidLicense {
                // The SDK license is missing, invalid, or expired.
            } catch {
                print(error.localizedDescription)
            }
        }
    }
}

// MARK: - Proximity Presentation
// This extension handles the proximity presentation workflow (Verify mDocs - Step 3):
// 1. The verifier scans a QR code to get the device engagement string.
// 2. createProximityPresentationSession establishes a BLE connection with the holder's wallet.
// 3. Once connected (onEstablished callback), sendDeviceRequest sends the credential request.
// 4. The holder reviews and consents to sharing, then the SDK receives and verifies the response.
// 5. Results are stored in receivedDocuments for display.
extension VerifierViewModel {
    func setupProximityPresentationSession(_ deviceEngagementString: String) {
        // Verify mDocs - Step 3.2: Create setupProximityPresentationSession
        // Takes the device engagement string from the scanned QR code and creates a proximity
        // presentation session. The `listener` (self) receives session lifecycle callbacks.
        mobileCredentialVerifier.createProximityPresentationSession(encodedDeviceEngagementString: deviceEngagementString, listener: self)
    }

    func sendDeviceRequest() {
        // Verify mDocs - Step 3.3: Create sendDeviceRequest function
        // This function is called when the proximity session is established (via onEstablished).
        // It performs the following sequence:
        // 1. Navigates to the response view (shows a loading indicator).
        // 2. Sends the presentation request to the holder's wallet via sendProximityPresentationRequest.
        //    The SDK handles the BLE data exchange, receives the wallet's response, and verifies
        //    any mDocs included using the stored trusted IACA certificates.
        // 3. Stores the verified credentials in receivedDocuments for the UI to display.
        // 4. Terminates the proximity session to release BLE resources.
        Task { @MainActor in
            receivedDocuments = []
            do {
                navigationPath.append(NavigationState.viewResponse)
                let deviceResponse = try await mobileCredentialVerifier.sendProximityPresentationRequest(
                    request: [mobileCredentialRequest]
                )
                
                receivedDocuments = deviceResponse.credentials ?? []
                await mobileCredentialVerifier.terminateProximityPresentationSession()
            } catch {
                print(error)
                receivedDocuments = []
            }
        }
    }
}

// Verify mDocs - Step 3.1: Extend VerifierViewModel class
// Conforming to ProximityPresentationSessionListener enables the ViewModel to react
// to proximity session lifecycle events:
// - onEstablished: Called when the BLE connection with the holder is ready.
//   This is where we trigger sendDeviceRequest() to send our credential request.
// - onTerminated: Called when the session ends (either normally or due to an error).
// - onError: Called if an error occurs during the session.
extension VerifierViewModel: ProximityPresentationSessionListener {
    public func onEstablished() {
        sendDeviceRequest()
    }
    
    public func onTerminated(error: (any Error)?) {
        print("Session Terminated")
    }
    
    func onError(error: (any Error)?) {
        print("There was an error")
    }
}


// MARK: - Navigation
// NavigationState defines the three main screens of the verifier app,
// corresponding to the tutorial's key capabilities:
// - certificateManagement: Manage trusted issuer certificates (Section: Manage Certificates)
// - scanQRCode: Scan holder's QR code to initiate verification (Section: Verify mDocs - Step 2)
// - viewResponse: Display verification results (Section: Verify mDocs - Step 4)
enum NavigationState: Hashable {
    case certificateManagement
    case scanQRCode
    case viewResponse
}
