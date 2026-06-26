package com.example.verifiertutorial

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.example.verifiertutorial.SharedData
import global.mattr.mobilecredential.verifier.deviceretrieval.deviceresponse.DataElementIdentifier
import global.mattr.mobilecredential.verifier.deviceretrieval.deviceresponse.NameSpace
import global.mattr.mobilecredential.verifier.dto.MobileCredentialElement

/**
 * ViewResponseScreen implements the "Verify mDocs — Step 4: Display verification results" section of the tutorial.
 */
@Composable
fun ViewResponseScreen() {
    // Verify mDocs - Step 4.5: Define content
    // For tutorial simplicity, only the first credential in the response is displayed, since the sample request only asks for a single document type (mDL).
    // From Android Verifier SDK v7.0.0, MobileCredentialResponse.credentials and .credentialErrors
    // are non-nullable lists, so we check for emptiness rather than null.
    val credential = SharedData.credentialResponse?.credentials?.firstOrNull()
    if (credential == null || SharedData.credentialResponse?.credentialErrors?.isNotEmpty() == true) {
        // Verify mDocs - Step 4.6: Show error
        // Show an error if something went wrong during the retrieval
        Box(Modifier.fillMaxSize()) {
            Text("There were errors while receiving the response", Modifier.align(Alignment.Center))
        }
    } else {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(4.dp),
        ) {
            // Verify mDocs - Step 4.10: Show credential verification status
            // The overall verification status (Verified / Not verified) — indicating whether the credential's chain of trust was validated against the stored IACA certificates.
            val statusStyle = MaterialTheme.typography.titleLarge
            if (credential.verificationResult.verified) {
                Text("Verified", style = statusStyle, color = Color.Green)
            } else {
                Text("Not verified", style = statusStyle, color = Color.Red)
            }

            // Verify mDocs - Step 4.9: Show retrieved claims and errors
            // credential.claims contains the data elements the holder consented to share (e.g. given_name, family_name, birth_date), grouped by namespace.
            Claims("Received claims", credential.claims)
            Spacer(Modifier.padding(8.dp))
            // credential.claimErrors contains data elements that were requested but not provided (absent from credential or consent denied).
            Claims("Failed claims", credential.claimErrors)
        }
    }
}

// Verify mDocs - Step 4.8: Display claims
@Composable
private fun ColumnScope.Claims(
    title: String,
    claims: Map<NameSpace, Map<DataElementIdentifier, Any>>?
) {
    Text(
        title,
        modifier = Modifier
            .fillMaxWidth()
            .align(Alignment.CenterHorizontally),
        style = MaterialTheme.typography.titleLarge
    )
    claims?.forEach { (namespace, claims) ->
        Card {
            Column(Modifier.padding(6.dp)) {
                // Display the namespace (e.g. "org.iso.18013.5.1") as a section title within the card, followed by each claim as a name-value row.
                Text(
                    namespace,
                    style = MaterialTheme.typography.titleMedium,
                    modifier = Modifier.padding(vertical = 4.dp)
                )
                claims.forEach { (name, value) ->
                    Row {
                        // Claim identifier on the left (e.g. "family_name", "birth_date").
                        Text(
                            name,
                            Modifier
                                .weight(1f)
                                .padding(end = 4.dp)
                        )
                        // Claim value on the right, converted to a display string.
                        Text(value.claimToUiString(), overflow = TextOverflow.Ellipsis)
                    }
                }
            }
        }
    } ?: Text("Nothing here")
}

// Verify mDocs - Step 4.7: Map a claim or an error to string
private fun Any.claimToUiString() = when (this) {
    is MobileCredentialElement -> {
        when (this) {
            // Out of the tutorial scope.
            is MobileCredentialElement.ArrayElement, is MobileCredentialElement.DataElement,
            is MobileCredentialElement.MapElement -> this::class.simpleName ?: "Unknown element"

            else -> value.toString()
        }
    }

    else -> "Not returned"
}