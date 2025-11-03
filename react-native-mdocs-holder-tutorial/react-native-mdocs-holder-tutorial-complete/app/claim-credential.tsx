import { useGlobalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

import { useHolder } from "@/providers/HolderProvider";
import {
	discoverCredentialOffer,
	retrieveCredentials,
} from "@mattrglobal/mobile-credential-holder-react-native";
import type {
	DiscoveredCredentialOffer,
	OfferedCredential,
} from "@mattrglobal/mobile-credential-holder-react-native/lib/types/index";

// Claim a Credential - Step 4.1: define the CLIENT_ID constant
const CLIENT_ID = "react-native-mobile-credential-holder-tutorial-app";

export default function ClaimCredential() {
	const router = useRouter();
	const { scannedValue } = useGlobalSearchParams<{ scannedValue: string }>();
	const { isHolderInitialized, getMobileCredentials } = useHolder();
	const [credentialOffer, setCredentialOffer] =
		useState<DiscoveredCredentialOffer>();
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [transactionCode, setTransactionCode] = useState<string>("");

	useEffect(() => {
		const discoverOffer = async () => {
			if (!isHolderInitialized || !scannedValue) {
				setError("Missing holder instance or scanned value.");
				setIsLoading(false);
				return;
			}

			// Claim Credential - Step 3.2: Discover Credential Offer
			const discoveryResult = await discoverCredentialOffer(scannedValue);

			if (discoveryResult.isErr()) {
				setError(
					`Error discovering credential offer: ${discoveryResult.error.message || discoveryResult.error.type}`,
				);
			} else {
				console.log("Discovered Credential Offer:", discoveryResult.value);
				setCredentialOffer(discoveryResult.value);
			}

			setIsLoading(false);
		};

		discoverOffer();
	}, [isHolderInitialized, scannedValue]);

	const handleConsent = useCallback(async () => {
		if (!credentialOffer || !isHolderInitialized) {
			Alert.alert("Error", "Missing offer information or holder instance.");
			router.back();
			return;
		}
		// Claim a Credential - Step 4.2: Retrieve Credentials
		const retrieved = await retrieveCredentials({
			credentialOffer: scannedValue,
			clientId: CLIENT_ID,
			transactionCode: credentialOffer?.transactionCode
				? transactionCode || undefined
				: undefined,
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
			Alert.alert(
				"Success",
				`Retrieved ${retrieved.value.length} credential(s) successfully!`,
			);
		}
		// Refresh the list of mobile credentials in the holder application
		await getMobileCredentials();
		router.replace("/");
	}, [
		credentialOffer,
		isHolderInitialized,
		getMobileCredentials,
		router,
		scannedValue,
		transactionCode,
	]);

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
			{/* Claim a Credential - Step 4.3: Add transaction code input if required */}
			{credentialOffer?.transactionCode && (
				<View style={styles.transactionCodeContainer}>
					<Text style={styles.text}>Transaction Code Required:</Text>
					{credentialOffer.transactionCode.description && (
						<Text style={styles.description}>
							{credentialOffer.transactionCode.description}
						</Text>
					)}
					<TextInput
						style={styles.textInput}
						value={transactionCode}
						onChangeText={setTransactionCode}
						placeholder="Enter transaction code"
						maxLength={credentialOffer.transactionCode.length}
						autoCapitalize="characters"
						autoCorrect={false}
					/>
				</View>
			)}
			<ScrollView style={{ flex: 1 }}>
				{credentialOffer.credentials.map(
					(cred: OfferedCredential, index: number) => (
						<View key={`${cred.doctype}-${index}`} style={styles.card}>
							<Text style={styles.cardTitle}>{cred.name}</Text>
							<Text style={styles.text}>Document Type: {cred.doctype}</Text>
							<Text style={styles.text}>
								Number of Claims: {cred.claims?.length}
							</Text>
						</View>
					),
				)}
			</ScrollView>
			{/* Claim a Credential - Step 4.4: Add the Consent and Retrieve button */}
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
	transactionCodeContainer: {
		marginBottom: 16,
		padding: 16,
		backgroundColor: "#F8F9FA",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#E0E0E0",
	},
	description: {
		fontSize: 14,
		color: "#666",
		marginBottom: 8,
		fontStyle: "italic",
	},
	textInput: {
		borderWidth: 1,
		borderColor: "#DDD",
		borderRadius: 8,
		padding: 12,
		fontSize: 16,
		backgroundColor: "white",
		marginTop: 8,
	},
});
