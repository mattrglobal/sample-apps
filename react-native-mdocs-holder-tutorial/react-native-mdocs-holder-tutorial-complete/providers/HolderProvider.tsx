import {
	type MobileCredentialMetadata,
	deleteCredential,
	getCredentials,
	initialise,
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
	isHolderInitialised: boolean;
	getMobileCredentials: () => Promise<void>;
	mobileCredentials: MobileCredentialMetadata[];
	deleteMobileCredential: (credentialId: string) => Promise<void>;
	error: string | null;
	isLoading: boolean;
};

const HolderContext = createContext<HolderContextProps | undefined>(undefined);

export function HolderProvider({ children }: { children: React.ReactNode }) {
	const [isHolderInitialised, setIsHolderInitialised] =
		useState<boolean>(false);
	const [mobileCredentials, setMobileCredentials] = useState<
		MobileCredentialMetadata[]
	>([]);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	// Online Presentation - Step 2.4: Initialize router variable
	const router = useRouter();

	// Claim a Credential - Step 1.2: Initialize the Holder SDK
	const initialiseHolder = useCallback(async () => {
		const result = await initialise();

		if (result.isErr()) {
			setError(result.error.message || "Failed to initialise holder.");
		} else {
			setIsHolderInitialised(true);
		}

		setIsLoading(false);
	}, []);

	useEffect(() => {
		initialiseHolder();
	}, [initialiseHolder]);

	const getMobileCredentials = useCallback(async () => {
		if (!isHolderInitialised) return;
		const credentials = await getCredentials();
		setMobileCredentials(credentials);
	}, [isHolderInitialised]);

	// When the holder is initialized, get the mobile credentials to display in the app
	useEffect(() => {
		if (isHolderInitialised) {
			getMobileCredentials();
		}
	}, [isHolderInitialised, getMobileCredentials]);

	// An example implementation of deleting a credential, used for demonstration purposes
	const deleteMobileCredential = useCallback(
		async (credentialId: string) => {
			if (!isHolderInitialised) return;

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
		[isHolderInitialised, getMobileCredentials],
	);

	// Online Presentation - Step 2.5: Handle deep link
	useEffect(() => {
		if (!isHolderInitialised) return;

		const handleDeepLink = (event: { url: string }) => {
			const { url } = event;
			console.log("Deep link received:", url);

			if (url.startsWith("mdoc-openid4vp://")) {
				router.replace({
					pathname: "/online-presentation",
					params: { scannedValue: url },
				});
			}
		};

		Linking.getInitialURL().then((url) => {
			if (url) {
				console.log("Initial URL:", url);
				handleDeepLink({ url });
			}
		});

		const subscription = Linking.addEventListener("url", handleDeepLink);
		return () => subscription.remove();
	}, [isHolderInitialised, router]);

	const contextValue = useMemo(
		() => ({
			isHolderInitialised,
			error,
			isLoading,
			getMobileCredentials,
			mobileCredentials,
			deleteMobileCredential,
		}),
		[
			isHolderInitialised,
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
