package com.example.holdertutorial

import android.app.Activity
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.example.holdertutorial.Document
import com.example.holdertutorial.toUiString
import global.mattr.mobilecredential.holder.deviceretrieval.devicerequest.DataElements
import global.mattr.mobilecredential.holder.deviceretrieval.deviceresponse.NameSpace
import global.mattr.mobilecredential.holder.dto.MobileCredential
import global.mattr.mobilecredential.holder.dto.MobileCredentialMetaData
import global.mattr.mobilecredential.holder.MobileCredentialHolder
import global.mattr.mobilecredential.holder.onlinepresentation.OnlinePresentationSession
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

@Composable
fun OnlinePresentationScreen(activity: Activity, requestUri: String) {
    var session: OnlinePresentationSession? by remember { mutableStateOf(null) }

    // Step 2.1: Create an online presentation session
    LaunchedEffect(requestUri) {
        withContext(Dispatchers.IO) {
            // A simple quickstart code to wait until the SDK is initialized.
            // Useful for cases when the application is started from the online presentation Intent.
            val mdocHolder = MobileCredentialHolder.getInstance()
            while (!mdocHolder.initialized) delay(100)

            // Start an online presentation session.
            // requireTrustedVerifier = false - Trust any verifier without validating against the trusted verifier list.
            //  Not recommended for production, but useful for quickstart.
            session = mdocHolder
                .createOnlinePresentationSession(requestUri, requireTrustedVerifier = false)
        }
    }

    // session.matchedCredentials - Map that pairs credential requests to lists of the stored credentials that match those requests.
    // Credentials in the list will only contain the requested claim names (e.g. "given_name", "family_name") without values.
    // Values can be retrieved from storage by calling getCredential() with the credential id.
    val (requested, matched) = session?.matchedCredentials?.entries?.firstOrNull() ?: return

    var matchedCredentials by remember { mutableStateOf(matched) }
    var selectedCredentialId by remember { mutableStateOf(matchedCredentials.first().id) }
    val coroutineScope = rememberCoroutineScope()

    Column(Modifier.verticalScroll(rememberScrollState())) {
        Text("REQUESTED DATA", style = MaterialTheme.typography.titleLarge)
        Card(Modifier.padding(vertical = 8.dp)) {
            Document(requested.docType, requested.namespaces.value.toUi())
        }
        Spacer(Modifier.padding(12.dp))

        Text("MATCHED CREDENTIALS", style = MaterialTheme.typography.titleLarge)
        Spacer(Modifier.padding(6.dp))
        matchedCredentials.forEach { matchedCredential ->
            // Step 3.2: Display matching credentials and claims
            val borderWidth = if (matchedCredential.id == selectedCredentialId) 4.dp else 0.dp
            Column(
                Modifier
                    .clickable { selectedCredentialId = matchedCredential.id }
                    .border(borderWidth, Color.Blue, RoundedCornerShape(16.dp))
                    .padding(8.dp)
            ) {
                Card(Modifier.fillMaxWidth()) {
                    Document(matchedCredential.docType, matchedCredential.claims)
                }

                Button(
                    onClick = {
                        // Get the credential with PII from the local storage.
                        val credentialWithValues = MobileCredentialHolder.getInstance()
                            .getCredential(matchedCredential.id, fetchUpdatedStatusList = false)

                        // Use PII values (e.g. "John", "Smith") to update the matched credentials list for display.
                        matchedCredentials =
                            matchedCredentials.withClaimValues(from = credentialWithValues)
                    },
                    Modifier.fillMaxWidth()
                ) { Text("Show Values") }
            }
            Spacer(Modifier.padding(12.dp))
        }

        // Step 4.1: Send response
        Button(
            onClick = {
                coroutineScope.launch {
                    session?.sendResponse(listOf(selectedCredentialId), activity)
                }
            },
            Modifier.fillMaxWidth()
        ) { Text("Send Response") }
    }
}

// Step 3.1: Create function to add values to claims
private fun List<MobileCredentialMetaData>.withClaimValues(
    from: MobileCredential
): List<MobileCredentialMetaData> = map { credential ->
    if (credential.id != from.id) {
        credential
    } else {
        credential.copy(
            claims = credential.claims.mapValues { (namespace, claims) ->
                claims.map { claim ->
                    val claimValue = from.claims[namespace]?.get(claim)
                    claimValue?.let { "$claim: ${it.toUiString()}" } ?: claim
                }.toSet()
            }
        )
    }
}

private fun Map<NameSpace, DataElements>.toUi() = mapValues { (_, dataElements) ->
    dataElements.value.keys.toSet()
}