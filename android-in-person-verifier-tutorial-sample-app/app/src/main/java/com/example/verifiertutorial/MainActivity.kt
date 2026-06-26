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
import global.mattr.mobilecredential.common.platformconfig.PlatformConfiguration
import global.mattr.mobilecredential.verifier.exception.VerifierException.FailedToRegisterException
import global.mattr.mobilecredential.verifier.exception.VerifierException.InvalidLicenseException
import kotlinx.coroutines.launch
import java.net.URL

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // The SDK must be initialized before any other SDK functions are called.
        // Initialize SDK - Step 1.1: Initialize the SDK
        lifecycleScope.launch {
            // From Android Verifier SDK v7.0.0, the SDK is tethered to a MATTR VII tenant. Initialization
            // registers this app instance with the tenant and obtains a license, so a PlatformConfiguration
            // pointing at your tenant and Verifier Application is required.
            val platformConfiguration = PlatformConfiguration(
                tenantHost = URL("https://your-tenant.vii.mattr.global"),
                applicationId = "<YOUR_VERIFIER_APPLICATION_ID>"
            )
            try {
                // This function initializes storage, registers the app instance, obtains a license,
                // and performs validations to ensure the SDK is ready for use.
                MobileCredentialVerifier.initialize(this@MainActivity, platformConfiguration)
                // Setup certificates - Step 2.1: Add trusted issuer certificates
                // The added certificates will be the trust chain roots used to verify signatures of the received credentials.
                MobileCredentialVerifier.addTrustedIssuerCertificates(listOf(Iacas.mattrLabs))
            } catch (e: FailedToRegisterException) {
                // Registration with the MATTR VII tenant failed — check connectivity and configuration.
            } catch (e: InvalidLicenseException) {
                // The SDK license is missing, invalid, or expired.
            }
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