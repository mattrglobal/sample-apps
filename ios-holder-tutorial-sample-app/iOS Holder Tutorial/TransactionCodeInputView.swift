//
//  TransactionCodeInputView.swift
//  iOS Holder Tutorial
//

import SwiftUI

struct TransactionCodeInputView: View {
    var viewModel: ViewModel
    @State private var transactionCode = ""
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        VStack(spacing: 20) {
            Text("Transaction Code Required")
                .font(.title2)
                .fontWeight(.bold)

            Text("Please enter the transaction code to proceed with credential retrieval.")
                .multilineTextAlignment(.center)
                .foregroundColor(.secondary)

            TextField("Enter transaction code", text: $transactionCode)
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .padding(.horizontal)

            HStack(spacing: 20) {
                Button("Cancel") {
                    dismiss()
                }
                .buttonStyle(.bordered)

                Button("Retrieve Credentials") {
                    viewModel.retrieveCredential(transactionCode: transactionCode)
                }
                .buttonStyle(.borderedProminent)
                .disabled(transactionCode.isEmpty)
            }

            Spacer()
        }
        .padding()
        .navigationTitle("Transaction Code")
        .navigationBarBackButtonHidden(false)
    }
}
