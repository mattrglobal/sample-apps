'use client'

// Step 3.2 - Add dependencies
import * as MATTRVerifierSDK from '@mattrglobal/verifier-sdk-web'
import { useCallback, useEffect, useState } from 'react'

export default function Home() {
  // Step 5.1 - Store results state
  const [results, setResults] = useState<MATTRVerifierSDK.PresentationSessionResult | null>(null)

  // Step 6.1 - Create createRequest function
  async function createRequest() {
    const response = await fetch('/api/request', { method: 'POST' })
    const { challenge } = await response.json()
    return challenge
  }

  // Step 6.3 - Create retrieveResults function
  const retrieveResults = useCallback(async (id: string) => {
    const response = await fetch(`api/results/${id}`)
    const { results } = await response.json()
    setResults(results as MATTRVerifierSDK.PresentationSessionResult)
  }, [])

  // Step 4.1 - Create requestCredentials function
  const requestCredentials = useCallback(async () => {
    const credentialQuery = {
      profile: MATTRVerifierSDK.OpenidPresentationCredentialProfileSupported.MOBILE,
      docType: 'org.iso.18013.5.1.mDL',
      nameSpaces: {
        'org.iso.18013.5.1': {
          age_over_18: {},
          given_name: {},
          family_name: {},
          portrait: {}
        }
      }
    } as MATTRVerifierSDK.CredentialQuery

    // Step 4.2 - Add credential request
    const options: MATTRVerifierSDK.RequestCredentialsOptions = {
      credentialQuery: [credentialQuery],
      // Step 6.2 - Use challenge from backend
      challenge: await createRequest(),
      openid4vpConfiguration: {
        walletProviderId: process.env.NEXT_PUBLIC_WALLET_PROVIDER_ID,
        redirectUri: window.location.origin
      }
    }

    const results = await MATTRVerifierSDK.requestCredentials(options)

    // Step 5.2 - Retrieve cross-device verification results
    if (results.isOk()) {
      // Step 6.4 - Call retrieveResults function on cross-device workflow
      retrieveResults(results.value.sessionId);
    } else {
      alert(`Error retrieving results: ${results.error.message}`)
    }
  }, [retrieveResults]) // requestCredentials dependency array

  // Step 5.3 - Handle same-device redirect
  const handleRedirect = useCallback(async () => {
    const results = await MATTRVerifierSDK.handleRedirectCallback()

    if (results.isOk()) {
      // Step 6.5 - Call retrieveResults function on same-device redirect
      retrieveResults(results.value.sessionId);
    } else {
      alert(`Error retrieving results: ${results.error.message}`)
      return
    }
  }, [retrieveResults]) // handleRedirect dependency array

  // Step 3.3 - Initialize the SDK
  useEffect(() => {
    MATTRVerifierSDK.initialize({
      apiBaseUrl: process.env.NEXT_PUBLIC_TENANT_URL as string,
      applicationId: process.env.NEXT_PUBLIC_APPLICATION_ID as string,
    })
  }, [])

  // Step 5.4 - Add effect to handle redirect
  useEffect(() => {
    if (window.location.hash) {
      handleRedirect()
    }
  }, [handleRedirect])

  return (
    <div className="max-w-2xl mt-12 mx-auto px-8">
      <h1 className="text-3xl font-bold my-8">mDocs Online Verification Tutorial</h1>
      {/* Step 4.3 - Add request button */}
      <button
        onClick={requestCredentials}
        className="px-4 py-2 rounded border-2 border-black font-bold cursor-pointer"
      >
        Request Credential
      </button>
      {/* Step 5.5 - Render results */}
      <h2 className="text-xl font-bold mt-8 mb-4">Results</h2>
      {!results && 'No results available'}
      {
        results && 'credentials' in results && (
          <div className="flex flex-col gap-2">
            <div className="flex flex-row">
              <div className="w-1/3 font-bold">Verification Result</div>
              <div className="w-2/3">
                {results.credentials?.[0].verificationResult.verified
                  ? 'verified'
                  : 'not verified'}
              </div>
            </div>
            <div className="flex flex-row">
              <div className="w-1/3 font-bold">Valid Until</div>
              <div className="w-2/3">{results.credentials?.[0].validityInfo?.validUntil}</div>
            </div>
            <div className="flex flex-row">
              <div className="w-1/3 font-bold">Issuer</div>
              <div className="w-2/3">{results.credentials?.[0].issuerInfo?.commonName}</div>
            </div>
            <div className="flex flex-row">
              <div className="w-1/3 font-bold">Given Name</div>
              <div className="w-2/3">
                {(results.credentials?.[0].claims?.['org.iso.18013.5.1'].given_name
                  .value as string) ?? ''}
              </div>
            </div>
            <div className="flex flex-row">
              <div className="w-1/3 font-bold">Age over 18</div>
              <div className="w-2/3">
                {results.credentials?.[0].claims?.['org.iso.18013.5.1'].age_over_18.value
                  ? 'Yes'
                  : 'No'}
              </div>
            </div>
          </div>
        )
      }
      {
        results && 'error' in results && (
          <div className="flex flex-row">
            <div className="w-1/3 font-bold">{results.error.type}</div>
            <div className="w-2/3">{results.error.message}</div>
          </div>
        )
      }
    </div>
  )
}
