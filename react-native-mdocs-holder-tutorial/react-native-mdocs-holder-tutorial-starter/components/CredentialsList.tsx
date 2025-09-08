import { Collapsible } from "@/components/Collapsible";
import type { MobileCredentialMetadata } from "@mattrglobal/mobile-credential-holder-react-native";
import type React from "react";
import {
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

type CredentialsListProps = {
	mobileCredentials: MobileCredentialMetadata[];
	deleteMobileCredential: (id: string) => void;
};

export default function CredentialsList({
	mobileCredentials,
	deleteMobileCredential,
}: CredentialsListProps) {
	if (mobileCredentials.length === 0) {
		return <Text>No credentials found in your holder application.</Text>;
	}

	return (
		<View style={styles.credentialsContainer}>
			<Text style={styles.sectionTitle}>Your Credentials:</Text>
			<ScrollView style={styles.scrollView}>
				{mobileCredentials.map((credential, index) => (
					<Collapsible
						key={credential.id || index}
						title={credential.branding?.name || `Credential ${index + 1}`}
					>
						<View style={styles.credentialDetails}>
							<TouchableOpacity
								style={styles.deleteButton}
								onPress={() => deleteMobileCredential(credential.id)}
							>
								<Text style={styles.buttonText}>Delete Credential</Text>
							</TouchableOpacity>
							<Text style={styles.credentialText}>
								{JSON.stringify(credential, null, 2)}
							</Text>
						</View>
					</Collapsible>
				))}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	credentialsContainer: {
		flex: 1,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "500",
		marginBottom: 10,
	},
	scrollView: {
		flex: 1,
	},
	credentialDetails: {
		marginVertical: 10,
	},
	credentialText: {
		marginTop: 10,
		fontFamily: "monospace",
	},
	deleteButton: {
		backgroundColor: "#FF3B30",
		paddingVertical: 12,
		paddingHorizontal: 20,
		borderRadius: 8,
		alignItems: "center",
		marginBottom: 10,
	},
	buttonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "600",
	},
});
