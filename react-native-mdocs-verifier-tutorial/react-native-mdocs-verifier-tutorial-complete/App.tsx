// Initialize SDK - Step 1.1: Import MobileCredentialVerifierSDK
import {
  type MobileCredentialResponse,
  type TrustedIssuerCertificate,
  createProximityPresentationSession,
  getTrustedIssuerCertificates,
  initialise,
  sendProximityPresentationRequest,
  terminateProximityPresentationSession,
} from "@mattrglobal/mobile-credential-verifier-react-native";
import { useCameraPermissions } from "expo-camera";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import { CertificateManagementModal } from "./CertificateManagementModal";
import { QRScannerModal } from "./QRScannerModal";
import { VerificationResultsModal } from "./VerificationResultsModal";
import { styles } from "./styles";

export default function App() {
  // Initialize SDK - Step 1.2: Add state variables for SDK and loading
  const [isSDKInitialized, setIsSDKInitialized] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | false>(false);

  // Manage Certificates - Step 1.1: Add certificates state variable
  const [trustedCertificates, setTrustedCertificates] = useState<TrustedIssuerCertificate[]>([]);

  // Verify mDocs - Step 1.2: Create receivedDocuments variable
  const [verificationResults, setVerificationResults] = useState<MobileCredentialResponse | null>(null);

  // Modal states for navigation
  const [showCertificateManagement, setShowCertificateManagement] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [showVerificationResults, setShowVerificationResults] = useState(false);

  const [permission, requestPermission] = useCameraPermissions();

  // Initialize SDK - Step 2.1: Initialize the SDK
  useEffect(() => {
    const initializeSDK = async () => {
      try {
        setLoadingMessage("Initializing SDK...");
        await initialise();
        setIsSDKInitialized(true);

        setLoadingMessage("Loading certificates...");
        const certificates = await getTrustedIssuerCertificates();
        if (certificates) {
          setTrustedCertificates(certificates);
        }
      } catch (error) {
        console.error("Failed to initialize SDK:", error);
        Alert.alert("Error", "Failed to initialize the verifier SDK");
      } finally {
        setLoadingMessage(false);
      }
    };

    initializeSDK();
  }, []);

  // Verify mDocs - Step 3.2: Create setupProximityPresentationSession
  const handleQRCodeDetected = async (qrData: string) => {
    try {
      setIsScanning(false);
      setLoadingMessage("Establishing secure connection...");

      await createProximityPresentationSession({
        deviceEngagement: qrData,
        onEstablished: async () => {
          console.log("Session established");
          setLoadingMessage("Requesting verification data...");
          try {
            const response = await sendProximityPresentationRequest({
              mobileCredentialRequests: [
                {
                  docType: "org.iso.18013.5.1.mDL",
                  namespaces: {
                    "org.iso.18013.5.1": {
                      family_name: false,
                      given_name: false,
                      birth_date: false,
                    },
                  },
                },
              ],
            });

            if (response.isErr()) {
              throw new Error(`Failed to verify presentation: ${response.error.message}`);
            }

            setLoadingMessage("Verifying credentials...");
            setVerificationResults(response.value);
            setShowVerificationResults(true);
            await terminateProximityPresentationSession();
          } catch (error) {
            console.error("Error during presentation request:", error);
            Alert.alert("Error", "Failed to verify mDocs");
            await terminateProximityPresentationSession();
          } finally {
            setLoadingMessage(false);
          }
        },
        onTerminated: () => {
          console.log("Session terminated");
          setLoadingMessage(false);
        },
        onError: (error) => {
          console.error("Session error:", error);
          Alert.alert("Error", "Session failed to establish");
          setLoadingMessage(false);
        },
      });
    } catch (error) {
      console.error("Error during QR code processing:", error);
      Alert.alert("Error", "Failed to process QR code");
      setLoadingMessage(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <Text style={styles.title}>mDocs Verifier</Text>
      </View>

      {loadingMessage ? (
        <View style={[styles.content, styles.center]}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>{loadingMessage}</Text>
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, !isSDKInitialized && styles.buttonDisabled]}
              onPress={() => setShowCertificateManagement(true)}
              disabled={!isSDKInitialized}
            >
              <Text style={styles.buttonText}>Certificate Management</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, (!isSDKInitialized || trustedCertificates.length === 0) && styles.buttonDisabled]}
              onPress={() => setIsScanning(true)}
              disabled={!isSDKInitialized || trustedCertificates.length === 0}
            >
              <Text style={styles.buttonText}>Scan QR Code</Text>
            </TouchableOpacity>
          </View>

          {!isSDKInitialized && <Text style={styles.errorText}>SDK not initialized. Please restart the app.</Text>}
          {isSDKInitialized && trustedCertificates.length === 0 && (
            <Text style={styles.errorText}>
              No trusted issuer certificates added. Add certificates to verify mDocs.
            </Text>
          )}
        </View>
      )}

      {/* Manage Certificates - Step 2.6: Create CertificateManagementView */}
      <CertificateManagementModal
        visible={showCertificateManagement}
        onClose={() => setShowCertificateManagement(false)}
        trustedCertificates={trustedCertificates}
        setTrustedCertificates={setTrustedCertificates}
      />

      {/* Verify mDocs - Step 1.2: Create QRScannerView */}
      <QRScannerModal
        visible={isScanning}
        onClose={() => setIsScanning(false)}
        permission={permission}
        requestPermission={requestPermission}
        onQRCodeDetected={handleQRCodeDetected}
      />

      {/* Verify mDocs - Step 4.2: Create PresentationResponseView */}
      <VerificationResultsModal
        visible={showVerificationResults}
        onClose={() => setShowVerificationResults(false)}
        verificationResults={verificationResults}
      />
    </SafeAreaView>
  );
}
