//
//  PresentCredentialsView.swift
//  iOS Holder Tutorial
//


import MobileCredentialHolderSDK
import SwiftUI
import Combine

struct PresentCredentialsView: View {
    @ObservedObject var viewModel: PresentCredentialsViewModel
    @State var selectedID: String?

    init(viewModel: PresentCredentialsViewModel) {
        self.viewModel = viewModel
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                Text("Requested Documents")
                    .font(.headline)
                    .padding(.leading)

                ForEach(viewModel.requestedDocuments, id: \.docType) { requestedDocument in
                    DocumentView(viewModel: DocumentViewModel(from: requestedDocument))
                }

                Text("Matched Credentials")
                    .font(.headline)
                    .padding(.leading)

                ForEach(viewModel.matchedMetadata, id: \.id) { matchedMetadata in
                    VStack(alignment: .leading, spacing: 10) {
                        if let matchedCredential = viewModel.matchedMobileCredential(id: matchedMetadata.id) {
                            DocumentView(viewModel: DocumentViewModel(from: matchedCredential))
                                .padding(.vertical)
                                .background(selectedID == matchedMetadata.id ? Color.blue.opacity(0.2) : Color.clear)
                                .onTapGesture {
                                    guard selectedID != matchedMetadata.id else {
                                        selectedID = nil
                                        return
                                    }
                                    selectedID = matchedMetadata.id
                                }
                            Button("Hide claim values") {
                                viewModel.matchedCredentials.removeAll(where: { $0.id == matchedMetadata.id })
                            }
                            .frame(maxWidth: .infinity, alignment: .center)
                        } else {
                            DocumentView(viewModel: DocumentViewModel(from: matchedMetadata))
                                .padding(.vertical)
                                .background(selectedID == matchedMetadata.id ? Color.blue.opacity(0.2) : Color.clear)
                                .onTapGesture {
                                    guard selectedID != matchedMetadata.id else {
                                        selectedID = nil
                                        return
                                    }
                                    selectedID = matchedMetadata.id
                                }
                            Button("Show claim values") {
                                viewModel.getCredentialAction(matchedMetadata.id)
                            }
                            .frame(maxWidth: .infinity, alignment: .center)
                        }
                    }
                }
            }
        }
        if selectedID != nil {
            Button("Send Response") {
                viewModel.sendCredentialAction(selectedID!)
            }
            .buttonStyle(.borderedProminent)
            .clipShape(Capsule())
            .frame(maxWidth: .infinity, alignment: .center)
        }
    }
}

// MARK: PresentCredentialsViewModel

class PresentCredentialsViewModel: ObservableObject {
    @Binding var requestedDocuments: [MobileCredentialRequest]
    @Binding var matchedCredentials: [MobileCredential]
    @Binding var matchedMetadata: [MobileCredentialMetadata]

    var getCredentialAction: (String) -> Void
    var sendCredentialAction: (String) -> Void

    init(
        requestedDocuments: Binding<[MobileCredentialRequest]>,
        matchedCredentials: Binding<[MobileCredential]>,
        matchedMetadata: Binding<[MobileCredentialMetadata]>,
        sendCredentialAction: @escaping (String) -> Void,
        getCredentialAction: @escaping (String) -> Void
    ) {
        self._requestedDocuments = requestedDocuments
        self._matchedCredentials = matchedCredentials
        self._matchedMetadata = matchedMetadata
        self.sendCredentialAction = sendCredentialAction
        self.getCredentialAction = getCredentialAction
    }

    func matchedMobileCredential(id: String) -> MobileCredential? {
        matchedCredentials.first(where: { $0.id == id })
    }
}
