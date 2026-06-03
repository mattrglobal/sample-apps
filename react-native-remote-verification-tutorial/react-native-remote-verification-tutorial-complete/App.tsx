/**
 * Step 1: Import the MATTR Mobile Credential Verifier SDK
 *
 * Import the functions and types used to run a remote (app-to-app) verification:
 * - `initialize`: Initialize the SDK with your tenant host so it knows which MATTR VII tenant to use.
 * - `requestMobileCredentials`: Start a remote presentation session and request an mDoc from a wallet
 *   app installed on the same device.
 * - `handleDeepLink`: (iOS only) Forward the wallet's redirect URL to the SDK to complete the session.
 */
import {
  type MobileCredentialRequest,
  type MobileCredentialResponse,
  handleDeepLink,
  initialize,
  requestMobileCredentials,
} from "@mattrglobal/mobile-credential-verifier-react-native";
import * as Crypto from "expo-crypto";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Constants } from "./Constants";
import { VerificationResultsModal } from "./VerificationResultsModal";
import { styles } from "./styles";

/**
 * Main App component for the remote mDocs Verifier tutorial.
 *
 * This component implements the following tutorial capabilities:
 * 1. Initialize the SDK with the tenant host so the app can request and verify credentials.
 * 2. Request an mDoc for verification from a compliant wallet app on the same device.
 * 3. Handle the redirect back from the wallet (iOS) and read the verification results.
 * 4. Display the verification results to the verifier app user.
 */
export default function App() {
  // State variables for SDK initialization, loading messages, and the verification results.
  const [isSDKInitialized, setIsSDKInitialized] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | false>(false);
  const [verificationResults, setVerificationResults] = useState<MobileCredentialResponse | null>(null);
  const [showVerificationResults, setShowVerificationResults] = useState(false);

  /**
   * Step 2: Initialize the SDK
   *
   * Runs once on app launch. Unlike the in-person (proximity) flow, the remote flow requires a
   * `tenantHost`: the SDK starts presentation sessions with this MATTR VII tenant, which performs the
   * verification server-side and returns the results.
   */
  useEffect(() => {
    const initializeSDK = async () => {
      try {
        setLoadingMessage("Initializing SDK...");
        const result = await initialize({
          platformConfiguration: { tenantHost: Constants.TENANT_HOST },
        });
        if (result.isErr()) {
          console.error("Failed to initialize SDK:", result.error);
          Alert.alert("Error", "Failed to initialize the verifier SDK");
          return;
        }
        setIsSDKInitialized(true);
      } catch (error) {
        console.error("Failed to initialize SDK:", error);
        Alert.alert(
          "Error",
          `Failed to initialize the verifier SDK: ${error instanceof Error ? error.message : String(error)}`
        );
      } finally {
        setLoadingMessage(false);
      }
    };

    initializeSDK();
  }, []);

  /**
   * Step 4: Handle the redirect from the wallet (iOS)
   *
   * On iOS the wallet redirects back to this app via the custom URL scheme registered in
   * `app.config.ts`. Forward the redirect URL to the SDK with `handleDeepLink` so it can complete the
   * pending `requestMobileCredentials` call. On Android the SDK's `Openid4VpCallbackActivity` (declared
   * by the `withOpenid4VpCallbackActivity` config plugin) handles the redirect automatically, so no
   * deep link listener is required.
   */
  useEffect(() => {
    if (Platform.OS !== "ios") {
      return;
    }
    const subscription = Linking.addEventListener("url", ({ url }) => {
      handleDeepLink({ url });
    });
    return () => subscription.remove();
  }, []);

  /**
   * Step 3: Request a credential from the wallet application
   *
   * Builds a presentation request and starts a remote presentation session. This redirects the user to
   * a compliant wallet app, and resolves once the wallet has responded and the tenant has verified the
   * mDoc.
   */
  const requestCredentials = async () => {
    try {
      setVerificationResults(null);
      setLoadingMessage("Requesting credentials...");

      // Define what information to request:
      // - docType: the requested credential type (org.iso.18013.5.1.mDL)
      // - namespaces: the requested namespace (org.iso.18013.5.1) and claims
      // - Each claim value (false) indicates the verifier does NOT intend to retain/persist the data.
      const mobileCredentialRequest: MobileCredentialRequest = {
        docType: "org.iso.18013.5.1.mDL",
        namespaces: {
          "org.iso.18013.5.1": {
            family_name: false,
            given_name: false,
            birth_date: false,
          },
        },
      };

      // `challenge` must be a unique, unpredictable value for every request to mitigate replay attacks.
      const result = await requestMobileCredentials({
        request: [mobileCredentialRequest],
        applicationId: Constants.APPLICATION_ID,
        challenge: Crypto.randomUUID(),
      });

      if (result.isErr()) {
        throw new Error(`Failed to request credentials: ${result.error.message}`);
      }

      const session = result.value;
      // A session-level failure (aborted, wallet unavailable, verification/response error) is
      // signaled by `error` being present on the result. There is no `isSuccess` flag.
      if (session.error) {
        throw new Error(`Verification session failed: ${session.error.message}`);
      }

      const response = session.mobileCredentialResponse;
      if (!response) {
        throw new Error("No verification results were returned by the tenant.");
      }

      // Store the verification results and display them to the verifier app user.
      setVerificationResults(response);
      setShowVerificationResults(true);
    } catch (error) {
      console.error("Error requesting credentials:", error);
      Alert.alert("Error", error instanceof Error ? error.message : String(error));
    } finally {
      setLoadingMessage(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <Text style={styles.title}>mDocs Remote Verifier</Text>
      </View>

      {loadingMessage ? (
        <View style={[styles.content, styles.center]}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>{loadingMessage}</Text>
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, !isSDKInitialized && styles.buttonDisabled]}
              onPress={requestCredentials}
              disabled={!isSDKInitialized}
            >
              <Text style={styles.buttonText}>Request credentials</Text>
            </TouchableOpacity>
          </View>

          {!isSDKInitialized && (
            <Text style={styles.errorText}>SDK not initialized. Please restart the app.</Text>
          )}
        </View>
      )}

      {/* Step 4: Display the verification results returned by the tenant. */}
      <VerificationResultsModal
        visible={showVerificationResults}
        onClose={() => setShowVerificationResults(false)}
        verificationResults={verificationResults}
      />
    </SafeAreaView>
  );
}
