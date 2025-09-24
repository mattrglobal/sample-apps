import type { MobileCredentialResponse } from "@mattrglobal/mobile-credential-verifier-react-native";
import { Modal, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { styles } from "./styles";

interface VerificationResultsModalProps {
  visible: boolean;
  onClose: () => void;
  verificationResults: MobileCredentialResponse | null;
}

export function VerificationResultsModal({ visible, onClose, verificationResults }: VerificationResultsModalProps) {
  if (!visible || !verificationResults) return null;

  // Helper function to render different claim value types
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
              {/* Basic verification status */}
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

              {/* Display the raw credential data */}
              {verificationResults.credentials.map((credential, credIndex) => (
                <View key={`credential-${credIndex}`}>
                  {/* Claims data */}
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

                  {/* Error information */}
                  {!credential.verificationResult?.verified && credential.verificationResult?.reason && (
                    <View style={styles.card}>
                      <Text style={styles.listItemTitle}>Verification Failed:</Text>
                      <Text>Type: {credential.verificationResult.reason.type}</Text>
                      <Text>Message: {credential.verificationResult.reason.message}</Text>
                    </View>
                  )}

                  {/* Claim errors if any */}
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
