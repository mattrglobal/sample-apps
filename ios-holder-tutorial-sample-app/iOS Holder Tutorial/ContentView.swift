//
//  ContentView.swift
//  iOS Holder Tutorial
//

import SwiftUI
// Claim Credential - Step 1.2: Import MobileCredentialHolderSDK
import MobileCredentialHolderSDK

struct ContentView: View {
   @State var viewModel: ViewModel = ViewModel()
   var body: some View {
       NavigationStack(path: $viewModel.navigationPath) {
           VStack {
               Button("Claim Credential") {
                   viewModel.navigationPath.append(NavigationState.qrScan)

               }
               .padding()
               createQRCodeButton
               if viewModel.shouldDisplayOnlinePresentation {
                   Button("View Online Presentation Session") {
                       viewModel.navigationPath.append(NavigationState.onlinePresentation)
                   }
                   .padding()

               }
               Spacer()
           }
           .padding()
           .navigationDestination(for: NavigationState.self) { destination in
               switch destination {
               case .qrScan:
                   codeScannerView
               case .credentialOffer:
                   credentialOfferView
               case .transactionCodeInput:
                   transactionCodeInputView
               case .retrievedCredentials:
                   retrievedCredentialsView
               case .onlinePresentation:
                   // Online Presentation - Step 3.3: Display online presentation view
                   PresentCredentialsView(
                       viewModel: PresentCredentialsViewModel(
                           requestedDocuments: $viewModel.credentialRequest,
                           matchedCredentials: $viewModel.matchedCredentials,
                           matchedMetadata: $viewModel.matchedMetadata,
                           sendCredentialAction: viewModel.sendOnlinePresentationSessionResponse(id:),
                           getCredentialAction: viewModel.getCredential(id:)
                       )
                   )
               case .presentCredentials:
                   qrCodeView
               case .proximityPresentation:
                   // Proximity Presentation - Step 2.5: Display proximity presentation view
                   PresentCredentialsView(
                       viewModel: PresentCredentialsViewModel(
                           requestedDocuments: $viewModel.credentialRequest,
                           matchedCredentials: $viewModel.matchedCredentials,
                           matchedMetadata: $viewModel.matchedMetadata,
                           sendCredentialAction: viewModel.sendProximityPresentationResponse(id:),
                           getCredentialAction: viewModel.getCredential(id:)
                       )
                   )
               }
           }
           // Online Presentation - Step 2.4: Create session from request URI
           .onOpenURL { url in
               Task {
                   await viewModel.createOnlinePresentationSession(authorizationRequestURI: url.absoluteString)
               }
               // Navigate to online presentation view
               viewModel.navigationPath.append(NavigationState.onlinePresentation)
           }
           // Claim Credential - Step 1.4: Initialize the SDK when the view appears
           .task {
               await viewModel.initialize()
           }
       }
   }

   // MARK: - Credential Retrieval Views

   var codeScannerView: some View {
       // Claim Credential - Step 2.4 Create QRScannerView
       QRScannerView(
           completion: { credentialOffer in
               viewModel.discoverCredentialOffer(credentialOffer)
           }
       )
   }

   var credentialOfferView: some View {
       // Claim Credential - Step 3.5: Display Credential offer
       VStack {
           Text("Received \(viewModel.discoveredCredentialOffer?.credentials.count ?? 0) Credential Offer(s)")
               .font(.headline)
           Text("from \(viewModel.discoveredCredentialOffer?.issuer.absoluteString ?? "unknown issuer")")
               .font(.subheadline)
           List(viewModel.discoveredCredentialOffer?.credentials ?? [], id: \.docType) { credential in
               Section {
                   HStack {
                       Text("Name:")
                           .bold()
                       Spacer()
                       Text("\(credential.name ?? "")")
                   }
                   HStack {
                       Text("Doctype:")
                           .bold()
                       Spacer()
                       Text("\(credential.docType)")
                   }
                   HStack {
                       Text("No. of claims:")
                           .bold()
                       Spacer()
                       Text("\(credential.claims.count)")
                   }
               }
           }
           Button {
               if viewModel.discoveredCredentialOffer?.transactionCode != nil {
                   viewModel.navigationPath.append(NavigationState.transactionCodeInput)
                   return
               }
               viewModel.retrieveCredential(transactionCode: nil)
           } label: {
               Text("Consent and retrieve Credential(s)")
                   .font(.title3)
           }
           .buttonStyle(.borderedProminent)
           .clipShape(Capsule())
       }
   }

   var transactionCodeInputView: some View {
       // Claim Credential - Step: 3.4 Display transaction code input view.
       TransactionCodeInputView(viewModel: viewModel)
   }


