/**
 * Verify mDocs - Step 4: Display Verification Results
 *
 * Import the `MobileCredentialResponse` type from the SDK. This type holds the
 * complete verification results returned after the proximity presentation workflow
 * completes, including:
 * - `credentials`: Array of verified credential presentations, each containing
 *   the docType, claims (organized by namespace), verification result, and any claim errors.
 * - `credentialErrors`: Any top-level errors that occurred during the verification.
 */
import type { MobileCredentialResponse } from "@mattrglobal/mobile-credential-verifier-react-native";
import { Modal, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { styles } from "./styles";

interface VerificationResultsModalProps {
  visible: boolean;
  onClose: () => void;
  verificationResults: MobileCredentialResponse | null;
}

/**
 * Verify mDocs - Step 4: Verification Results Modal
 *
 * This component displays the results of the mDoc verification to the verifier app user.
 * After the proximity presentation workflow completes (QR scan -> BLE session -> request/response),
 * the SDK verifies any mDocs included in the wallet's response and makes the results available
 * via the `MobileCredentialResponse` object.
 *
 * The modal displays:
 * 1. Overall verification status (Verified / Verification Failed) for the first credential.
 * 2. The credential's docType (e.g. "org.iso.18013.5.1.mDL").
 * 3. Received claims organized by namespace, showing claim names and their values.
 * 4. Verification failure details if the credential did not pass verification.
 * 5. Claim errors - claims that were requested but not provided by the holder
 *    (e.g. if the holder's mDoc didn't include a requested field, or the holder
 *    declined consent for certain claims).
 *
 * Props:
 * - `visible` / `onClose`: Control modal visibility.
 * - `verificationResults`: The `MobileCredentialResponse` returned by the SDK.
 */
export function VerificationResultsModal({ visible, onClose, verificationResults }: VerificationResultsModalProps) {
  if (!visible || !verificationResults) return null;

  /**
   * Helper function to render different claim value types as strings.
   * mDoc claims can have various types (string, number, date, array, object, etc.).
   * Arrays and objects are serialized to JSON; all other types use String conversion.
   */
  function renderClaimValue(claim: any): string {
    if (!claim) return "undefined";

    if (claim.type === "array" || claim.type === "object") {
      return JSON.stringify(claim.value);
    }

    return String(claim.value);
  }

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Verification Results</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {verificationResults.credentials && verificationResults.credentials.length > 0 ? (
            <View>
              {/* Verify mDocs - Step 4: Display overall verification status.
                  Shows whether the first credential in the response passed verification.
                  The SDK checks the mDoc's signature against the trusted IACA certificates
                  and validates the entire chain of trust. */}
              <View style={[styles.center, styles.marginBottom]}>
                <Text
                  style={
                    verificationResults.credentials[0].verificationResult?.verified
                      ? styles.verificationSuccess
                      : styles.verificationFailed
                  }
                >
                  {verificationResults.credentials[0].verificationResult?.verified
                    ? "✓ Verified"
                    : "✗ Verification Failed"}
                </Text>
                <Text style={styles.verificationSubtext}>{verificationResults.credentials[0].docType}</Text>
              </View>

              {/* Verify mDocs - Step 4: Display claims organized by namespace.
                  Each mDoc credential contains claims grouped under namespaces
                  (e.g. "org.iso.18013.5.1" for standard mDL fields).
                  The claims shown here correspond to what was requested in the
                  MobileCredentialRequest (family_name, given_name, birth_date). */}
              {verificationResults.credentials.map((credential, credIndex) => (
                <View key={`credential-${credIndex}`}>
                  {/* Claims data - iterate over namespaces and their claims */}
                  {credential.claims &&
                    Object.keys(credential.claims).map((namespace, nsIndex) => (
                      <View key={`namespace-${nsIndex}`} style={styles.marginBottom}>
                        <Text style={styles.cardTitle}>{namespace}</Text>
                        <View style={styles.card}>
                          {credential.claims &&
                            Object.entries(credential.claims[namespace]).map(([key, value], idx) => (
                              <View key={`${namespace}-${key}-${idx}`} style={styles.listItem}>
                                <Text>{key}:</Text>
                                <Text>{renderClaimValue(value)}</Text>
                              </View>
                            ))}
                        </View>
                      </View>
                    ))}

                  {/* Verify mDocs - Step 4: Display verification failure reason.
                      If the mDoc did not pass verification (e.g. untrusted issuer,
                      expired certificate, invalid signature), show the failure type and message. */}
                  {!credential.verificationResult?.verified && credential.verificationResult?.reason && (
                    <View style={styles.card}>
                      <Text style={styles.listItemTitle}>Verification Failed:</Text>
                      <Text>Type: {credential.verificationResult.reason.type}</Text>
                      <Text>Message: {credential.verificationResult.reason.message}</Text>
                    </View>
                  )}

                  {/* Verify mDocs - Step 4: Display claim errors.
                      Claim errors occur when the presentation session completed successfully,
                      but some requested claims were not provided. This can happen when:
                      - The claim is absent from the holder's mDoc.
                      - The holder declined consent to share specific claims.
                      Each error maps a namespace + element identifier to an error code. */}
                  {credential.claimErrors && Object.keys(credential.claimErrors).length > 0 && (
                    <View style={styles.marginBottom}>
                      <Text style={styles.cardTitle}>Claim Errors</Text>
                      <View style={styles.card}>
                        {Object.entries(credential.claimErrors).map(([namespace, errors]) =>
                          Object.entries(errors).map(([elementId, errorCode]) => (
                            <View key={`error-${namespace}-${elementId}`} style={styles.listItem}>
                              <Text>
                                {namespace}.{elementId}:
                              </Text>
                              <Text style={styles.errorColor}>Error: {errorCode}</Text>
                            </View>
                          ))
                        )}
                      </View>
                    </View>
                  )}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.card}>
              <Text style={[styles.centeredText, styles.grayColor]}>No data available</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
