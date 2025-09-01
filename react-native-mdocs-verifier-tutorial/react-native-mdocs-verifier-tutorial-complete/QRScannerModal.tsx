import { CameraView } from "expo-camera";
import { useEffect, useState } from "react";
import { Alert, Modal, SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import { styles } from "./styles";

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
  const [scanned, setScanned] = useState(false);
  const [scanningEnabled, setScanningEnabled] = useState(true);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (!scanningEnabled || scanned) return;

    console.log(`Scanned barcode with data: ${data}`);

    setScanned(true);
    setScanningEnabled(false);

    // Check if data starts with "mdoc:"
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
    onQRCodeDetected(data);
  };

  const resetScanner = () => {
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
              <CameraView
                style={styles.camera}
                facing="back"
                barcodeScannerSettings={{
                  barcodeTypes: ["qr"],
                }}
                onBarcodeScanned={handleBarCodeScanned}
              />

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
