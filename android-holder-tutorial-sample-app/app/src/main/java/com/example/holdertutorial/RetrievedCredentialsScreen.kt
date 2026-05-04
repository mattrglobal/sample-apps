package com.example.holdertutorial

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import global.mattr.mobilecredential.holder.deviceretrieval.deviceresponse.NameSpace
import global.mattr.mobilecredential.holder.dto.MobileCredentialElement

@Composable
fun RetrievedCredentialsScreen() {
    if (SharedData.retrievedCredentials.isEmpty()) {
        Text("No credentials received")
    } else {
        Column {
            Text(
                "Retrieved Credentials",
                modifier = Modifier.fillMaxWidth(),
                style = MaterialTheme.typography.titleLarge
            )

            LazyColumn(Modifier.fillMaxWidth()) {
                items(SharedData.retrievedCredentials, key = { it.id }) { credential ->
                    Document(
                        credential.docType,
                        credential.claims.mapValues { (_, claims) ->
                            claims.map { (name, value) -> "$name: ${value.toUiString()}" }.toSet()
                        }
                    )
                }
            }
        }
    }
}

@Composable
fun Document(docType: String, namespacesAndClaims: Map<NameSpace, Set<String>>) {
    Column(Modifier.fillMaxWidth().padding(6.dp)) {
        Text(docType, Modifier.padding(6.dp), style = MaterialTheme.typography.titleMedium)
        namespacesAndClaims.forEach { (namespace, claims) ->
            Text(namespace, Modifier.padding(6.dp), style = MaterialTheme.typography.titleSmall)
            Column(
                Modifier
                    .padding(6.dp)
                    .fillMaxWidth()
                    .background(MaterialTheme.colorScheme.background, RoundedCornerShape(6.dp))
                    .padding(6.dp)
            ) {
                claims.forEach { claim -> Text(claim) }
            }
        }
    }
}

fun MobileCredentialElement.toUiString() = when (this) {
    is MobileCredentialElement.ArrayElement, is MobileCredentialElement.DataElement,
    is MobileCredentialElement.MapElement -> this::class.simpleName ?: "Unknown element"

    else -> value.toString()
}