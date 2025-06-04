import { HolderProvider } from "@/providers/HolderProvider";
import { Stack } from "expo-router";

export default function RootLayout() {
	return (
		// Claim a Credential - Step 1.3: Wrap the app in the HolderProvider component to make the HolderContext available to any child components
		<HolderProvider>
			<Stack>
				<Stack.Screen
					name="index"
					options={{
						headerTitle: "Home",
					}}
				/>
			</Stack>
		</HolderProvider>
	);
}
