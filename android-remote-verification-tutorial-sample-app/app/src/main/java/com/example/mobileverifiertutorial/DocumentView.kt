package com.example.mobileverifiertutorial

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import global.mattr.mobilecredential.verifier.dto.MobileCredentialPresentation

// MARK: - Section: Display Results (Step 4)
// Renders a single received mDoc as a Material card showing:
// - The document type (e.g. org.iso.18013.5.1.mDL)
// - The overall verification status (Verified / Invalid), colored
// - The flat list of claims that were returned
@Composable
fun DocumentView(document: MobileCredentialPresentation, modifier: Modifier = Modifier) {
    val verified: Boolean = document.verificationResult.verified
    val statusText: String = if (verified) "Verified" else "Invalid"
    val statusColor: Color = if (verified) Color.Green else Color.Red
    val flatClaims: List<String> = document.claims?.flatMap { (_, claimsMap) ->
        claimsMap.map { (claim, value) -> "$claim: ${value.value}" }
    } ?: emptyList()

    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = document.docType,
                color = Color.Black,
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = statusText,
                color = statusColor,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold
            )
            Spacer(modifier = Modifier.height(12.dp))
            if (flatClaims.isEmpty()) {
                Text(
                    text = "No claims",
                    color = Color.Black,
                    style = MaterialTheme.typography.labelMedium,
                )
            } else {
                flatClaims.forEach { line ->
                    Text(
                        text = line,
                        color = Color.Black,
                        style = MaterialTheme.typography.labelMedium
                    )
                }
            }
        }
    }
}
