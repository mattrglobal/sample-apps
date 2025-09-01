import {
  type TrustedIssuerCertificate,
  addTrustedIssuerCertificates,
  deleteTrustedIssuerCertificate,
  getTrustedIssuerCertificates,
} from "@mattrglobal/mobile-credential-verifier-react-native";
import { useState } from "react";
import { Alert, Modal, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { styles } from "./styles";

interface CertificateManagementModalProps {
  visible: boolean;
  onClose: () => void;
  trustedCertificates: TrustedIssuerCertificate[];
  setTrustedCertificates: React.Dispatch<React.SetStateAction<TrustedIssuerCertificate[]>>;
}

export function CertificateManagementModal({
  visible,
  onClose,
  trustedCertificates,
  setTrustedCertificates,
}: CertificateManagementModalProps) {
  // Manage Certificates - Step 2.1: Add certificates and certificate input variables
  const [certificateData, setCertificateData] = useState("");

  // Sample certificate for testing purposes - automatically loaded
  // montcliff-dmv.mattrlabs.com IACA
  const sampleCertificate = `MIICYzCCAgmgAwIBAgIKXhjLoCkLWBxREDAKBggqhkjOPQQDAjA4MQswCQYDVQQG
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
`;

  // Manage Certificates - Step 2.1: Create addCertificate function
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

      // Reload certificates after adding
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

  // Manage Certificates - Step 2.4: Create removeCertificate function
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
          {/* Manage Certificates - Step 2.2: Create input for adding certificates */}
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
                onPress={() => setCertificateData(sampleCertificate)}
              >
                <Text style={[styles.buttonText, styles.secondaryButtonText]}>Load Example</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Trusted Certificates ({trustedCertificates.length})</Text>

            {/* Manage Certificates - Step 2.3: Display retrieved certificates */}
            {trustedCertificates.map((certificate: TrustedIssuerCertificate) => (
              <View key={certificate.id} style={styles.listItem}>
                <View style={styles.listItemContent}>
                  <Text style={styles.listItemTitle}>{certificate.commonName}</Text>
                  <Text style={[styles.smallText, styles.grayColor]}>ID: {certificate.id.substring(0, 20)}...</Text>
                </View>

                {/* Manage Certificates - Step 2.5: Remove certificate button */}
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
