package com.example.verifiertutorial

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.lifecycleScope
import androidx.navigation.NavController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.verifiertutorial.ui.theme.VerifierTutorialTheme
import global.mattr.mobilecredential.verifier.dto.MobileCredentialResponse
import global.mattr.mobilecredential.verifier.MobileCredentialVerifier
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // The SDK must be initialized before any other SDK functions are called.
        // Initialize SDK - Step 1.1: Initialize the SDK
        lifecycleScope.launch {
            // This function initializes storage and performs validations to ensure the SDK is ready for use.
            // Only the application context is persisted.
            MobileCredentialVerifier.initialize(this@MainActivity)
            // Setup certificates - Step 2.1: Add trusted issuer certificates
            // The added certificates will be the trust chain roots used to verify signatures of the received credentials.
            MobileCredentialVerifier.addTrustedIssuerCertificates(listOf(Iacas.mattrLabs))
        }

        enableEdgeToEdge()
        setContent {
            VerifierTutorialTheme {
                val navController = rememberNavController()

                NavHost(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(vertical = 72.dp, horizontal = 8.dp),
                    startDestination = "home",
                    navController = navController,
                ) {
                    // Landing screen with navigation buttons
                    composable("home") {
                        HomeScreen(navController)
                    }

                    // Verify mDocs - Step 1.7: Add "Scan QR" screen call
                    // Scans a holder's QR code and initiates the proximity presentation workflow (Tutorial: "Verify mDocs")
                    composable("scanQr") {
                        ScanQrScreen(this@MainActivity, navController)
                    }

                    // Verify mDocs - Step 4.4: Add "View Response" screen call
                    // Displays the verification results after a credential is received (Tutorial: "Verify mDocs" Step 4)
                    composable("viewResponse") {
                        ViewResponseScreen()
                    }
                }
            }
        }
    }
}

@Composable
fun HomeScreen(navController: NavController) {
    Column(modifier = Modifier.fillMaxWidth()) {
        Button(
            modifier = Modifier.fillMaxWidth(),
            onClick = { navController.navigate("scanQr") }
        ) {
            Text("Scan QR Code")
        }
    }
}

// Verify mDocs - Step 2.2: Add shared data
/** Holds state that needs to be shared across multiple screens. */
object SharedData {

    /** Stores the response received after the proximity presentation workflow completes. */
    var credentialResponse: MobileCredentialResponse? = null
}