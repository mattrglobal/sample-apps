package com.example.mobileverifiertutorial

import android.app.Activity
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.tooling.preview.Preview
import androidx.lifecycle.ViewModel
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.mobileverifiertutorial.ui.theme.MobileVerifierTutorialTheme
import global.mattr.mobilecredential.verifier.MobileCredentialVerifier
import global.mattr.mobilecredential.verifier.OnlinePresentationSessionResult
import global.mattr.mobilecredential.common.platformconfig.PlatformConfiguration
import global.mattr.mobilecredential.verifier.deviceretrieval.devicerequest.DataElements
import global.mattr.mobilecredential.verifier.deviceretrieval.devicerequest.NameSpaces
import global.mattr.mobilecredential.verifier.dto.MobileCredentialPresentation
import global.mattr.mobilecredential.verifier.dto.MobileCredentialRequest
import global.mattr.mobilecredential.verifier.exception.VerifierException.FailedToRegisterException
import global.mattr.mobilecredential.verifier.exception.VerifierException.InvalidLicenseException
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import java.net.URL

// MARK: - Section: Initialize the SDK (Step 2)
// MainActivity hosts the verifier UI and initializes the MobileCredentialVerifier SDK on
// startup. The remote workflow uses a single Activity: a "Request credentials" button
// kicks off the OID4VP presentation request, the OS hands off to a compliant wallet app,
// and the wallet eventually redirects back via the deep link declared in AndroidManifest.xml.
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MobileVerifierTutorialTheme {
                Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
                    Content(
                        modifier = Modifier.padding(innerPadding)
                    )
                }
            }
        }

        // Step 2.3: Setup platform configuration with the MATTR VII tenant host and Verifier
        // Application id. From Android Verifier SDK v7.0.0, the applicationId is supplied here (it is
        // no longer passed to requestMobileCredentials) and also drives SDK Tethering.
        val platformConfiguration = PlatformConfiguration(
            tenantHost = URL(Constants.TENANT_HOST),
            applicationId = Constants.APPLICATION_ID
        )

        // Step 2.4: Initialize the SDK. Must complete before any other SDK calls. Initialization
        // registers the app instance with the tenant and obtains a license, so it can throw
        // FailedToRegisterException and InvalidLicenseException.
        lifecycleScope.launch {
            try {
                MobileCredentialVerifier.initialize(
                    context = this@MainActivity, platformConfiguration = platformConfiguration
                )
            } catch (e: FailedToRegisterException) {
                // Registration with the MATTR VII tenant failed — check connectivity and configuration.
            } catch (e: InvalidLicenseException) {
                // The SDK license is missing, invalid, or expired.
            }
        }
    }
}

@Composable
fun Content(modifier: Modifier = Modifier) {
    val activity = (LocalContext.current) as Activity
    val viewModel: VerifierViewModel = viewModel()

    val documents by viewModel.receivedDocuments.collectAsState()

    Column(
        modifier = modifier.fillMaxSize(),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Button(onClick = {
            viewModel.requestCredentials(activity)
        }) {
            Text("Request credentials")
        }
        // Step 4.5: Render any received documents.
        LazyColumn(modifier = Modifier.fillMaxWidth()) {
            items(documents) { document ->
                DocumentView(document)
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun ContentPreview() {
    MobileVerifierTutorialTheme {
        Content()
    }
}

// MARK: - VerifierViewModel
// Holds the credential request definition, kicks off the presentation, and exposes the
// list of received documents to the UI as a StateFlow.
class VerifierViewModel : ViewModel() {
    private val _receivedDocuments =
        MutableStateFlow<List<MobileCredentialPresentation>>(emptyList())
    val receivedDocuments: StateFlow<List<MobileCredentialPresentation>> = _receivedDocuments

    fun requestCredentials(activity: Activity) {
        // Step 3.1: Build the MobileCredentialRequest. docType selects the credential type
        // and namespaces declares which claims to request. Each claim's boolean flag
        // indicates whether the verifier intends to retain (persist) the value.
        val mobileCredentialRequest = MobileCredentialRequest(
            docType = "org.iso.18013.5.1.mDL", namespaces = NameSpaces(
                mapOf(
                    "org.iso.18013.5.1" to DataElements(
                        mapOf(
                            "family_name" to false, "given_name" to false, "birth_date" to false
                        )
                    )
                )
            )
        )

        viewModelScope.launch {
            _receivedDocuments.value = emptyList()
            try {
                // Step 3.2: Request credentials. The SDK launches the wallet via OID4VP and
                // suspends until the wallet redirects back via the deep link registered in
                // AndroidManifest.xml, at which point the response is returned here.
                // From v7.0.0, applicationId is no longer passed here — it comes from the
                // PlatformConfiguration supplied at initialization.
                val onlinePresentationResult = MobileCredentialVerifier.requestMobileCredentials(
                    activity = activity,
                    request = listOf(mobileCredentialRequest)
                )

                // Step 4.2: Surface the verified credentials to the UI. From v7.0.0,
                // OnlinePresentationSessionResult is a sealed interface with Success/Failure variants.
                _receivedDocuments.value = when (onlinePresentationResult) {
                    is OnlinePresentationSessionResult.Success ->
                        onlinePresentationResult.mobileCredentialResponse?.credentials ?: emptyList()
                    is OnlinePresentationSessionResult.Failure -> {
                        // onlinePresentationResult.error is available here.
                        emptyList()
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }
}
