import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";

function base64UrlDecode(base64Url: string): string {
	// Convert base64url to base64
	const base64 =
		base64Url.replace(/-/g, "+").replace(/_/g, "/") +
		"==".slice(0, (4 - (base64Url.length % 4)) % 4);
	return atob(base64);
}

export default function AcceptOfferHandler() {
	const { offer } = useLocalSearchParams<{ offer: string }>();
	const router = useRouter();

	useEffect(() => {
		console.log("Offer param:", offer);

		if (!offer) {
			console.log("No offer parameter found, redirecting to home");
			router.replace("/");
			return;
		}

		try {
			// Decode the base64url-encoded offer
			const decoded = base64UrlDecode(offer);
			console.log("Decoded credential offer:", decoded);

			if (decoded.startsWith("openid-credential-offer://")) {
				console.log(
					"Valid credential offer detected, navigating to claim-credential",
				);
				// Navigate to claim-credential with the decoded offer
				router.replace({
					pathname: "/claim-credential",
					params: { scannedValue: decoded },
				});
			} else {
				console.log(
					"Decoded content is not a valid credential offer:",
					decoded,
				);
				router.replace("/");
			}
		} catch (error) {
			console.log("Failed to decode offer:", error);
		}
	}, [offer, router]);

	return (
		<View
			style={{
				flex: 1,
				justifyContent: "center",
				alignItems: "center",
				backgroundColor: "#fff",
			}}
		>
			<ActivityIndicator size="large" color="#007AFF" />
			<Text style={{ marginTop: 16, fontSize: 16, color: "#333" }}>
				Processing credential offer...
			</Text>
		</View>
	);
}
