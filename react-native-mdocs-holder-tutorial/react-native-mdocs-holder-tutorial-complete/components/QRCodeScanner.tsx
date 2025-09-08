import React, { useRef } from "react";
import {
	Dimensions,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import {
	Camera,
	useCameraDevice,
	useCameraPermission,
	useCodeScanner,
} from "react-native-vision-camera";

type QRCodeScannerProps = {
	onScanComplete: (scannedValue: string) => void;
};

const { width, height } = Dimensions.get("window");
const overlaySize = width * 0.7;

export default function QRCodeScanner({ onScanComplete }: QRCodeScannerProps) {
	const device = useCameraDevice("back");
	const { hasPermission, requestPermission } = useCameraPermission();

	// Ref to track if a scan has been handled
	const scanHandledRef = useRef(false);

	const codeScanner = useCodeScanner({
		codeTypes: ["qr"],
		onCodeScanned: ([code]) => {
			if (code?.value && !scanHandledRef.current) {
				console.log("Scanned QR Code:", code.value);
				scanHandledRef.current = true;
				onScanComplete(code.value);
			}
		},
	});

	// Handle cases where permissions are not granted
	if (!hasPermission) {
		return (
			<View style={styles.centered}>
				<TouchableOpacity style={styles.button} onPress={requestPermission}>
					<Text style={styles.buttonText}>Request Camera Permission</Text>
				</TouchableOpacity>
			</View>
		);
	}

	// Handle cases where no camera device is found
	if (!device) {
		return (
			<View style={styles.centered}>
				<Text style={styles.errorText}>No camera device found.</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			{/* Render the Camera component */}
			<Camera
				device={device}
				isActive={true}
				style={styles.camera}
				codeScanner={codeScanner}
			/>
			{/* QR Code Overlay */}
			<View style={styles.overlayContainer}>
				<View style={styles.topOverlay} />
				<View style={styles.middleOverlay}>
					<View style={styles.sideOverlay} />
					<View style={styles.focusedArea} />
					<View style={styles.sideOverlay} />
				</View>
				<View style={styles.bottomOverlay} />
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	centered: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	camera: {
		flex: 1,
	},
	errorText: {
		fontSize: 16,
		color: "red",
	},
	overlayContainer: {
		position: "absolute",
		top: 0,
		left: 0,
		width: width,
		height: height,
		justifyContent: "space-between",
		alignItems: "center",
	},
	topOverlay: {
		width: width,
		height: (height - overlaySize) / 2,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
	},
	middleOverlay: {
		flexDirection: "row",
	},
	sideOverlay: {
		width: (width - overlaySize) / 2,
		height: overlaySize,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
	},
	focusedArea: {
		width: overlaySize,
		height: overlaySize,
		borderWidth: 2,
		borderColor: "blue",
		backgroundColor: "transparent",
	},
	bottomOverlay: {
		width: width,
		height: (height - overlaySize) / 2,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
	},
	button: {
		backgroundColor: "#007AFF",
		paddingVertical: 12,
		paddingHorizontal: 20,
		borderRadius: 8,
		alignItems: "center",
	},
	buttonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "600",
	},
});
