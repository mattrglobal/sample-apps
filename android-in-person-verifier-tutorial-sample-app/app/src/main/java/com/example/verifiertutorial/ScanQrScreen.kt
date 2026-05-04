package com.example.verifiertutorial

import android.app.Activity
import android.Manifest
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.viewinterop.AndroidView
import androidx.navigation.NavController
import com.google.accompanist.permissions.ExperimentalPermissionsApi
import com.google.accompanist.permissions.isGranted
import com.google.accompanist.permissions.rememberPermissionState
import com.journeyapps.barcodescanner.BarcodeCallback
import com.journeyapps.barcodescanner.DecoratedBarcodeView
import global.mattr.mobilecredential.verifier.deviceretrieval.devicerequest.DataElements
import global.mattr.mobilecredential.verifier.deviceretrieval.devicerequest.NameSpaces
import global.mattr.mobilecredential.verifier.dto.MobileCredentialRequest
import global.mattr.mobilecredential.verifier.dto.MobileCredentialResponse
import global.mattr.mobilecredential.verifier.MobileCredentialVerifier
import global.mattr.mobilecredential.verifier.ProximityPresentationSessionListener
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.launch
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlin.coroutines.Continuation
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException

/**
 * ScanOfferScreen implements the "Verify mDocs" section of the tutorial.
 */
@OptIn(ExperimentalPermissionsApi::class)
@Composable
fun ScanQrScreen(activity: Activity, navController: NavController) {
    // Verify mDocs - Step 1.6: Add permission request logic
    val cameraPermissionState = rememberPermissionState(Manifest.permission.CAMERA)

    val requestPermissionLauncher =
        rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) {}

    LaunchedEffect(cameraPermissionState) {
        if (!cameraPermissionState.status.isGranted) {
            requestPermissionLauncher.launch(Manifest.permission.CAMERA)
        }
    }

    // Show the camera scanning content once permission is granted.
    if (cameraPermissionState.status.isGranted) Content(activity, navController)
}

// Verify mDocs - Step 1.5: Add screen content
/**
 * Renders the QR code scanner UI.
 *
 * It displays a live camera preview using the ZXing barcode scanning library.
 * When a QR code is detected, the view switches to a loading spinner while the proximity presentation session is being established with the holder's wallet.
 */
@Composable
private fun Content(activity: Activity, navController: NavController) {
    val context = LocalContext.current
    val barcodeView = remember { DecoratedBarcodeView(context) }
    val coroutineScope = rememberCoroutineScope()
    var isQrScanned by remember { mutableStateOf(false) }

    // Callback invoked when the ZXing library successfully decodes a barcode.
    // It triggers the proximity presentation workflow and pauses scanning.
    val barcodeCallback = remember {
        BarcodeCallback { result ->
            onQrScanned(activity, result.text, coroutineScope, navController)
            barcodeView.pause()
            isQrScanned = true
        }
    }

    // Start continuous scanning when the composable enters composition, and pause the camera when it leaves (e.g. navigation away).
    DisposableEffect(Unit) {
        barcodeView.decodeContinuous(barcodeCallback)
        barcodeView.resume()
        onDispose { barcodeView.pause() }
    }

    if (!isQrScanned) {
        // Show the live camera feed for QR code scanning.
        AndroidView(factory = { barcodeView }, modifier = Modifier.fillMaxSize())
    } else {
        // After the QR is captured, show a progress spinner while the SDK establishes the BLE session with the holder's wallet and exchanges credentials.
        Box(Modifier.fillMaxSize()) {
            CircularProgressIndicator(Modifier.align(Alignment.Center))
        }
    }
}

// Verify mDocs - Step 1.4: Add QR scan callback
/**
 * The QR code encodes a device engagement string (as defined in ISO 18013-5) which the SDK uses to establish a BLE-based proximity presentation session with the holder's device.
 */
private fun onQrScanned(
    activity: Activity,
    deviceEngagement: String,
    coroutineScope: CoroutineScope,
    navController: NavController
) {
    coroutineScope.launch {
        // Verify mDocs - Step 3.2: Create session
        SharedData.credentialResponse = try {
            suspendCancellableCoroutine { continuation: Continuation<MobileCredentialResponse> ->
                val sessionListener = SessionListener(coroutineScope, continuation)

                // createProximityPresentationSession takes:
                //   - activity: needed to grant Bluetooth permissions.
                //   - deviceEngagement: the string decoded from the holder's QR code.
                //   - sessionListener: receives onEstablished/onError/onTerminated callbacks.
                MobileCredentialVerifier
                    .createProximityPresentationSession(activity, deviceEngagement, sessionListener)
            }
        } catch (_: Exception) {
            Toast.makeText(activity, "Failed to request credentials", Toast.LENGTH_SHORT).show()
            null
        }

        // Verify mDocs - Step 4.1: Handle response
        // If the credential response was received successfully, navigate to the results screen.
        SharedData.credentialResponse?.let {
            navController.navigate("viewResponse") { popUpTo("home") }
        }
    }
}

// Verify mDocs - Step 3.1: Create session listener
/**
 * SessionListener implements [ProximityPresentationSessionListener] to react to the lifecycle events of the BLE proximity presentation session.
 */
private class SessionListener(
    private val coroutineScope: CoroutineScope,
    private val continuation: Continuation<MobileCredentialResponse>
) : ProximityPresentationSessionListener {

    // onEstablished is called when the BLE session is successfully established with the holder's device.
    override fun onEstablished() {
        coroutineScope.launch {
            // Verify mDocs - Step 3.3: Request credentials
            // Once the BLE session is established, send the presentation request to the holder's wallet.
            // The wallet will prompt the holder for consent, then return matching credentials.
            try {
                val response = MobileCredentialVerifier.sendProximityPresentationRequest(
                    listOf(sampleMdocRequest)
                )
                // We can either send another credential request, or we should terminate the session to free up the resources.
                MobileCredentialVerifier.terminateProximityPresentationSession()
                continuation.resume(response)
            } catch (e: Exception) {
                continuation.resumeWithException(e)
            }
        }
    }

    override fun onTerminated(error: Throwable?) {
        /* no-op */
    }

    // onError is called if there are critical errors during the session establishment (e.g. BLE interrupted or disabled).
    override fun onError(error: Throwable?) {
        error?.let { continuation.resumeWithException(it) }
    }
}

// Verify mDocs - Step 2.1: Create a sample request
/**
 * The presentation request sent to the holder's wallet.
 *
 * For the verification to succeed, the holder's credential must contain these claims under the exact namespace specified.
 * Claims under a different namespace (e.g. "org.iso.18013.5.1.US") will not match.
 */
private val sampleMdocRequest = MobileCredentialRequest(
    // A mobile driver's license (mDL) document type defined in ISO 18013-5.
    docType = "org.iso.18013.5.1.mDL",
    namespaces = NameSpaces(
        mapOf(
            // "org.iso.18013.5.1" - The ISO standard namespace for mDL claims.
            "org.iso.18013.5.1" to DataElements(
                // "given_name", "family_name", "birth_date" — the specific claims requested.
                // The intent to retain flags are false for each of the claims,
                // indicating the verifier does NOT intend to store the claim values beyond the immediate verification.
                //
                // For the verification to succeed, the holder's credential must contain these claims under the exact namespace specified.
                // Claims under a different namespace (e.g. "org.iso.18013.5.1.US") will not match.
                listOf("given_name", "family_name", "birth_date").associateWith { false }
            )
        )
    )
)