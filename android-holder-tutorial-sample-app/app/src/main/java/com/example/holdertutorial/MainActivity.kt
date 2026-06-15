package com.example.holdertutorial

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.lifecycleScope
import androidx.navigation.NavController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navDeepLink
import com.example.holdertutorial.ui.theme.HolderTutorialTheme
import global.mattr.mobilecredential.holder.dto.MobileCredential
import global.mattr.mobilecredential.holder.MobileCredentialHolder
import global.mattr.mobilecredential.holder.ProximityPresentationSession
import global.mattr.mobilecredential.holder.issuance.CredentialIssuanceConfiguration
import global.mattr.mobilecredential.holder.issuance.dto.DiscoveredCredentialOffer
import global.mattr.mobilecredential.holder.issuance.dto.RetrieveCredentialResult
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        // Claim Credential - Step 1.2: Initialize the SDK
        lifecycleScope.launch {
            try {
                // This function initializes storage and performs validations to ensure the SDK is ready for use.
                // Application context is derived from the passed context and persisted.
                // redirectUri must be registered during initialization and in the manifest file for the credential issuance workflow to be able to redirect the user back to the application.
                // autoTrustMobileCredentialIaca is an optional parameter that, when set to true, will automatically trust any IACAs received during the credential issuance flow.
                // This is not recommended for production applications, but can be useful for the quickstart.
                MobileCredentialHolder.getInstance().initialize(
                    context = this@MainActivity,
                    // Step 4.1: Add credential issuance configuration
                    credentialIssuanceConfiguration = CredentialIssuanceConfiguration(
                        redirectUri = "io.mattrlabs.sample.mobilecredentialtutorialholderapp:" +
                                "//credentials/callback",
                        autoTrustMobileCredentialIaca = true
                    )
                )
            } catch (e: Exception) {
                Log.e("MainActivity", "SDK initialization failed", e)
            }
        }

        setContent {
            HolderTutorialTheme {
                val navController = rememberNavController()
                Scaffold { innerPadding ->
                    NavHost(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(innerPadding)
                            .padding(8.dp),
                        startDestination = "home",
                        navController = navController,
                    ) {
                        composable("home") {
                            HomeScreen(this@MainActivity, navController)
                        }
                        composable("scanOffer") {
                            // Claim Credential - Step 2.5: Add "Scan Offer" screen call
                            ScanOfferScreen(navController)
                        }
                        composable("retrievedCredential") {
                            // Claim Credential - Step 4.9: Add "Retrieved Credential" screen call
                            RetrievedCredentialsScreen()
                        }
                        composable("presentationQr") {
                            // Proximity Presentation - Step 1.2: Add "QR Presentation" screen call
                            PresentationQrScreen(this@MainActivity, navController)
                        }
                        composable("presentationSelectCredentials") {
                            // Proximity Presentation - Step 2.6: Add "Select Credential" screen call
                            PresentationSelectCredentialsScreen(this@MainActivity)
                        }
                        // Online Presentation - Step 2.2: Add "Online Presentation" screen call
                        composable(
                            "onlinePresentation",
                            deepLinks = listOf(
                                navDeepLink { uriPattern = "mdoc-openid4vp://{wildcard}" }
                            )
                        ) {
                            @Suppress("DEPRECATION")
                            val deepLink = it.arguments
                                ?.getParcelable<Intent>(NavController.KEY_DEEP_LINK_INTENT)
                                ?.data
                                ?.toString() ?: ""

                            OnlinePresentationScreen(this@MainActivity, deepLink)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun HomeScreen(activity: Activity, navController: NavController) {
    val coroutineScope = rememberCoroutineScope()
    var transactionCode by remember { mutableStateOf("") }

    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Button(onClick = { navController.navigate("scanOffer") }, Modifier.fillMaxWidth()) {
            Text("Claim Credential")
        }

        // Proximity Presentation - Step 1.3: Add button for starting the credentials presentation workflow
        Button(onClick = { navController.navigate("presentationQr") }, Modifier.fillMaxWidth()) {
            Text("Present Credentials")
        }

        // Claim Credential - Step 3.3: Display discovered credential offer
        SharedData.discoveredCredentialOffer?.let { discoveredOffer ->
            Text("Received Credential Offer from ${discoveredOffer.issuer}")
            LazyColumn(Modifier.fillMaxWidth()) {
                items(discoveredOffer.credentials, key = { it.docType }) { credential ->
                    Card(Modifier.fillMaxWidth()) {
                        Column(Modifier.padding(4.dp)) {
                            Text("Name: ${credential.name ?: ""}")
                            Text("DocType: ${credential.docType}")
                        }
                    }
                }
            }

            // Claim Credential - Step 4.3: Add transaction code input
            if (discoveredOffer.transactionCode != null) {
                OutlinedTextField(
                    value = transactionCode,
                    onValueChange = { transactionCode = it },
                    label = { Text("Transaction Code") },
                    modifier = Modifier.fillMaxWidth()
                )
            }

            // Claim Credential - Step 4.5: Add consent button
            Spacer(Modifier.weight(1f))
            Button(
                onClick = {
                    onRetrieveCredentials(coroutineScope, activity, navController, transactionCode)
                },
                Modifier.fillMaxWidth()
            ) { Text("Consent and retrieve Credential(s)") }
        }
    }
}

// Claim Credential - Step 4.4: Create function to retrieve credentials
private fun onRetrieveCredentials(
    coroutineScope: CoroutineScope,
    activity: Activity,
    navController: NavController,
    transactionCode: String
) {
    coroutineScope.launch {
        try {
            val mdocHolder = MobileCredentialHolder.getInstance()
            // Each of the credential retrieval results contains:
            // - Credential document type.
            // - Either the credential ID, that can be now used to access the credential from the local storage (see code below), OR
            //   an error if the credential retrieval failed.
            val retrieveCredentialResults = mdocHolder.retrieveCredentials(
                activity,
                SharedData.scannedOffer!!,
                clientId = "android-mobile-credential-tutorial-holder-app",
                transactionCode = transactionCode
            )

            // Claim Credential - Step 4.6: Display retrieved credentials
            // RetrieveCredentialResult is a sealed interface with Success and Failure variants.
            SharedData.retrievedCredentials = retrieveCredentialResults.mapNotNull { result ->
                when (result) {
                    is RetrieveCredentialResult.Success -> try {
                        // The credential ID can be used to get the full credential from the SDK storage.
                        // fetchUpdatedStatusList - Whether to enforce the online revocation status check for the credential.
                        // Returned object contains all credential data, including the user's PII.
                        mdocHolder.getCredential(result.credentialId, fetchUpdatedStatusList = false)
                    } catch (e: Exception) {
                        val msg = "Failed to get credential from storage"
                        Toast.makeText(activity, msg, Toast.LENGTH_SHORT).show()
                        null
                    }
                    is RetrieveCredentialResult.Failure -> {
                        val msg = "Failed to retrieve ${result.docType}: ${result.error}"
                        Toast.makeText(activity, msg, Toast.LENGTH_SHORT).show()
                        null
                    }
                }
            }

            navController.navigate("retrievedCredential")
            SharedData.discoveredCredentialOffer = null
        } catch (e: Exception) {
            Toast.makeText(activity, "Failed to retrieve credentials", Toast.LENGTH_SHORT).show()
        }
    }
}

object SharedData {
    // Claim Credential - Step 3.1: Add discovered credential offer variables
    var scannedOffer: String? = null
    var discoveredCredentialOffer: DiscoveredCredentialOffer? = null
    // Claim Credential - Step 4.2: Add retrieved credentials variable
    var retrievedCredentials: List<MobileCredential> = emptyList()
    // Proximity Presentation - Step 2.1: Add proximity presentation request variable
    var proximityPresentationRequest: ProximityPresentationSession.CredentialRequestInfo? = null
}