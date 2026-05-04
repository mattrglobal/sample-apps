package com.example.holdertutorial

import android.app.Activity
import android.graphics.Bitmap
import android.graphics.Color
import android.widget.Toast
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.onSizeChanged
import androidx.compose.ui.unit.IntSize
import androidx.navigation.NavController
import com.google.zxing.BarcodeFormat
import com.google.zxing.EncodeHintType
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel
import com.journeyapps.barcodescanner.BarcodeEncoder
import global.mattr.mobilecredential.holder.MobileCredentialHolder
import global.mattr.mobilecredential.holder.ProximityPresentationSession
import global.mattr.mobilecredential.holder.datatransport.bluetooth.BleMode
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

@Composable
fun PresentationQrScreen(activity: Activity, navController: NavController) {
    var containerSize by remember { mutableStateOf(IntSize.Zero) }
    var session: ProximityPresentationSession? by remember { mutableStateOf(null) }
    var qrCode: Bitmap? by remember { mutableStateOf(null) }

    LaunchedEffect(Unit) {
        // Step 1.4: Create a Proximity presentation session
        session = MobileCredentialHolder.getInstance().createProximityPresentationSession(
            activity, // Not persisted. Used to request Bluetooth permissions if necessary.
            bleMode = BleMode.MDocPeripheralServer,
            onRequestReceived = { _, requests, e ->
                // Step 2.2: Handle the presentation request
                if (e == null && !requests.isNullOrEmpty()) {
                    // Using only the first request for simplicity
                    SharedData.proximityPresentationRequest = requests.first()
                    withContext(Dispatchers.Main) {
                        navController.navigate("presentationSelectCredentials")
                    }
                } else {
                    val msg = "Error while retrieving the request"
                    withContext(Dispatchers.Main) {
                        Toast.makeText(activity, msg, Toast.LENGTH_SHORT).show()
                    }
                }
            }
        )
    }

    LaunchedEffect(session, containerSize) {
        // Step 1.6: Generate a QR code
        qrCode = session?.deviceEngagement?.toQrCode(containerSize)
    }

    Box(
        modifier = Modifier
            .aspectRatio(1f)
            .onSizeChanged { containerSize = it }
    ) {
        qrCode?.let {
            Image(
                bitmap = it.asImageBitmap(),
                contentDescription = "A QR Code",
                modifier = Modifier.fillMaxSize()
            )
        }
    }
}

// Step 1.5: Create function to generate QR Code from String
private fun String.toQrCode(size: IntSize): Bitmap? {
    if (this.isEmpty() || size == IntSize.Zero) return null

    val (width, height) = size
    return Bitmap.createBitmap(width, height, Bitmap.Config.RGB_565).apply {
        val hints = mapOf(EncodeHintType.ERROR_CORRECTION to ErrorCorrectionLevel.M)
        val encoded = BarcodeEncoder()
            .encode(this@toQrCode, BarcodeFormat.QR_CODE, width, height, hints)

        for (x in 0 until width) {
            for (y in 0 until height) {
                setPixel(x, y, if (encoded[x, y]) Color.BLACK else Color.WHITE)
            }
        }
    }
}
