import MobileCredentialVerifierSDK
import SwiftUI

// MARK: - Section: Manage Certificates (Step 1)
// This view provides the interface for managing trusted IACA (Issuing Authority Certificate
// Authority) root certificates. Every mDoc is signed by a chain of trust - for the verifier
// app to verify a presented mDoc, it must validate the mDoc was signed using a root certificate
// associated with a trusted issuer. This screen lets the user add, view, and remove those
// trusted certificates.
struct CertificateManagementView: View {
    @State var viewModel = CertificateManagementViewModel()
    @State var certificateString = ""

    var body: some View {
        Form {
            Section(
                header: Text("IACA Certificate").font(.headline),
                footer: HStack {
                    Spacer()
                    Button("Add") {
                        viewModel.addCertificate(certificateString)
                    }
                    Spacer().frame(width: 30)
                    Button("Clear") {
                        certificateString = ""
                    }
                    .foregroundColor(.red)
                    .contentShape(Rectangle())
                    .frame(alignment: .trailing)
                }
            ) {
                TextField("IACA certificate string", text: $certificateString)
            }

            Section(
                header: Text("Stored Certificates").font(.headline)
            ) {
                certificateListView
            }
        }
        .navigationBarTitle("Certificate Setting")
        .onAppear {
            viewModel.getCertificates()
        }
    }
    
    // MARK: Certificate Management Views
    var certificateListView: some View {
        // Manage Certificates - Step 2.3: Display retrieved certificates
        // Iterates over stored certificates and displays each one with its PEM content.
        // A swipe-to-delete action is available on each row to remove individual certificates.
        ForEach(viewModel.certificates, id: \.id) { certificate in
            Text("\(certificate.pem)")
                .frame(maxHeight: 100)
                .swipeActions(edge: .trailing) {
                    Button(role: .destructive) {
                        viewModel.removeCertificate(certificate.id)
                    } label: {
                        Image(systemName: "trash")
                    }
                }
        }
    }
}

// MARK: - CertificateManagementViewModel
// Contains the business logic for certificate management operations.
// Uses a shared MobileCredentialVerifier instance to interact with the SDK's
// certificate storage (add, retrieve, and delete trusted IACA certificates).
@Observable
final class CertificateManagementViewModel {
    // Manage Certificates - Step 2.1: Add certificates and verifier variable
    // certificates: Holds the list of currently stored trusted certificates for display.
    // mobileCredentialVerifier: Shared SDK instance used to call certificate management functions.
    var certificates: [TrustedCertificate] = []
    let mobileCredentialVerifier = MobileCredentialVerifier.shared
    
    func getCertificates() {
        // Manage Certificates - Step 2.2: Create getCertificates function
        // Calls the SDK's getTrustedIssuerCertificates() to retrieve all stored certificates
        // and updates the published certificates array to refresh the UI.
        do {
            let fetchedCertificates = try mobileCredentialVerifier.getTrustedIssuerCertificates()
            certificates = fetchedCertificates
        } catch {
            print(error.localizedDescription)
        }
    }

    func addCertificate(_ certificate: String) {
        // Manage Certificates - Step 2.4: Create addCertificate function
        // Calls the SDK's addTrustedIssuerCertificates() to store a new IACA certificate
        // from the provided PEM string, then refreshes the certificate list.
        Task { @MainActor in
            do {
                _ = try await mobileCredentialVerifier.addTrustedIssuerCertificates(certificates: [certificate])
                self.getCertificates()
            } catch {
                print(error.localizedDescription)
            }
        }
    }

    func removeCertificate(_ certificateID: String) {
        // Manage Certificates - Step 2.5: Create removeCertificate function
        // Calls the SDK's deleteTrustedIssuerCertificate() to remove a certificate by ID,
        // then refreshes the list. Removing a certificate means the app will no longer
        // trust mDocs issued under that certificate's chain of trust.
        do {
            try mobileCredentialVerifier.deleteTrustedIssuerCertificate(certificateId: certificateID)
            self.getCertificates()
        } catch {
            print(error.localizedDescription)
        }
    }
}