   var retrievedCredentialsView: some View {
       // Claim Credential - Step 4.4: Display retrieved credentials
       ScrollView {
           VStack {
               Text("Retrieved Credentials")
                   .font(.title)
               ForEach(viewModel.retrievedCredentials, id: \.id) { credential in
                   DocumentView(viewModel: DocumentViewModel(from: credential))
               }
           }
       }
   }

   // MARK: - Proximity Presentation Views

   var createQRCodeButton: some View {
       // Proximity Presentation - Step 1.5: Add button to generate QR code
       Button {
           viewModel.createDeviceEngagementString()
           // Navigates user to presentCredentialsView, once the string has been created.
           viewModel.navigationPath.append(NavigationState.presentCredentials)
       } label: {
           Text("Present Credentials")
       }
   }

   func generateQRCode(data: Data) -> Data? {
       // Proximity Presentation - Step 1.6: Generate QR code
       guard let filter = CIFilter(name: "CIQRCodeGenerator") else { return nil }
       filter.setValue(data, forKey: "inputMessage")
       guard let ciimage = filter.outputImage else { return nil }
       let transform = CGAffineTransform(scaleX: 10, y: 10)
       let scaledCIImage = ciimage.transformed(by: transform)
       let uiimage = UIImage(ciImage: scaledCIImage)
       return uiimage.pngData()
   }

   var qrCodeView: some View {
       // Proximity Presentation - Step 1.7: Create QR code view
       VStack {
           Text("Scan to establish device engagement session")
               .font(.title3)
           Spacer()
           if let imageData =  generateQRCode(data: viewModel.deviceEngagementString?.data(using: .utf8) ?? Data()),
              let image = UIImage(data: imageData) {
               Image(uiImage: image)
                   .resizable()
                   .aspectRatio(contentMode: .fit)
           }
           Spacer()
       }
   }
}

@Observable class ViewModel {
   var navigationPath = NavigationPath()
   // Claim Credential - Step 1.3: Add MobileCredentialHolder var
    var mobileCredentialHolder: MobileCredentialHolder

   // Claim Credential - Step 3.1: Add DiscoveredCredentialOffer and discoveredCredentialOfferURL vars
    var discoveredCredentialOffer: DiscoveredCredentialOffer?
    var discoveredCredentialOfferURL = ""

   // Claim Credential - Step 4.1: Add retrievedCredentials var
    var retrievedCredentials: [MobileCredential] = []


   // Proximity Presentation - Step 1.2: Create deviceEngagementString and proximityPresentationSession variables
    var deviceEngagementString: String?
    var proximityPresentationSession: ProximityPresentationSession?


   // Proximity and Online Presentation: Create variables for credential presentations
    var matchedCredentials: [MobileCredential] = []
    var matchedMetadata: [MobileCredentialMetadata] = []
    var credentialRequest: [MobileCredentialRequest] = []


   // Online Presentation - Step 2.1: Create a variable to hold the online presentation session object
    var onlinePresentationSession: OnlinePresentationSession?


   var shouldDisplayOnlinePresentation: Bool {
       // Online Presentation - Step 3.4: View Online Presentation
       onlinePresentationSession != nil
   }

   // Claim Credential - Step 1.4: Initialize MobileCredentialHolder SDK
    init() {
        mobileCredentialHolder = MobileCredentialHolder.shared
    }

   // `initialize` is asynchronous as of iOS Holder SDK v6.0.0, so it runs in an async method called
   // from the view's `.task` modifier when the view appears.
    @MainActor
    func initialize() async {
        do {
            try await mobileCredentialHolder.initialize(
                userAuthenticationConfiguration: UserAuthenticationConfiguration(userAuthenticationBehavior: .onDeviceKeyAccess),
                credentialIssuanceConfiguration: CredentialIssuanceConfiguration(
                    redirectUri: Constants.redirectUri,
                    autoTrustMobileCredentialIaca: true
                )
            )
        } catch {
            print(error)
        }
    }

   @MainActor
   func getCredential(id: String) {
       // Proximity and Online Presentation: Retrieve a credential from storage
       Task {
           do {
               let credential = try await mobileCredentialHolder.getCredential(credentialId: id)
               matchedCredentials.append(credential)
           } catch {
               print(error)
           }
       }
   }
}

// MARK: - Credential Retrieval

