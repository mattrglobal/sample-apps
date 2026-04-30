package com.example.holdertutorial

import android.Manifest
import android.app.Activity
import android.content.Context
import android.util.Log
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
import global.mattr.mobilecredential.holder.MobileCredentialHolder
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.launch

// Gets the permissions and shows the screen content, when the permissions are obtained
@OptIn(ExperimentalPermissionsApi::class)
@Composable
fun ScanOfferScreen(navController: NavController) {
    val cameraPermissionState = rememberPermissionState(Manifest.permission.CAMERA)

    val requestPermissionLauncher =
        rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) {}

    LaunchedEffect(cameraPermissionState) {
        if (!cameraPermissionState.status.isGranted) {
            requestPermissionLauncher.launch(Manifest.permission.CAMERA)
        }
    }

    if (cameraPermissionState.status.isGranted) Content(navController)
}

// Screen content
@Composable
private fun Content(navController: NavController) {
    val context = LocalContext.current
    val barcodeView = remember { DecoratedBarcodeView(context) }
    val coroutineScope = rememberCoroutineScope()
    var isQrScanned by remember { mutableStateOf(false) }

    val barcodeCallback = remember {
        BarcodeCallback { result ->
            // Executed when the QR code was scanned
            coroutineScope.launch { onQrScanned(context, result.text, navController) }
            barcodeView.pause()
            isQrScanned = true
        }
    }

    // Setting up the QR scanner
    DisposableEffect(Unit) {
        barcodeView.decodeContinuous(barcodeCallback)
        barcodeView.resume()
        onDispose { barcodeView.pause() }
    }

    // Showing the scanner until the QR is scanned. Showing a progress bar after that
    if (!isQrScanned) {
        AndroidView(factory = { barcodeView }, modifier = Modifier.fillMaxSize())
    } else {
        Box(Modifier.fillMaxSize()) {
            CircularProgressIndicator(Modifier.align(Alignment.Center))
        }
    }
}

private suspend fun onQrScanned(context: Context, offer: String, navController: NavController) {
    // Step 3.2: Discover credential offer
    try {
        SharedData.scannedOffer = offer
        SharedData.discoveredCredentialOffer =
            MobileCredentialHolder.getInstance().discoverCredentialOffer(offer)
    } catch (e: Exception) {
        Toast.makeText(context, "Failed to discover offer", Toast.LENGTH_SHORT).show()
    }

    navController.navigateUp()
}