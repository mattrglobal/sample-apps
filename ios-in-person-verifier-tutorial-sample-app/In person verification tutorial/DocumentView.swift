import MobileCredentialVerifierSDK
import SwiftUI

// MARK: - Section: Verify mDocs - Step 4: Display verification results
// After the proximity presentation exchange completes, this view displays the verification
// results for a single received mDoc credential. It shows:
// - The document type (e.g. org.iso.18013.5.1.mDL)
// - The overall verification status (Verified/Invalid) with color coding
// - Any verification failure reason
// - All received claims organized by namespace (e.g. family_name, given_name, birth_date)
// - Any failed claims (claims that were requested but not provided by the holder)
struct DocumentView: View {
    var viewModel: DocumentViewModel
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(viewModel.docType)
                .font(.title)
                .fontWeight(.bold)
                .padding(.bottom, 5)
            
            Text(viewModel.verificationResult)
                .font(.title)
                .fontWeight(.bold)
                .foregroundStyle(viewModel.verificationFailedReason == nil ? .green : .red)
                .padding(.bottom, 5)
            
            if let verificationFailedReason = viewModel.verificationFailedReason {
                Text(verificationFailedReason)
                    .font(.title3)
                    .fontWeight(.bold)
                    .foregroundStyle(.red)
                    .padding(.bottom, 5)
            }
            
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
            
            if !viewModel.claimErrors.isEmpty {
                Text("Failed Claims:")
                    .font(.headline)
                    .padding(.vertical, 5)
                
                ForEach(viewModel.claimErrors.keys.sorted(), id: \.self) { key in
                    VStack(alignment: .leading, spacing: 5) {
                        Text(key)
                            .font(.headline)
                            .padding(.vertical, 5)
                            .padding(.horizontal, 10)
                            .background(Color.gray.opacity(0.2))
                            .cornerRadius(5)
                        
                        ForEach(viewModel.claimErrors[key]!.keys.sorted(), id: \.self) { claim in
                            HStack {
                                Text(claim)
                                    .fontWeight(.semibold)
                                Spacer()
                                Text(viewModel.claimErrors[key]![claim]! ?? "")
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
        }
        .padding()
        .background(RoundedRectangle(cornerRadius: 10).fill(Color.white).shadow(radius: 5))
        .padding(.horizontal)
    }
}

// MARK: - DocumentViewModel
// Transforms a MobileCredentialPresentation (SDK response object) into display-friendly strings.
// The MobileCredentialPresentation contains:
// - docType: The credential type that was presented.
// - verificationResult: Whether the credential passed verification and any failure reason.
// - claims: Successfully received and verified claim values, organized by namespace.
// - claimErrors: Claims that were requested but couldn't be provided.
@Observable
class DocumentViewModel {
    let docType: String
    let namespacesAndClaims: [String: [String: String?]]
    let claimErrors: [String: [String: String?]]
    let verificationResult: String
    let verificationFailedReason: String?
    
    init(from presentation: MobileCredentialPresentation) {
        self.docType = presentation.docType
        self.verificationResult = presentation.verificationResult.verified ? "Verified" : "Invalid"
        // From v6.0.0, the failure detail is exposed via `failureType` (was `reason`).
        self.verificationFailedReason = presentation.verificationResult.failureType?.message
        
        self.namespacesAndClaims = presentation.claims?.reduce(into: [String: [String: String]]()) { result, outerElement in
            let (outerKey, innerDict) = outerElement
            result[outerKey] = innerDict.mapValues { $0.textRepresentation }
        } ?? [:]
        
        self.claimErrors = presentation.claimErrors?.reduce(into: [String: [String: String]]()) { result, outerElement in
            let (outerKey, innerDict) = outerElement
            result[outerKey] = innerDict.mapValues { "\($0)" }
        } ?? [:]
    }
}

// MARK: - Helper: MobileCredentialElementValue text conversion
// Extension that converts SDK claim values (MobileCredentialElementValue) into human-readable
// strings for display. Claim values can be various types (bool, string, int, date, binary data,
// nested maps, arrays, etc.) and each needs appropriate formatting.
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
