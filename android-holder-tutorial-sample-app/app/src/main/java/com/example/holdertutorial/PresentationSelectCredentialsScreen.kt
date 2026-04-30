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
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import global.mattr.mobilecredential.holder.deviceretrieval.devicerequest.DataElements
import global.mattr.mobilecredential.holder.deviceretrieval.deviceresponse.NameSpace
import global.mattr.mobilecredential.holder.dto.MobileCredential
import global.mattr.mobilecredential.holder.dto.MobileCredentialMetaData
import global.mattr.mobilecredential.holder.MobileCredentialHolder
import kotlinx.coroutines.launch

@Composable
fun PresentationSelectCredentialsScreen(activity: Activity) {
    val request = SharedData.proximityPresentationRequest ?: return

    // Lists of the stored credentials that match the Verifier's request.
    // Credentials in the list will only contain the requested claim names (e.g. "given_name", "family_name") without values.
    // Values can be retrieved from storage by calling getCredential() with the credential id.
    var matchedCredentials by remember { mutableStateOf(request.matchedCredentials) }
    var selectedCredentialId by remember { mutableStateOf(matchedCredentials.first().id) }
    val coroutineScope = rememberCoroutineScope()

    Column(Modifier.verticalScroll(rememberScrollState())) {
        Text("REQUESTED DATA", style = MaterialTheme.typography.titleLarge)
        Card(Modifier.padding(vertical = 8.dp)) {
            Document(request.request.docType, request.request.namespaces.value.toUi())
        }
        Spacer(Modifier.padding(12.dp))

        Text("MATCHED CREDENTIALS", style = MaterialTheme.typography.titleLarge)
        Spacer(Modifier.padding(6.dp))
        matchedCredentials.forEach { matchedCredential ->
            // Step 2.5: Display matching credentials and claims
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

        // Step 3.2: Send response
        Button(
            onClick = {
                coroutineScope.launch { sendResponse(selectedCredentialId, activity) }
            },
            Modifier.fillMaxWidth()
        ) { Text("Send Response") }
    }
}

// Step 2.4: Create function to add values to claims
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

// Step 3.1: Create function to send the credential response
private suspend fun sendResponse(credentialId: String, activity: Activity) {
    MobileCredentialHolder.getInstance()
        .getCurrentProximityPresentationSession()
        ?.sendResponse(listOf(credentialId), activity)
}