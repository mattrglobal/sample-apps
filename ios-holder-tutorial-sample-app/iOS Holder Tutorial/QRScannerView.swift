//
//  QRScannerView.swift
//  iOS Holder Tutorial
//

    import SwiftUI
    import CodeScanner
    import AVFoundation

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
