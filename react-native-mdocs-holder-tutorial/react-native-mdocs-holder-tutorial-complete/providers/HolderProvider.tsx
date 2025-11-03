import {
	type MobileCredentialMetadata,
	UserAuthenticationBehavior,
	UserAuthenticationType,
	deleteCredential,
	getCredentials,
	initialize,
	isInitialized,
} from "@mattrglobal/mobile-credential-holder-react-native";
// Online Presentation - Step 2.3: Import expo-linking and expo-router
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
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
	// Online Presentation - Step 2.4: Initialize router variable
	const router = useRouter();

	// Claim a Credential - Step 1.2: Initialize the Holder SDK
	const initializeHolder = useCallback(async () => {
		try {
			// Check if SDK is already initialized
			const alreadyInitialized = await isInitialized();
			if (alreadyInitialized) {
				setIsHolderInitialized(true);
				return;
			}

			const result = await initialize({
				userAuthenticationConfiguration: {
					userAuthenticationBehavior: UserAuthenticationBehavior.OnInitialize,
					userAuthenticationType: UserAuthenticationType.BiometricOrPasscode,
				},
				credentialIssuanceConfiguration: {
					autoTrustMobileCredentialIaca: true,
					redirectUri:
						"io.mattrlabs.sample.reactnativemobilecredentialholdertutorialapp://credentials/callback",
				},
			});

			if (result.isErr()) {
				setError(result.error.message || "Failed to initialize holder.");
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

	// Online Presentation - Step 2.5: Handle deep link
	useEffect(() => {
		if (!isHolderInitialized) return;

		const handleDeepLink = (event: { url: string }) => {
			const { url } = event;

			if (url.startsWith("mdoc-openid4vp://")) {
				router.replace({
					pathname: "/online-presentation",
					params: { scannedValue: url },
				});
			}
		};

		// Check for cold start deep link
		Linking.getInitialURL().then((url) => {
			if (url) {
				handleDeepLink({ url });
			}
		});

		// Listen for deep links when app is already running
		const subscription = Linking.addEventListener("url", handleDeepLink);
		return () => subscription.remove();
	}, [isHolderInitialized, router]);

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
