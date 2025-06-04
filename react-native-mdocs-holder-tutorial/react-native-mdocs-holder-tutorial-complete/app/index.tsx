// The Index component displays the list of credentials and enables claiming new credentials using a QR code scanner.
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
	ActivityIndicator,
	Modal,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

import CredentialsList from "@/components/CredentialsList";
// Claim a Credential - Step 2.3: Import the QRCodeScanner component
import QRCodeScanner from "@/components/QRCodeScanner";
import { useHolder } from "@/providers/HolderProvider";

export default function Index() {
	const router = useRouter();
	const {
		isHolderInitialised,
		error,
		isLoading,
		mobileCredentials,
		deleteMobileCredential,
	} = useHolder();
	const [isScannerVisible, setIsScannerVisible] = useState(false);

	// Claim a Credential - Step 2.4: Define the handleScanComplete function
	const handleScanComplete = (scannedValue: string) => {
		setIsScannerVisible(false);
		if (!scannedValue) return;

		if (scannedValue.startsWith("openid-credential-offer://")) {
			router.push({
				pathname: "/claim-credential",
				params: { scannedValue },
			});
		}
		// Online Presentation - Step 2.2: Handle the 'mdoc-openid4vp://' scheme prefix
		else if (scannedValue.startsWith("mdoc-openid4vp://")) {
			router.replace({
				pathname: "/online-presentation",
				params: { scannedValue },
			});
		}
	};

	if (isLoading) {
		return (
			<View style={styles.centered}>
				<ActivityIndicator size="large" color="#0000ff" />
				<Text>Loading...</Text>
			</View>
		);
	}

	if (error) {
		return (
			<View style={styles.centered}>
				<Text>Error: {error}</Text>
				<Text>Restart the app.</Text>
			</View>
		);
	}

	if (!isHolderInitialised) {
		return (
			<View style={styles.centered}>
				<Text>No holder instance</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<Text style={styles.headerText}>Welcome to the mDoc Holder App</Text>
			{/* UI to enable the QR code scanner */}
			<View style={styles.buttonContainer}>
				<TouchableOpacity
					style={styles.button}
					onPress={() => setIsScannerVisible(true)}
				>
					<Text style={styles.buttonText}>Claim Credential</Text>
				</TouchableOpacity>
				{/* Proximity Presentation - Step 1.5: Add Proximity Presentation button */}
				<TouchableOpacity
					style={styles.button}
					onPress={() => router.replace("/proximity-presentation")}
				>
					<Text style={styles.buttonText}>Proximity Presentation</Text>
				</TouchableOpacity>
				{/* Online Presentation - Step 2.7: Add Online Presentation button */}
				<TouchableOpacity
					style={styles.button}
					onPress={() => setIsScannerVisible(true)}
				>
					<Text style={styles.buttonText}>Online Presentation</Text>
				</TouchableOpacity>
			</View>
			{/*  Display the list of credentials and their metadata */}
			<CredentialsList
				mobileCredentials={mobileCredentials}
				deleteMobileCredential={deleteMobileCredential}
			/>
			{/*  Modal to display the QR code scanner */}
			{/* Claim a Credential - Step 2.5: Add the QRCodeScanner component */}
			<Modal
				visible={isScannerVisible}
				animationType="slide"
				onRequestClose={() => setIsScannerVisible(false)}
			>
				<View style={styles.modalContainer}>
					<QRCodeScanner onScanComplete={handleScanComplete} />
					<TouchableOpacity
						style={[styles.button, styles.closeButton]}
						onPress={() => setIsScannerVisible(false)}
					>
						<Text style={styles.buttonText}>Close Scanner</Text>
					</TouchableOpacity>
				</View>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: 16,
		paddingHorizontal: 16,
	},
	centered: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	headerText: {
		fontSize: 20,
		fontWeight: "600",
		marginBottom: 20,
	},
	buttonContainer: {
		marginBottom: 20,
		gap: 10,
	},
	button: {
		backgroundColor: "#007AFF",
		paddingVertical: 12,
		paddingHorizontal: 20,
		borderRadius: 8,
		alignItems: "center",
		justifyContent: "center",
	},
	buttonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "600",
	},
	closeButton: {
		marginBottom: 20,
		backgroundColor: "#FF3B30",
	},
	modalContainer: {
		flex: 1,
		justifyContent: "center",
	},
});
