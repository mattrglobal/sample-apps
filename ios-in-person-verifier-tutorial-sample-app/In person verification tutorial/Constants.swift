// MARK: - Constants
// Contains the pre-configured IACA (Issuing Authority Certificate Authority) root certificate
// for the Montcliff DMV test issuer (montcliff-dmv.mattrlabs.com).
// This PEM-encoded certificate is used during SDK initialization to automatically trust mDocs
// issued by this test issuer. Users can also add/remove certificates at runtime via the
// Certificate Management screen.
//
// In a production app, you would manage these certificates dynamically rather than hardcoding them.
import Foundation

enum Constants {
    // From iOS Verifier SDK v6.0.0, the SDK is tethered to a MATTR VII tenant. Replace these with
    // your tenant host and the Verifier Application `id` created on that tenant.
    static let tenantHost = URL(string: "https://your-tenant.vii.mattr.global")!
    static let applicationId = "<YOUR_VERIFIER_APPLICATION_ID>"

    static let montcliffPEM =
"""
    MIICYzCCAgmgAwIBAgIKXhjLoCkLWBxREDAKBggqhkjOPQQDAjA4MQswCQYDVQQG
    EwJBVTEpMCcGA1UEAwwgbW9udGNsaWZmLWRtdi5tYXR0cmxhYnMuY29tIElBQ0Ew
    HhcNMjQwMTE4MjMxNDE4WhcNMzQwMTE1MjMxNDE4WjA4MQswCQYDVQQGEwJBVTEp
    MCcGA1UEAwwgbW9udGNsaWZmLWRtdi5tYXR0cmxhYnMuY29tIElBQ0EwWTATBgcq
    hkjOPQIBBggqhkjOPQMBBwNCAASBnqobOh8baMW7mpSZaQMawj6wgM5e5nPd6HXp
    dB8eUVPlCMKribQ7XiiLU96rib/yQLH2k1CUeZmEjxoEi42xo4H6MIH3MBIGA1Ud
    EwEB/wQIMAYBAf8CAQAwDgYDVR0PAQH/BAQDAgEGMB0GA1UdDgQWBBRFZwEOI9yq
    232NG+OzNQzFKa/LxDAuBgNVHRIEJzAlhiNodHRwczovL21vbnRjbGlmZi1kbXYu
    bWF0dHJsYWJzLmNvbTCBgQYDVR0fBHoweDB2oHSgcoZwaHR0cHM6Ly9tb250Y2xp
    ZmYtZG12LnZpaS5hdTAxLm1hdHRyLmdsb2JhbC92Mi9jcmVkZW50aWFscy9tb2Jp
    bGUvaWFjYXMvMjk0YmExYmMtOTFhMS00MjJmLThhMTctY2IwODU0NWY0ODYwL2Ny
    bDAKBggqhkjOPQQDAgNIADBFAiAlZYQP95lGzVJfCykhcpCzpQ2LWE/AbjTGkcGI
    SNsu7gIhAJfP54a2hXz4YiQN4qJERlORjyL1Ru9M0/dtQppohFm6
"""
}
