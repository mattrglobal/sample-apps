import { type PropsWithChildren, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export function Collapsible({
	children,
	title,
}: PropsWithChildren & { title: string }) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<View>
			<TouchableOpacity
				style={styles.heading}
				onPress={() => setIsOpen((value) => !value)}
				activeOpacity={0.8}
			>
				<Text style={styles.chevron}>{isOpen ? "▼" : "▶"}</Text>
				<Text>{title}</Text>
			</TouchableOpacity>
			{isOpen && <View style={styles.content}>{children}</View>}
		</View>
	);
}

const styles = StyleSheet.create({
	heading: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
	},
	content: {
		marginTop: 6,
		marginLeft: 24,
	},
	chevron: {
		fontSize: 12,
		lineHeight: 18,
	},
});
