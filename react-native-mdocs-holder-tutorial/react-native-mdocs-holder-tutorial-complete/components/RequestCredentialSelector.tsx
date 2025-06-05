import type {
	MobileCredentialMetadata,
	PresentationSessionSuccessRequest,
} from "@mattrglobal/mobile-credential-holder-react-native";
import type React from "react";
import {
	FlatList,
	type ListRenderItem,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

type RequestCredentialSelectorProps = {
	requests: PresentationSessionSuccessRequest["request"];
	selectedCredentialIds: string[];
	onToggleSelection: (credentialId: string) => void;
};

type RequestItem = PresentationSessionSuccessRequest["request"][number];

/**
 * Component that renders a list of credential requests and their matched credentials.
 *
 * @param props - The component props.
 * @param props.requests - The list of credential requests.
 * @param props.selectedCredentialIds - The list of selected credential IDs.
 * @param props.onToggleSelection - Callback function to toggle the selection of a credential.
 * @returns The rendered component.
 */
export default function RequestCredentialSelector({
	requests,
	selectedCredentialIds,
	onToggleSelection,
}: RequestCredentialSelectorProps) {
	const renderCredential: ListRenderItem<MobileCredentialMetadata> = ({
		item: cred,
	}) => {
		const isSelected = selectedCredentialIds.includes(cred.id);
		return (
			<TouchableOpacity
				style={styles.credentialItem}
				onPress={() => onToggleSelection(cred.id)}
			>
				<View style={styles.selectionIndicator}>
					{isSelected && <View style={styles.selectionInner} />}
				</View>
				<Text style={styles.credentialText}>
					{cred.branding?.name ?? "Credential"} ({cred.id})
				</Text>
			</TouchableOpacity>
		);
	};

	const renderRequest: ListRenderItem<RequestItem> = ({ item }) => (
		<View style={styles.requestContainer}>
			<Text style={styles.label}>Request Details</Text>
			<Text style={styles.requestInfo}>
				{typeof item.request === "object"
					? JSON.stringify(item.request, null, 2)
					: item.request}
			</Text>
			<Text style={styles.label}>Matched Credentials:</Text>
			<FlatList
				data={item.matchedCredentials}
				keyExtractor={(cred) => cred.id}
				renderItem={renderCredential}
				style={styles.credentialsList}
				contentContainerStyle={styles.credentialsListContent}
			/>
		</View>
	);

	return (
		<FlatList
			data={requests}
			keyExtractor={(_, idx) => idx.toString()}
			renderItem={renderRequest}
			style={styles.requestsList}
			contentContainerStyle={styles.requestsListContent}
		/>
	);
}

const styles = StyleSheet.create({
	requestsList: {
		flex: 1,
	},
	requestsListContent: {
		paddingBottom: 10,
	},
	requestContainer: {
		backgroundColor: "#f0f0f0",
		padding: 10,
		borderRadius: 8,
		marginBottom: 15,
	},
	requestInfo: {
		fontStyle: "italic",
		fontSize: 12,
		marginBottom: 10,
	},
	label: {
		fontWeight: "bold",
		fontSize: 14,
		textTransform: "uppercase",
		marginBottom: 5,
	},
	credentialsList: {
		maxHeight: 200,
	},
	credentialsListContent: {
		paddingBottom: 10,
	},
	credentialItem: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 8,
		paddingVertical: 4,
	},
	selectionIndicator: {
		height: 20,
		width: 20,
		borderRadius: 10,
		borderWidth: 1,
		borderColor: "#000",
		alignItems: "center",
		justifyContent: "center",
		marginRight: 8,
	},
	selectionInner: {
		height: 10,
		width: 10,
		borderRadius: 5,
		backgroundColor: "#000",
	},
	credentialText: {
		fontSize: 16,
	},
});
