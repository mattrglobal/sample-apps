//
//  DocumentView.swift
//  iOS Holder Tutorial
//

import MobileCredentialHolderSDK
import SwiftUI

    struct DocumentView: View {

        var viewModel: DocumentViewModel

        var body: some View {
            VStack(alignment: .leading, spacing: 10) {
                Text(viewModel.docType)
                    .font(.title)
                    .fontWeight(.bold)
                    .padding(.bottom, 5)

                ForEach(viewModel.namespacesAndClaims.keys.sorted(), id: \.self) { key in
                    VStack(alignment: .leading, spacing: 5) {
                        Text(key)
                            .font(.headline)
                            .padding(.vertical, 5)
                            .padding(.horizontal, 10)
                            .background(Color.gray.opacity(0.2))
                            .cornerRadius(5)

                        ForEach(viewModel.namespacesAndClaims[key]!.keys.sorted(), id: \.self) { claim in
                            HStack {
                                Text(claim)
                                    .fontWeight(.semibold)
                                Spacer()
                                Text(viewModel.namespacesAndClaims[key]![claim]! ?? "")
                                    .fontWeight(.regular)
                            }
                            .padding(.vertical, 5)
                            .padding(.horizontal, 10)
                            .background(Color.white)
                            .cornerRadius(5)
                            .shadow(radius: 1)
                        }
                    }
                    .padding(.vertical, 5)
                }
            }
            .padding()
            .background(RoundedRectangle(cornerRadius: 10).fill(Color.white).shadow(radius: 5))
            .padding(.horizontal)
        }
    }

    // MARK: DocumentViewModel

    class DocumentViewModel {
        var docType: String

        var namespacesAndClaims: [String: [String: String?]]

        init(from credential: MobileCredential) {
            self.docType = credential.docType
            self.namespacesAndClaims = credential.claims.reduce(into: [String: [String: String]]()) { result, outerElement in
                let (outerKey, innerDict) = outerElement
                result[outerKey] = innerDict.mapValues { $0.textRepresentation }
            }
        }

        init(from credentialMetadata: MobileCredentialMetadata) {
            self.docType = credentialMetadata.docType
            var result: [String: [String: String?]] = [:]
            credentialMetadata.claims.forEach { namespace, claimIDs in
                var transformedClaims: [String: String?] = [:]
                claimIDs.forEach { claimID in
                    transformedClaims[claimID] = Optional<String>.none
                }
                result[namespace] = transformedClaims
            }
            self.namespacesAndClaims = result
        }

        init(from request: MobileCredentialRequest) {
            self.docType = request.docType
            self.namespacesAndClaims = request.namespaces.reduce(into: [String: [String: String?]]()) { result, outerElement in
                let (outerKey, innerDict) = outerElement
                result[outerKey] = innerDict.mapValues { _ in nil }
            }
        }
    }

    // MARK: Helper
    extension MobileCredentialElementValue {
        var textRepresentation: String {
            switch self {
            case .bool(let bool):
                return "\(bool)"
            case .string(let string):
                return string
            case .int(let int):
                return "\(int)"
            case .unsigned(let uInt):
                return "\(uInt)"
            case .float(let float):
                return "\(float)"
            case .double(let double):
                return "\(double)"
            case let .date(date):
                let dateFormatter = DateFormatter()
                dateFormatter.dateStyle = .short
                dateFormatter.timeStyle = .none
                return dateFormatter.string(from: date)
            case let .dateTime(date):
                let dateFormatter = DateFormatter()
                dateFormatter.dateStyle = .short
                dateFormatter.timeStyle = .short
                return dateFormatter.string(from: date)
            case .data(let data):
                return "Data \(data.count) bytes"
            case .map(let dictionary):
                let result = dictionary.mapValues { value in
                    value.textRepresentation
                }
                return "\(result)"
            case .array(let array):
                return array.reduce("") { partialResult, element in
                    partialResult + element.textRepresentation
                }
                .appending("")
            @unknown default:
                return "Unknown type"
            }
        }
    }
