// Step 3.2: Import Credential selector component
import RequestCredentialSelector from "@/components/RequestCredentialSelector";
import { useHolder } from "@/providers/HolderProvider";
import {
	type OnlinePresentationSession,
	createOnlinePresentationSession,
} from "@mattrglobal/mobile-credential-holder-react-native";
import { useGlobalSearchParams, useRouter } from "expo-router";
import React, { useState, useEffect, useCallback } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function OnlinePresentation() {
	const router = useRouter();
	const { scannedValue: authorisationRequestUri } = useGlobalSearchParams<{
		scannedValue: string;
	}>();
	const { isHolderInitialised } = useHolder();

	const [onlinePresentationSession, setOnlinePresentationSession] =
		useState<OnlinePresentationSession | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [requests, setRequests] = useState<
		OnlinePresentationSession["matchedCredentials"]
	>([]);
	const [selectedCredentialIds, setSelectedCredentialIds] = useState<string[]>(
		[],
	);

	const handleError = useCallback((message: string) => {
		setError(message);
		console.error(message);
	}, []);

	// Step 3.3: Add handleToggleSelection function
	const handleToggleSelection = useCallback((id: string) => {
		setSelectedCredentialIds(
			(prev) =>
				prev.includes(id)
					? prev.filter((item) => item !== id) // Remove if already selected
					: [...prev, id], // Add if not selected
		);
	}, []);
	// Step 2.6: Create Online Presentation Session
	useEffect(() => {
		if (!isHolderInitialised || !authorisationRequestUri) return;

		const createSession = async () => {
			try {
				const result = await createOnlinePresentationSession({
					authorisationRequestUri,
					requireTrustedVerifier: false,
				});

				if (result.isErr()) {
					throw new Error("Error creating presentation session");
				}

				const session = result.value;

				setOnlinePresentationSession(session);

				if (session.matchedCredentials) {
					setRequests(session.matchedCredentials);
				}
			} catch (err: any) {
				handleError(err.message);
			}
		};

		createSession();
	}, [isHolderInitialised, authorisationRequestUri, handleError]);

	// Step 4.1: Add handleSendResponse function
	const handleSendResponse = useCallback(async () => {
		if (!onlinePresentationSession) return;
		if (selectedCredentialIds.length === 0) {
			Alert.alert(
				"No Credential Selected",
				"Please select at least one credential first.",
			);
			return;
		}

		try {
			const sendResponseResult = await onlinePresentationSession.sendResponse({
				credentialIds: selectedCredentialIds,
			});

			if (sendResponseResult.isErr()) {
				throw new Error("Failed to send presentation response");
			}

			router.replace("/");
			Alert.alert("Success", "Presentation response sent successfully!");
		} catch (err: any) {
			handleError(err.message);
			Alert.alert(
				"Error",
				"Failed to send presentation response. Terminating session...",
			);
			await onlinePresentationSession.terminateSession();
		}
	}, [onlinePresentationSession, selectedCredentialIds, router, handleError]);

	if (error) {
		return (
			<View style={styles.container}>
				<Text style={styles.errorText}>Error: {error}</Text>
			</View>
		);
	}

	if (!onlinePresentationSession) {
		return (
			<View style={styles.container}>
				<Text>No online presentation session</Text>
			</View>
		);
	}

	// Step 3.4: Display presentation session details
	return (
		<View style={styles.container}>
			{/* Display verifier information */}
			<View style={styles.verifierSection}>
				<Text style={styles.label}>Verifier:</Text>
				<Text style={styles.verifierText}>
					{onlinePresentationSession.verifiedBy.value}
				</Text>
			</View>

			{/* Component to select credentials for the presentation */}
			<RequestCredentialSelector
				requests={requests}
				selectedCredentialIds={selectedCredentialIds}
				onToggleSelection={handleToggleSelection}
			/>

			{/* Step 4.2: Add Send response button */}
			<TouchableOpacity style={styles.button} onPress={handleSendResponse}>
				<Text style={styles.buttonText}>Send Response</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
	},
	errorText: {
		color: "red",
		fontSize: 16,
	},
	button: {
		backgroundColor: "#007AFF",
		paddingVertical: 12,
		paddingHorizontal: 20,
		borderRadius: 8,
		alignItems: "center",
		marginTop: 20,
	},
	buttonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "600",
	},
	verifierSection: {
		backgroundColor: "#f0f0f0",
		padding: 10,
		borderRadius: 8,
		marginBottom: 15,
	},
	label: {
		fontWeight: "bold",
		fontSize: 14,
		textTransform: "uppercase",
		marginBottom: 5,
	},
	verifierText: {
		fontSize: 16,
	},
});
