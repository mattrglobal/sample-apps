/**
 * Initialize SDK - Step 1.1: Import MobileCredentialVerifierSDK
 *
 * Import the required functions and types from the MATTR Mobile Credential Verifier SDK.
 * These are used throughout the app to:
 * - `initialize`: Initialize the SDK so the app can use its functions and classes.
 * - `createProximityPresentationSession`: Establish a BLE session with a holder's wallet after scanning their QR code.
 * - `sendProximityPresentationRequest`: Send a presentation request to the wallet and receive a verified response.
 * - `terminateProximityPresentationSession`: Clean up the session after verification is complete.
 * - `getTrustedIssuerCertificates` / `addTrustedIssuerCertificates`: Manage trusted IACA certificates for verifying mDoc issuers.
 */
import {
	type MobileCredentialResponse,
	addTrustedIssuerCertificates,
	createProximityPresentationSession,
	getTrustedIssuerCertificates,
	initialize,
	sendProximityPresentationRequest,
	terminateProximityPresentationSession,
} from "@mattrglobal/mobile-credential-verifier-react-native";
import { useCameraPermissions } from "expo-camera";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	SafeAreaView,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
// Import the modal components that implement each tutorial capability:
// - QRScannerModal: Scan a QR code presented by a holder wallet (Tutorial: "Verify mDocs - Step 1")
// - VerificationResultsModal: Display verification results (Tutorial: "Verify mDocs - Step 2")
import { MONTCLIFF_DMV_IACA } from "./certificates";
import { QRScannerModal } from "./QRScannerModal";
import { VerificationResultsModal } from "./VerificationResultsModal";
import { styles } from "./styles";

/**
 * Main App component - serves as the entry point and orchestrator for the mDocs Verifier tutorial.
 *
 * This component implements the following tutorial capabilities:
 * 1. Initialize the SDK so the app can use its functions and classes.
 * 2. Register the trusted IACA certificate used to verify mDocs issued by the tutorial issuer.
 * 3. Scan a QR code presented by a wallet app and establish a secure BLE communication channel.
 * 4. Send presentation requests to the wallet, receive a response, and verify its content.
 * 5. Display the verification results to the verifier app user.
 */
