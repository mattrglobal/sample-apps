import {
	type MobileCredentialMetadata,
	UserAuthenticationBehavior,
	UserAuthenticationType,
	deleteCredential,
	getCredentials,
	initialize,
	isInitialized,
} from "@mattrglobal/mobile-credential-holder-react-native";
import type React from "react";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { Alert } from "react-native";

type HolderContextProps = {
	isHolderInitialized: boolean;
	getMobileCredentials: () => Promise<void>;
	mobileCredentials: MobileCredentialMetadata[];
	deleteMobileCredential: (credentialId: string) => Promise<void>;
	error: string | null;
	isLoading: boolean;
};

const HolderContext = createContext<HolderContextProps | undefined>(undefined);

export function HolderProvider({ children }: { children: React.ReactNode }) {
	const [isHolderInitialized, setIsHolderInitialized] =
		useState<boolean>(false);
	const [mobileCredentials, setMobileCredentials] = useState<
		MobileCredentialMetadata[]
	>([]);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	const initializeHolder = useCallback(async () => {
		try {
			// Check if SDK is already initialized
			const alreadyInitialized = await isInitialized();
			if (alreadyInitialized) {
				setIsHolderInitialized(true);
				return;
			}

			// Configure user authentication - using default settings for this tutorial
			const result = await initialize({
				userAuthenticationConfiguration: {
					userAuthenticationBehavior: UserAuthenticationBehavior.None, // No authentication required for tutorial
					userAuthenticationType: UserAuthenticationType.BiometricOrPasscode, // iOS only
				},
				credentialIssuanceConfiguration: {
					autoTrustMobileCredentialIaca: true,
					redirectUri:
						"io.mattrlabs.sample.reactnativemobilecredentialholdertutorialapp://credentials/callback",
				},
			});

			if (result.isErr()) {
				setError(result.error.message || "Failed to initialise holder.");
			} else {
				setIsHolderInitialized(true);
			}
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "Unknown error during initialization",
			);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		initializeHolder();
	}, [initializeHolder]);

	const getMobileCredentials = useCallback(async () => {
		if (!isHolderInitialized) return;
		const credentials = await getCredentials();
		setMobileCredentials(credentials);
	}, [isHolderInitialized]);

	// When the holder is initialized, get the mobile credentials to display in the app
	useEffect(() => {
		if (isHolderInitialized) {
			getMobileCredentials();
		}
	}, [isHolderInitialized, getMobileCredentials]);

	// An example implementation of deleting a credential, used for demonstration purposes
	const deleteMobileCredential = useCallback(
		async (credentialId: string) => {
			if (!isHolderInitialized) return;

			Alert.alert(
				"Confirm Deletion",
				"Are you sure you want to delete this credential?",
				[
					{ text: "Cancel", style: "cancel" },
					{
						text: "Delete",
						style: "destructive",
						onPress: async () => {
							try {
								await deleteCredential(credentialId);
								Alert.alert("Success", "Credential deleted successfully.");
								await getMobileCredentials();
							} catch (err) {
								console.error("Error deleting credential:", err);
								Alert.alert(
									"Error",
									err instanceof Error
										? err.message
										: "Failed to delete credential.",
								);
							}
						},
					},
				],
			);
		},
		[isHolderInitialized, getMobileCredentials],
	);

	const contextValue = useMemo(
		() => ({
			isHolderInitialized,
			error,
			isLoading,
			getMobileCredentials,
			mobileCredentials,
			deleteMobileCredential,
		}),
		[
			isHolderInitialized,
			error,
			isLoading,
			getMobileCredentials,
			mobileCredentials,
			deleteMobileCredential,
		],
	);

	return (
		<HolderContext.Provider value={contextValue}>
			{children}
		</HolderContext.Provider>
	);
}

export function useHolder() {
	const context = useContext(HolderContext);
	if (context === undefined) {
		throw new Error("useHolder must be used within a HolderProvider");
	}
	return context;
}
