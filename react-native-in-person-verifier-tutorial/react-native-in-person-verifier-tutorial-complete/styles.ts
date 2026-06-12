import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  content: {
    flex: 1,
    padding: 15,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  centeredContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContainer: {
    marginVertical: 15,
  },

  // Headers
  header: {
    padding: 40,
    backgroundColor: "#007AFF",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  // Cards
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 5,
    marginBottom: 15,
  },

  // Buttons
  button: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  secondaryButton: {
    backgroundColor: "#f0f0f0",
  },
  buttonSuccess: {
    backgroundColor: "#34C759",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  marginTop: {
    marginTop: 20,
  },
  dangerButton: {
    backgroundColor: "#FF6B6B",
    padding: 5,
    borderRadius: 4,
  },

  // Text
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "normal",
  },
  secondaryButtonText: {
    color: "#333",
  },
  buttonTextBold: {
    color: "#fff",
    fontWeight: "600",
  },
  loadingText: {
    marginTop: 10,
  },
  marginBottom: {
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 15,
  },
  errorText: {
    color: "#FF6B6B",
    textAlign: "center",
    marginTop: 15,
  },
  errorColor: {
    color: "#FF6B6B",
  },
  grayColor: {
    color: "#999",
  },
  smallText: {
    fontSize: 12,
  },
  centeredText: {
    textAlign: "center",
  },
  verificationSuccess: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  verificationFailed: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FF6B6B",
  },
  verificationSubtext: {
    fontSize: 16,
    color: "#666",
    marginTop: 5,
  },

  // Form elements
  formField: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    height: 60,
  },
  expandingInput: {
    height: undefined,
    minHeight: 60,
    maxHeight: 200,
  },

  // List items
  listItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontWeight: "500",
    marginBottom: 3,
  },

  // QR Scanner
  camera: {
    flex: 1,
  },
  qrFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: "#fff",
  },
  qrOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    pointerEvents: "none",
  },
  qrOverlayText: {
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
    color: "#fff",
    textAlign: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 10,
    borderRadius: 5,
  },
  scannerControls: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    alignItems: "center",
  },
});