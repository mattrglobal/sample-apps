/**
 * Manage Certificates - Import SDK certificate management functions.
 *
 * Every mDoc is signed by a chain of trust. For the verifier app to validate a
 * presented mDoc, it must check the root IACA (Issuing Authority Certificate Authority)
 * certificate against a list of trusted issuers.
 *
 * These SDK functions enable the app to:
 * - `addTrustedIssuerCertificates`: Store a new IACA certificate as trusted.
 * - `deleteTrustedIssuerCertificate`: Remove a previously trusted certificate.
 * - `getTrustedIssuerCertificates`: Retrieve all currently stored trusted certificates.
 */
import {
  type TrustedIssuerCertificate,
  addTrustedIssuerCertificates,
  deleteTrustedIssuerCertificate,
  getTrustedIssuerCertificates,
} from "@mattrglobal/mobile-credential-verifier-react-native";
import { useState } from "react";
import { Alert, Modal, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { MONTCLIFF_DMV_IACA } from "./certificates";
import { styles } from "./styles";

interface CertificateManagementModalProps {
  visible: boolean;
  onClose: () => void;
  trustedCertificates: TrustedIssuerCertificate[];
  setTrustedCertificates: React.Dispatch<React.SetStateAction<TrustedIssuerCertificate[]>>;
}

/**
 * Manage Certificates - Step 1: Certificate Management Modal
 *
 * This component provides the UI for managing trusted IACA certificates.
 * It enables the verifier app user to:
 * - View currently stored trusted certificates.
 * - Add a new certificate by pasting its Base64-encoded data.
 * - Load a sample IACA certificate (Montcliff DMV) for testing the tutorial.
 * - Remove individual trusted certificates.
 *
 * These certificates are essential for the verification workflow: the SDK uses them
 * to validate that a presented mDoc was issued by a trusted authority.
 *
 * Props:
 * - `visible` / `onClose`: Control the modal visibility.
 * - `trustedCertificates` / `setTrustedCertificates`: Shared state with App.tsx
 *    so the main screen can reflect the current certificate count and enable/disable
 *    the "Scan QR Code" button accordingly.
 */
export function CertificateManagementModal({
  visible,
  onClose,
  trustedCertificates,
  setTrustedCertificates,
}: CertificateManagementModalProps) {
  // Manage Certificates - Step 2.1: Add certificates and certificate input variables
  // Holds the Base64-encoded certificate data entered by the user in the text input field.
  const [certificateData, setCertificateData] = useState("");

  /**
   * Manage Certificates - Step 2.1: Create addCertificate function
   *
   * Calls the SDK's `addTrustedIssuerCertificates` to store a new IACA certificate.
   * The certificate data is provided as a Base64-encoded string.
   * After adding, reloads the certificate list to reflect the change.
   */
  const addCertificate = async () => {
    if (!certificateData.trim()) {
      Alert.alert("Error", "Please enter certificate data");
      return;
    }

    try {
      // Add trusted issuer certificate
      const result = await addTrustedIssuerCertificates([certificateData]);

      if (result.isErr()) {
        throw new Error(result.error.message);
      }

      // Reload certificates from SDK storage after adding, so the UI displays the updated list.
      const certificates = await getTrustedIssuerCertificates();
      if (certificates.length > 0) {
        setTrustedCertificates(certificates);
      }

      // Clear input fields
      setCertificateData("");

      Alert.alert("Success", "Certificate added successfully");
    } catch (error) {
      console.error("Error adding certificate:", error);
      Alert.alert("Error", "Failed to add certificate");
    }
  };

  /**
   * Manage Certificates - Step 2.4: Create removeCertificate function
   *
   * Calls the SDK's `deleteTrustedIssuerCertificate` to remove a certificate by ID.
   * Then updates the local state to reflect the removal in the UI.
   * After removal, if no certificates remain, the "Scan QR Code" button in App.tsx
   * will be disabled since verification requires at least one trusted certificate.
   */
  const removeCertificate = async (id: string) => {
    try {
      await deleteTrustedIssuerCertificate(id);
      setTrustedCertificates(
        trustedCertificates.filter((certificate: TrustedIssuerCertificate) => certificate.id !== id)
      );
      Alert.alert("Success", "Certificate removed successfully");
    } catch (error) {
      console.error("Error removing certificate:", error);
      Alert.alert("Error", "Failed to remove certificate");
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Certificate Management</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Manage Certificates - Step 2.2: Create input for adding certificates
              Provides a text input for pasting Base64-encoded IACA certificate data,
              an "Add Certificate" button to store it, and a "Load Example" button
              that pre-fills the Montcliff DMV IACA certificate used in the tutorial. */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Add New Certificate</Text>

            <Text style={[styles.smallText, styles.grayColor]}>Certificate Data (Base64)</Text>
            <TextInput
              spellCheck={false}
              style={[styles.formField, styles.expandingInput]}
              multiline
              placeholder="Paste certificate data here..."
              value={certificateData}
              onChangeText={setCertificateData}
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.button} onPress={addCertificate}>
                <Text style={styles.buttonText}>Add Certificate</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={() => setCertificateData(MONTCLIFF_DMV_IACA)}
              >
                <Text style={[styles.buttonText, styles.secondaryButtonText]}>Load Example</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Trusted Certificates ({trustedCertificates.length})</Text>

            {/* Manage Certificates - Step 2.3: Display retrieved certificates
                Iterates over the stored trusted certificates and renders each one
                with its common name and truncated ID. Each entry includes a "Remove"
                button to delete the certificate from the SDK's trusted store. */}
            {trustedCertificates.map((certificate: TrustedIssuerCertificate) => (
              <View key={certificate.id} style={styles.listItem}>
                <View style={styles.listItemContent}>
                  <Text style={styles.listItemTitle}>{certificate.commonName}</Text>
                  <Text style={[styles.smallText, styles.grayColor]}>ID: {certificate.id.substring(0, 20)}...</Text>
                </View>

                {/* Manage Certificates - Step 2.5: Remove certificate button
                    Calls removeCertificate() with the certificate ID to delete it
                    from the SDK's trusted store and update the UI. */}
                <TouchableOpacity style={styles.dangerButton} onPress={() => removeCertificate(certificate.id)}>
                  <Text style={styles.buttonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
