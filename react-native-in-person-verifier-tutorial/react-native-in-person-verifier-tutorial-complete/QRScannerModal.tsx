/**
 * Verify mDocs - Step 1: QR Code Scanner Modal
 *
 * This component implements the QR code scanning capability for the proximity
 * presentation workflow as defined in ISO/IEC 18013-5:2021.
 *
 * In the proximity workflow, the holder (wallet app user) initiates the process
 * by presenting a QR code that encodes a device engagement string. The verifier
 * must scan this QR code to retrieve the engagement data and use it to establish
 * a secure BLE (Bluetooth Low Energy) connection between the two devices.
 *
 * The scanned QR code data (prefixed with "mdoc:") is passed back to App.tsx via
 * the `onQRCodeDetected` callback, which then calls `createProximityPresentationSession`
 * to establish the session.
 *
 * Uses the expo-camera package for camera access and QR code detection.
 */
import { CameraView } from "expo-camera";
import { useEffect, useRef, useState } from "react";
import { Alert, Modal, SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import { styles } from "./styles";

/**
 * Props for the QR Scanner Modal:
 * - `visible` / `onClose`: Control modal visibility.
 * - `permission` / `requestPermission`: Camera permission state from expo-camera,
 *    passed from App.tsx. Camera access is required for scanning QR codes.
 * - `onQRCodeDetected`: Callback invoked with the scanned QR code data string.
 *    This triggers the proximity presentation session in App.tsx.
 */
interface QRScannerModalProps {
  visible: boolean;
  onClose: () => void;
  permission: any;
  requestPermission: () => Promise<any>;
  onQRCodeDetected: (data: string) => void;
}

export function QRScannerModal({
  visible,
  onClose,
  permission,
  requestPermission,
  onQRCodeDetected,
}: QRScannerModalProps) {
  // State to prevent duplicate scans - the camera may fire multiple barcode events
  // for the same QR code, so we guard against processing it more than once.
  const [scanned, setScanned] = useState(false);
  const [scanningEnabled, setScanningEnabled] = useState(true);
  const handlerCalledRef = useRef(false);

  /**
   * Handles a scanned barcode result from the camera.
   *
   * Validates that the QR code data starts with the "mdoc:" prefix as required
   * by the ISO 18013-5 device engagement protocol. Invalid QR codes are rejected
   * with an option to scan again.
   *
   * On a valid scan, the modal is closed immediately (to stop the camera), and
   * the `onQRCodeDetected` callback is invoked after a short delay to pass the
   * device engagement string to App.tsx for proximity session establishment.
   */
  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (!scanningEnabled || scanned || handlerCalledRef.current) {
      return;
    }

    // Immediately mark as handled and disable scanning
    handlerCalledRef.current = true;
    setScanningEnabled(false);
    setScanned(true);

    console.log(`Scanned barcode with data: ${data}`);

    // Validate the QR code contains an mDoc device engagement string.
    // Per ISO 18013-5, mDoc QR codes are prefixed with "mdoc:".
    if (!data || !data.startsWith("mdoc:")) {
      Alert.alert(
        "Invalid QR Code",
        "The QR code must be an mDoc QR code starting with 'mdoc:'. Please scan a valid mDoc QR code.",
        [
          {
            text: "Try Again",
            onPress: () => resetScanner(),
          },
        ]
      );
      return;
    }

    console.log("Valid mDoc QR code detected:", data);

    // Close the scanner modal immediately to stop the camera, then pass the
    // device engagement data to the parent component after a brief delay.
    // The delay prevents the camera from firing additional barcode events.
    onClose();

    // Call handler after modal is closed to prevent camera from firing again
    setTimeout(() => {
      onQRCodeDetected(data);
    }, 300);
  };

  const resetScanner = () => {
    handlerCalledRef.current = false;
    setScanned(false);
    setScanningEnabled(true);
  };

  const handleClose = () => {
    resetScanner();
    onClose();
  };

  // Reset scanner state when modal becomes visible
  useEffect(() => {
    if (visible) {
      resetScanner();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>QR Code Scanner</Text>
          <TouchableOpacity onPress={handleClose}>
            <Text style={styles.buttonTextBold}>Close</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {!permission ? (
            <View style={styles.centeredContent}>
              <Text style={styles.errorText}>Camera permissions are still loading</Text>
            </View>
          ) : !permission.granted ? (
            <View style={styles.centeredContent}>
              <Text style={styles.errorText}>Camera permission is required to scan QR codes</Text>
              <TouchableOpacity style={[styles.button, styles.marginTop]} onPress={requestPermission}>
                <Text style={styles.buttonText}>Request Permission</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Camera view configured to scan QR codes. Uses the back-facing camera
                  and is set to detect only QR barcodes. The onBarcodeScanned callback
                  processes the scanned device engagement string. */}
              {!scanned && (
                <CameraView
                  style={styles.camera}
                  facing="back"
                  barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                  }}
                  onBarcodeScanned={handleBarCodeScanned}
                />
              )}

              <View style={styles.qrOverlay}>
                <View style={styles.qrFrame} />
                <Text style={styles.qrOverlayText}>
                  {scanned ? "Processing QR code..." : "Point your camera at a QR code"}
                </Text>
              </View>

              {scanned && (
                <View style={styles.scannerControls}>
                  <TouchableOpacity style={[styles.button, styles.buttonSuccess]} onPress={resetScanner}>
                    <Text style={styles.buttonTextBold}>Scan Again</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}