export default function App() {
	// Initialize SDK - Step 1.2: Add state variables for SDK and loading
	// Track whether the SDK has been successfully initialized, and display loading state to the user.
	const [isSDKInitialized, setIsSDKInitialized] = useState(false);
	const [loadingMessage, setLoadingMessage] = useState<string | false>(false);

	// Verify mDocs - Step 1.2: Create receivedDocuments variable
	// Stores the MobileCredentialResponse returned by the SDK after verifying the mDoc(s)
	// included in the wallet's proximity presentation response.
	const [verificationResults, setVerificationResults] =
		useState<MobileCredentialResponse | null>(null);

	// Modal states for navigation between the two main screens:
	// 1. QR Scanner - scan a QR code presented by a holder's wallet app
	// 2. Verification Results - display the outcome of the mDoc verification
	const [isScanning, setIsScanning] = useState(false);
	const [showVerificationResults, setShowVerificationResults] = useState(false);

	// Camera permissions are required for QR code scanning (Bluetooth proximity workflow)
	const [permission, requestPermission] = useCameraPermissions();

	/**
	 * Initialize SDK - Step 2.1: Initialize the SDK
	 *
	 * This runs once on app launch and performs two actions:
	 * 1. Calls `initialize()` to set up the MobileCredentialVerifier SDK so the app
	 *    can use its functions and classes for proximity verification.
	 * 2. On first launch (no certificates stored yet), registers the sample Montcliff
	 *    DMV IACA certificate so the app is ready to verify the tutorial mDoc out of
	 *    the box. Every mDoc is signed by a chain of trust, so the SDK needs at least
	 *    one trusted root IACA certificate to validate a presented mDoc.
	 */
	useEffect(() => {
		const initializeSDK = async () => {
			try {
				setLoadingMessage("Initializing SDK...");
				const result = await initialize();
				if (result.isErr()) {
					console.error("Failed to initialize SDK:", result.error);
					Alert.alert("Error", "Failed to initialize the verifier SDK");
					return;
				}
				setIsSDKInitialized(true);

				// Setup certificates - Step 1: Register the trusted IACA certificate on first launch.
				setLoadingMessage("Loading certificates...");
				const certificates = await getTrustedIssuerCertificates();
				if (certificates.length === 0) {
					await addTrustedIssuerCertificates([MONTCLIFF_DMV_IACA]);
				}
			} catch (error) {
				console.error("Failed to initialize SDK:", error);
				Alert.alert(
					"Error",
					`Failed to initialize the verifier SDK: ${error instanceof Error ? error.message : String(error)}`,
				);
			} finally {
				setLoadingMessage(false);
			}
		};

		initializeSDK();
	}, []);

	/**
	 * Verify mDocs - Step 3.2: Create setupProximityPresentationSession
	 *
	 * This function is called when the QR Scanner successfully scans a holder's QR code.
	 * It implements the core proximity presentation workflow as per ISO/IEC 18013-5:2021:
	 *
	 * 1. Calls `createProximityPresentationSession` with the device engagement string from
	 *    the QR code to establish a secure BLE connection between verifier and holder devices.
	 * 2. Once the session is established (`onEstablished` callback), sends a presentation
	 *    request specifying the required mDoc claims (family_name, given_name, birth_date).
	 * 3. The holder's wallet displays the request and asks for consent to share the data.
	 * 4. Upon receiving the response, the SDK verifies the mDoc and stores the results.
	 * 5. The session is terminated and verification results are displayed to the user.
	 */
	const handleQRCodeDetected = async (qrData: string) => {
		try {
			setLoadingMessage("Establishing secure connection...");

			await createProximityPresentationSession({
				deviceEngagement: qrData,
				onEstablished: async () => {
					console.log("Session established successfully");
					setLoadingMessage("Requesting verification data...");
					try {
						// Verify mDocs - Step 1.1: Create MobileCredentialRequest instance
						// Define a presentation request for an mDL (mobile driver's license).
						// - docType: the requested credential type (org.iso.18013.5.1.mDL)
						// - namespaces: the requested namespace (org.iso.18013.5.1) and claims
						// - Each claim value (false) indicates the verifier does NOT intend to retain/persist the data
						// The presented mDoc must include these claims under this exact namespace for verification to succeed.
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
							throw new Error(
								`Failed to verify presentation: ${response.error.message}`,
							);
						}

						// Store the verification results and display them to the verifier app user.
						// The SDK has already verified the mDoc(s) in the response - results include
						// the verification status, received claims, and any claim errors.
						setLoadingMessage("Verifying credentials...");
						setVerificationResults(response.value);
						setShowVerificationResults(true);
						// Terminate the BLE proximity presentation session after receiving the response.
						await terminateProximityPresentationSession();
					} catch (error) {
						console.error("Error during presentation request:", error);
						Alert.alert("Error", "Failed to verify mDocs");
						await terminateProximityPresentationSession();
					} finally {
						setLoadingMessage(false);
					}
				},
				// Called when the proximity presentation session is terminated (e.g. after completion
				// or if the holder disconnects).
				onTerminated: () => {
					console.log("Session terminated");
					setLoadingMessage(false);
				},
				// Called when an error occurs during the session (e.g. Bluetooth connection
				// interrupted between the holder and verifier devices).
				onError: (error) => {
					console.error("Session error:", JSON.stringify(error, null, 2));
					Alert.alert(
						"Error",
						`Session failed: ${error.message || JSON.stringify(error)}`,
					);
					setLoadingMessage(false);
				},
			});

			console.log(
				"createProximityPresentationSession call completed (waiting for callbacks)",
			);
		} catch (error) {
			console.error("Error during QR code processing:", error);
			Alert.alert(
				"Error",
				`Failed to process QR code: ${error instanceof Error ? error.message : String(error)}`,
			);
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
							style={[
								styles.button,
								!isSDKInitialized && styles.buttonDisabled,
							]}
							onPress={() => setIsScanning(true)}
							disabled={!isSDKInitialized}
						>
							<Text style={styles.buttonText}>Scan QR Code</Text>
						</TouchableOpacity>
					</View>

					{!isSDKInitialized && (
						<Text style={styles.errorText}>
							SDK not initialized. Please restart the app.
						</Text>
					)}
				</View>
			)}

			{/* Verify mDocs - Step 1.2: Create QRScannerView
			    This modal provides the QR code scanning capability. In the ISO 18013-5 proximity
			    workflow, the holder presents a QR code that encodes a device engagement string.
			    The verifier scans this QR code to initiate the engagement phase and establish
			    a secure BLE communication channel with the holder's wallet app. */}
			<QRScannerModal
				visible={isScanning}
				onClose={() => setIsScanning(false)}
				permission={permission}
				requestPermission={requestPermission}
				onQRCodeDetected={handleQRCodeDetected}
			/>

			{/* Verify mDocs - Step 4.2: Create PresentationResponseView
			    This modal displays the verification results after the proximity presentation
			    workflow completes. It shows each received claim, the verification status
			    (verified/failed), and any claim errors (e.g. missing claims). */}
			<VerificationResultsModal
				visible={showVerificationResults}
				onClose={() => setShowVerificationResults(false)}
				verificationResults={verificationResults}
			/>
		</SafeAreaView>
	);
}