extension ViewModel {
   @MainActor
   func discoverCredentialOffer(_ offer: String) {
       // Claim Credential - Step 3.2: Add discover credential offer logic
       Task {
           do {
               discoveredCredentialOffer = try await mobileCredentialHolder.discoverCredentialOffer(offer)
               // save the url to use for credential retrieval
               discoveredCredentialOfferURL = offer
               // present credential offer screen, as soon as credential offer is discovered
               navigationPath.append(NavigationState.credentialOffer)
           } catch {
               print(error)
           }
       }
   }

   @MainActor
   func retrieveCredential(transactionCode: String?) {
       // Claim Credential - Step 4.2: Call retrieveCredential method
       Task {
           do {
               let retrievedCredentialResults = try await mobileCredentialHolder.retrieveCredentials(
                   credentialOffer: discoveredCredentialOfferURL,
                   clientId: Constants.clientId,
                   transactionCode: transactionCode
               )
               Task {
                   var credentials: [MobileCredential] = []
                   for result in retrievedCredentialResults {
                       switch result {
                       case .success(_, let credentialId):
                           if let credential = try? await mobileCredentialHolder.getCredential(credentialId: credentialId) {
                               credentials.append(credential)
                           }
                       case .failure(let docType, let error):
                           print("Failed to retrieve \(docType): \(error)")
                       }
                   }
                   self.retrievedCredentials = credentials
                   // Clear navigation stack and display retrievedCredentials view
                   navigationPath = NavigationPath()
                   navigationPath.append(NavigationState.retrievedCredentials)
               }
           } catch {
               print(error.localizedDescription)
           }
       }
   }
}

// MARK: - Online Presentation

extension ViewModel {
   @MainActor
   func createOnlinePresentationSession(authorizationRequestURI: String) async {
       // Online Presentation - Step 2.3: Create online presentation session
       Task {
           do {
               onlinePresentationSession = try await mobileCredentialHolder.createOnlinePresentationSession(authorizationRequestUri: authorizationRequestURI, requireTrustedVerifier: false)
               let matched = onlinePresentationSession?.getMatchedCredentials() ?? []
               matchedMetadata = matched
                   .flatMap { $0.matchedMobileCredentials }

               credentialRequest = matched
                   .map { $0.request }
           } catch {
               print(error.localizedDescription)
           }
       }
   }

   @MainActor
   func sendOnlinePresentationSessionResponse(id: String) {
       // Online Presentation - Step 4.1: Send online presentation response
       Task {
           do {
               _ = try await onlinePresentationSession?.sendResponse(credentialIds: [id])
               // set presentation session to nil after sending a response
               onlinePresentationSession = nil
               // Return to root view after the response is sent
               navigationPath = NavigationPath()
           } catch {
               print(error)
           }
       }
   }
}

// MARK: - Proximity Presentation

extension ViewModel {
   func createDeviceEngagementString() {
       // Proximity Presentation - Step 1.3: Create function to create a proximity presentation session and generate QR code
       Task { @MainActor in
           do {
               proximityPresentationSession = try await mobileCredentialHolder.createProximityPresentationSession(
                   onRequestReceived: onRequestReceived(_:error:),
                   bleMode: .mDocPeripheralServer
               )
               deviceEngagementString = proximityPresentationSession?.deviceEngagement

           } catch {
               print(error)
           }
       }
   }

   // Proximity Presentation - Step 1.4: Update function signature
    func onRequestReceived(_ mobileCredentialRequests: [(request: MobileCredentialRequest, matchedMobileCredentials: [MobileCredentialMetadata])]?, error: Error?) {
       // Proximity Presentation - Step 2.2: Store credential requests and matched credentials
        Task { @MainActor in
            matchedMetadata = mobileCredentialRequests?
                .flatMap { $0.matchedMobileCredentials }
                .compactMap { $0 } ?? []

            credentialRequest = mobileCredentialRequests?
                .compactMap { $0.request }
                .compactMap { $0 } ?? []
            // Navigate to presentation view if there are no errors
            if error == nil {
                navigationPath.append(NavigationState.proximityPresentation)
            } else {
                print(error!)
            }
        }
   }

   @MainActor
   func sendProximityPresentationResponse(id: String) {
       // Proximity Presentation - Step 3.1: Send a credential response
       Task {
           do {
               let _ = try await proximityPresentationSession?.sendResponse(credentialIds: [id])
               // set presentation session to nil after sending a response
               proximityPresentationSession = nil
               // Return to root view after the response is sent
               navigationPath = NavigationPath()
           } catch {
               print(error)
           }
       }

   }
}

// MARK: - Navigation

enum NavigationState: Hashable {
   case qrScan
   case credentialOffer
   case transactionCodeInput
   case retrievedCredentials
   case onlinePresentation
   case presentCredentials
   case proximityPresentation
}
