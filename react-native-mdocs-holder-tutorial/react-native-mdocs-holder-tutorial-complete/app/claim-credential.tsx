import { useGlobalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

import { useHolder } from "@/providers/HolderProvider";
import {
	type CredentialOfferResponse,
	discoverCredentialOffer,
	retrieveCredentials,
} from "@mattrglobal/mobile-credential-holder-react-native";

// Claim a Credential - Step 4.1: define the CLIENT_ID and REDIRECT_URI constants
const CLIENT_ID = "react-native-mobile-credential-holder-tutorial-app";
const REDIRECT_URI =
	"io.mattrlabs.sample.reactnativemobilecredentialholdertutorialapp://credentials/callback";

export default function ClaimCredential() {
	const router = useRouter();
	const { scannedValue } = useGlobalSearchParams<{ scannedValue: string }>();
	const { isHolderInitialised, getMobileCredentials } = useHolder();
	const [credentialOffer, setCredentialOffer] =
		useState<CredentialOfferResponse>();
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const discoverOffer = async () => {
			if (!isHolderInitialised || !scannedValue) {
				setError("Missing holder instance or scanned value.");
				setIsLoading(false);
				return;
			}

			// Claim Credential - Step 3.2: Discover Credential Offer
			const discoveryResult = await discoverCredentialOffer(scannedValue);

			if (discoveryResult.isErr()) {
				setError(
					`Error discovering credential offer: ${discoveryResult.error}`,
				);
			} else {
				console.log("Discovered Credential Offer:", discoveryResult.value);
				setCredentialOffer(discoveryResult.value);
			}

			setIsLoading(false);
		};

		discoverOffer();
	}, [isHolderInitialised, scannedValue]);

	const handleConsent = useCallback(async () => {
		if (!credentialOffer || !isHolderInitialised) {
			Alert.alert("Error", "Missing offer information or holder instance.");
			router.back();
			return;
		}
		// Claim a Credential - Step 4.2: Retrieve Credentials
		const retrieved = await retrieveCredentials({
			autoTrustMobileIaca: true,
			credentialOffer: credentialOffer,
			clientId: CLIENT_ID,
			redirectUri: REDIRECT_URI,
		});

		if (retrieved.isErr()) {
			setError(
				retrieved.error.message ||
					"An unexpected error occurred during offer discovery.",
			);
			Alert.alert(
				"Error",
				retrieved.error.message || "Failed to retrieve credentials.",
			);
		} else {
			Alert.alert("Success", "Credentials retrieved successfully!");
		}
		// Refresh the list of mobile credentials in the holder application
		await getMobileCredentials();
		router.replace("/");
	}, [credentialOffer, isHolderInitialised, getMobileCredentials, router]);

	if (isLoading) {
		return (
			<View style={styles.centered}>
				<ActivityIndicator size="large" color="#007AFF" />
				<Text style={styles.text}>Discovering offer...</Text>
			</View>
		);
	}

	if (error || !credentialOffer) {
		return (
			<View style={styles.centered}>
				<Text style={[styles.text, styles.errorText]}>
					Error: {error || "No discovery offer found."}
				</Text>
				<TouchableOpacity style={styles.button} onPress={() => router.back()}>
					<Text style={styles.buttonText}>Go Back</Text>
				</TouchableOpacity>
			</View>
		);
	}
	// Claim a Credential - Step 3.3: Display the offer details to the user
	return (
		<View style={styles.container}>
			<Text style={styles.title}>Credential Offer</Text>
			<Text style={styles.text}>
				Received {credentialOffer.credentials.length} credential
				{credentialOffer.credentials.length > 1 ? "s" : ""} from{" "}
				{credentialOffer.issuer}
			</Text>
			<ScrollView style={{ flex: 1 }}>
				{credentialOffer.credentials.map((cred, index) => (
					<View key={index} style={styles.card}>
						<Text style={styles.cardTitle}>{cred.name}</Text>
						<Text style={styles.text}>Document Type: {cred.doctype}</Text>
						<Text style={styles.text}>
							Number of Claims: {cred.claims?.length}
						</Text>
					</View>
				))}
			</ScrollView>
			{/* Claim a Credential - Step 4.3: Add the Consent and Retrieve button */}
			<View style={styles.buttonContainer}>
				<TouchableOpacity style={styles.button} onPress={handleConsent}>
					<Text style={styles.buttonText}>Consent and Retrieve</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={[styles.button, { backgroundColor: "#FF3B30" }]}
					onPress={() => router.replace("/")}
				>
					<Text style={styles.buttonText}>Cancel</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		backgroundColor: "#fff",
	},
	centered: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	title: {
		fontSize: 22,
		fontWeight: "600",
		marginBottom: 10,
		color: "#000",
	},
	text: {
		fontSize: 16,
		color: "#333",
		marginBottom: 10,
	},
	card: {
		marginBottom: 16,
		padding: 10,
		backgroundColor: "#F5F5F5",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#E0E0E0",
	},
	cardTitle: {
		fontWeight: "700",
		fontSize: 18,
		marginBottom: 5,
		color: "#000",
	},
	button: {
		backgroundColor: "#007AFF",
		paddingVertical: 12,
		paddingHorizontal: 20,
		borderRadius: 8,
		alignItems: "center",
	},
	buttonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "600",
	},
	buttonContainer: {
		marginBottom: 20,
		gap: 10,
	},
	errorText: {
		color: "#FF3B30",
		textAlign: "center",
	},
});
