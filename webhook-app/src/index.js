import 'dotenv/config'
import express from 'express'
import { verifyRequest } from '@mattrglobal/http-signatures'

const PORT = process.env.PORT || 3000
const MATTR_TENANT_URL = process.env.MATTR_TENANT_URL
const MATTR_WEBHOOK_ID = process.env.MATTR_WEBHOOK_ID

if (!MATTR_TENANT_URL) {
  throw new Error('MATTR_TENANT_URL is not configured')
}
if (!MATTR_WEBHOOK_ID) {
  throw new Error('MATTR_WEBHOOK_ID is not configured')
}

/* Fetch JWKS from MATTR tenant for webhook signature verification
 * 
 * The JWKS is relatively static and does only change in rare occasions, like
 * key rotations. We only fetch the JWKS once on startup of the app.
 *
 * The @mattrglobal/http-signatures package is used to verify the HTTP Signature.
 * It expects a map, using the key ID (kid) as keys, and a value with a 'key' field
 * containing the JWK:
 *
 *   { 
 *     [keyId]: { key: jwk } 
 *   }
 */
const jwksUrl = `${MATTR_TENANT_URL}/v1/webhooks/jwks`
const response = await fetch(jwksUrl)
if (!response.ok) {
  throw new Error(`Failed to fetch JWKS: ${response.status} ${response.statusText}`)
}
const jwks = await response.json()

const keyMap = Object.fromEntries(jwks.keys.map((key) => [key.kid, { key }]))

console.log(`Successfully fetched webhook JWKS from ${jwksUrl}`)

/* Setup ExpressJS app to receive webhook events
 *
 * This ExpressJS app will expose an endpoint to receive the webhook. It needs to 
 * be publicly available and be registered with MATTR VII. 
 *
 * This sample app is using 'ngrok' to create a public tunnel to this app, check 
 * 'src/tunnel.js'.
 */
const app = express()
app.use(express.text({ type: 'application/json' }))

app.post('/webhook', async (req, res) => {
  const webhookData = JSON.parse(req.body)

  console.log('\n--- Webhook Start ---')
  console.log('')

  try {
    const verifyResult = await verifyRequest({
      request: req,
      verifier: { keyMap },
      data: req.body,
    })

    if (verifyResult.isErr()) {
      console.error('Signature verification failed:', verifyResult.error)
    } else if (webhookData.webhookId !== MATTR_WEBHOOK_ID) {
      console.error(`Webhook verification failed: Webhook ID mismatch. Received '${webhookData.webhookId}', expected: '${MATTR_WEBHOOK_ID}'`)
    } else {
      /* The webhook data has been validated and can be used for further
       * processing as required by your application.
       */
      console.log('Webhook verified successfully!\n')
      console.log('Webhook data:', webhookData)
    }
  } catch (error) {
    console.error('Error processing webhook:', error)
  }

  console.log('\n--- Webhook End ---\n')
  res.sendStatus(200)
})

/* Start webhook app */
const server = app.listen(PORT, () => {
  console.log(`Webhook receiver listening on port ${PORT}`)
})

/* Register an error listener for debugging purposes */
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please use another port via the PORT environment variable.`)
  } else {
    console.error('Server error:', error.message)
  }
  process.exit(1)
})
