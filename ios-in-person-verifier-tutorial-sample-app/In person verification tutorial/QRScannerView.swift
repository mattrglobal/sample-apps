import SwiftUI
import CodeScanner
import AVFoundation

// MARK: - Section: Verify mDocs - Step 2: Scan and process a QR code
// As defined in ISO 18013-5, a proximity presentation workflow is always initiated by the holder,
// who presents a QR code containing a device engagement string. The verifier scans this QR code
// to retrieve the engagement data and establish a secure BLE connection.
//
// This view uses the third-party CodeScanner library (added via Swift Package Manager) to provide
// camera-based QR code scanning. When a QR code is successfully scanned, the result string
// (device engagement) is passed to the completion handler, which triggers
// setupProximityPresentationSession in the VerifierViewModel.
//
// Prerequisites: Camera usage permissions must be configured in the app's Info.plist.
struct QRScannerView: View {
    private let completionHandler: (String) -> Void

    init(completion: @escaping (String) -> Void) {
        completionHandler = completion
    }

    var body: some View {
        CodeScannerView(codeTypes: [.qr]) { result in
            switch result {
            case .failure(let error):
                print(error.localizedDescription)
            case .success(let result):
                print(result.string)
                completionHandler(result.string)
            }
        }
    }
}

