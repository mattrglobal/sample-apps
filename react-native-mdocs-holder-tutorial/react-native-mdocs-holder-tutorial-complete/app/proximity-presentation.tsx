// Step 2.2: Import Credential selector component
import RequestCredentialSelector from "@/components/RequestCredentialSelector";
import { useHolder } from "@/providers/HolderProvider";
import {
	type PresentationSessionSuccessRequest,
	createProximityPresentationSession,
	sendProximityPresentationResponse,
	terminateProximityPresentationSession,
} from "@mattrglobal/mobile-credential-holder-react-native";
import { useRouter } from "expo-router";
import React, { useState, useCallback, useEffect } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

export default function ProximityPresentation() {
	const router = useRouter();
	const { isHolderInitialised } = useHolder();
	const [error, setError] = useState<string | null>(null);
	const [deviceEngagement, setDeviceEngagement] = useState<string | null>(null);
	const [requests, setRequests] = useState<
		PresentationSessionSuccessRequest["request"]
	>([]);
	const [selectedCredentialIds, setSelectedCredentialIds] = useState<string[]>(
		[],
	);

	const navigateToIndex = useCallback(() => {
		router.push("/");
	}, [router]);

	const resetState = useCallback(() => {
		setDeviceEngagement(null);
		setRequests([]);
		setSelectedCredentialIds([]);
	}, []);

	const handleError = useCallback((message: string) => {
		setError(message);
		console.error(message);
	}, []);

	// Step 2.3: Add handleToggleSelection function
	const handleToggleSelection = useCallback((id: string) => {
		setSelectedCredentialIds(
			(prev) =>
				prev.includes(id)
					? prev.filter((item) => item !== id) // Remove if already selected
					: [...prev, id], // Add if not selected
		);
	}, []);

	if (!isHolderInitialised) {
		return (
			<View style={styles.container}>
				<Text style={styles.errorText}>
					Holder instance not found. Please restart the app and try again.
				</Text>
			</View>
		);
	}

	// Step 1.2: Add handleStartSession function
	const handleStartSession = useCallback(async () => {
		try {
			const result = await createProximityPresentationSession({
				onRequestReceived: (data) => {
					if ("error" in data) {
						handleError(`Request received error: ${data.error}`);
						return;
					}
					setRequests(data.request);
				},
				onSessionTerminated: () => {
					resetState();
					navigateToIndex();
				},
			});
			if (result.isErr()) {
				throw new Error(
					`Error creating proximity session: ${JSON.stringify(result.error)}`,
				);
			}
			setDeviceEngagement(result.value.deviceEngagement);
		} catch (err: any) {
			handleError(err.message);
		}
	}, [handleError, resetState, navigateToIndex]);

	// Automatically start session when component mounts
	useEffect(() => {
		handleStartSession();
	}, [handleStartSession]);

	// Step 1.6: Add terminateSession function
	const terminateSession = useCallback(async () => {
		try {
			await terminateProximityPresentationSession();
			resetState();
			navigateToIndex();
		} catch (err: any) {
			handleError(`Failed to terminate session: ${err.message}`);
		}
	}, [resetState, handleError, navigateToIndex]);

	const handleTerminateSession = useCallback(async () => {
		await terminateSession();
	}, [terminateSession]);

	useEffect(() => {
		return () => {
			if (deviceEngagement) {
				terminateSession();
			}
		};
	}, [deviceEngagement, terminateSession]);

	// Step 3.1: Add handleSendResponse function
	const handleSendResponse = useCallback(async () => {
		if (selectedCredentialIds.length === 0) {
			Alert.alert(
				"No Credentials Selected",
				"Please select at least one credential to send.",
			);
			return;
		}
		try {
			const result = await sendProximityPresentationResponse({
				credentialIds: selectedCredentialIds,
			});
			if (result.isErr()) {
				await terminateSession();
				throw new Error(`Error sending proximity response: ${result.error}`);
			}
			Alert.alert("Success", "Presentation response sent successfully!");
			navigateToIndex();
		} catch (err: any) {
			handleError(err.message);
		}
	}, [selectedCredentialIds, handleError, terminateSession, navigateToIndex]);

	return (
		<View style={styles.container}>
			{error && <Text style={styles.errorText}>{error}</Text>}
			{/* Step 1.3: Add fallback UI */}
			{!deviceEngagement ? (
				<>
					<Text style={styles.infoText}>
						Waiting for session to establish...
					</Text>
				</>
			) : (
				<>
					{/* Step 1.4: Display QR code */}
					<Text style={styles.infoText}>A proximity session is active.</Text>
					{requests.length === 0 ? (
						<View style={styles.qrContainer}>
							<QRCode value={deviceEngagement} size={200} />
							{/* Step 1.7: Add Terminate session button */}
							<TouchableOpacity
								style={[styles.button, styles.buttonDanger]}
								onPress={handleTerminateSession}
							>
								<Text style={styles.buttonText}>Terminate Session</Text>
							</TouchableOpacity>
						</View>
					) : (
						<>
							{/* Step 2.4: Display request details */}
							<RequestCredentialSelector
								requests={requests}
								selectedCredentialIds={selectedCredentialIds}
								onToggleSelection={handleToggleSelection}
							/>
							{/* Step 3.2: Send response */}
							<TouchableOpacity
								style={styles.button}
								onPress={handleSendResponse}
							>
								<Text style={styles.buttonText}>Share credential</Text>
							</TouchableOpacity>
						</>
					)}
				</>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16, paddingBottom: 32 },
	errorText: { color: "red", marginBottom: 10 },
	infoText: { marginBottom: 10 },
	qrContainer: { alignItems: "center", marginVertical: 20 },
	button: {
		backgroundColor: "#007AFF",
		paddingVertical: 12,
		paddingHorizontal: 20,
		borderRadius: 8,
		alignItems: "center",
		marginTop: 20,
	},
	buttonDanger: {
		backgroundColor: "#FF3B30",
	},
	buttonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "600",
	},
});
