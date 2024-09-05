"use client";

import { CredentialConfig } from "@/components/config";
import { Results } from "@/components/results";
import * as MATTRVerifierSDK from "@mattrglobal/verifier-sdk-web";
import type { CredentialQuery } from "@mattrglobal/verifier-sdk-web/dist/typings/verifier/types";
import { useCallback, useEffect, useState } from "react";

const MDL_CREDENTIAL_QUERY = {
  profile: MATTRVerifierSDK.OpenidPresentationCredentialProfileSupported.MOBILE,
  docType: "org.iso.18013.5.1.mDL",
  nameSpaces: {
    "org.iso.18013.5.1": {
      age_over_18: { intentToRetain: true },
      given_name: { intentToRetain: true },
      family_name: { intentToRetain: true },
      portrait: {}, // intentToRetain is false by default
    },
  },
};

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<MATTRVerifierSDK.PresentationSessionResult | null>(null);

  // The apiBaseUrl is the URL of a MATTR verifier tenant. This app is handling the same device
  // flow by loading the results directly after the redirect. If the apiBaseUrl is not provided
  // via an environment variable, you can provide the URL in an input field and it is persisted
  // in localStorage.
  const [apiBaseUrl, setApiBaseUrl] = useState<string | null>(null);
  const [redirectUri, setRedirectUri] = useState<string | null>(null);

  // The app allows the user to edit the credential query, see the CredentialConfig component.
  const [credentialQuery, setCredentialQuery] = useState<{ error: string | null; query: string }>({
    error: null,
    query: JSON.stringify(MDL_CREDENTIAL_QUERY, null, 2),
  });
  const resetCredentialQuery = () =>
    setCredentialQuery({ error: null, query: JSON.stringify(MDL_CREDENTIAL_QUERY, null, 2) });

  // When the app loads, we set the redirect URI and the API base URL.
  useEffect(() => {
    setRedirectUri(window.location.origin);
    setApiBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL || localStorage.getItem("apiBaseUrl"));
  }, []);

  // To request credentials, we need to
  // 1. initialise the SDK,
  // 2. prepare the request options, and
  // 3. call the requestCredentials function
  //
  // The mode is optional. If it is not provided, the SDK will determine the mode by the user
  // agent, using the same device flow for mobile, and the cross device flow otherwise.
  const requestCredentials = useCallback(
    async (mode?: MATTRVerifierSDK.Mode) => {
      try {
        if (!apiBaseUrl || !redirectUri) {
          alert("Verifier tenant URL or redirect URI is missing");
          return;
        }

        MATTRVerifierSDK.initialise({ apiBaseUrl: apiBaseUrl });

        const options: MATTRVerifierSDK.RequestCredentialsOptions = {
          credentialQuery: [JSON.parse(credentialQuery.query) as CredentialQuery],
          challenge: MATTRVerifierSDK.utils.generateChallenge(),
          redirectUri: redirectUri,
          ...(mode && { mode: mode }), // optionally provide the presentation mode
          crossDeviceCallback: {
            onComplete: (callbackResponse) => {
              if ("result" in callbackResponse) {
                setResults(callbackResponse.result);
              }
            },
            onFailure: (error) => {
              if (error.type === "Abort") {
                alert("The request was aborted");
                return;
              }
              alert(`There was an error processing the request - ${error.message}`);
            },
          },
        };

        // Note, this is returning a response containing the session ID. This *does not* already
        // contain the presentation results. The results are retrieved either via the
        // handleRedirectCallback in the same device flow, or in the crossDeviceCallback handlers.
        const response = await MATTRVerifierSDK.requestCredentials(options);

        if ("error" in response) {
          const cause = response.error.cause;
          if (typeof cause === "object" && cause && "status" in cause && cause.status === 404) {
            alert(`Request failed. Please check if your tenant URL is correct: ${apiBaseUrl}`);
          } else {
            alert(
              `Request failed. Please ensure ${redirectUri} is a public domain and is configured on your tenant as a redirect URI`,
            );
          }
        }
      } catch (e) {
        if (e instanceof Error) {
          alert(e.message);
        }
      }
    },
    [redirectUri, apiBaseUrl, credentialQuery],
  );

  // This function wraps the handleRedirectCallback function from the SDK to set the results
  // in the page's state.
  const handleRedirect = useCallback(async () => {
    if (!apiBaseUrl) {
      alert("Verifier tenant URL is missing");
      return;
    }
    MATTRVerifierSDK.initialise({ apiBaseUrl: apiBaseUrl });

    // A single function call handles the redirect callback for the same device flow
    const result = await MATTRVerifierSDK.handleRedirectCallback();
    if (result.isErr()) {
      alert(`Error retrieving results: ${result.error.message}`);
      return;
    }

    const presentationResult = result.value.result;
    if (!("sessionId" in presentationResult) || "error" in presentationResult) {
      alert("Something went wrong");
      return;
    }

    setResults(presentationResult);
    setLoading(false);
  }, [apiBaseUrl]);

  // In the same device flow, we check if URL contains a hash and handle the
  // redirect when the page loads
  useEffect(() => {
    if (window.location.hash && apiBaseUrl !== null) {
      setLoading(true);
      handleRedirect();
    }
  }, [handleRedirect, apiBaseUrl]);

  return (
    <div className="flex flex-col mx-auto max-w-6xl mt-4 p-4 lg:mt-8">
      <h1 className="text-xl font-bold tracking-tight pb-4 lg:pb-8 lg:text-4xl lg:mt-8">
        Mobile Credential Online Presentation
      </h1>

      <div className="flex flex-col gap-4 lg:flex-row lg:gap-8">
        <div className="flex flex-col w-full lg:w-[50%] bg-white border-[1px] rounded-lg p-4 lg:p-8">
          <div className="flex flex-col gap-y-4 w-full">
            {!process.env.NEXT_PUBLIC_API_BASE_URL && (
              <div className="flex flex-col gap-y-1 pb-4">
                <label htmlFor="baseApi" className="font-semibold text-gray-600">
                  Your MATTR verifier Tenant URL
                </label>

                <input
                  type="text"
                  id="baseApi"
                  defaultValue={apiBaseUrl || ""}
                  placeholder="https://your-tenant.vii.au01.mattr.global"
                  onChange={(e) => {
                    localStorage.setItem("apiBaseUrl", e.target.value);
                    setApiBaseUrl(e.target.value);
                  }}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            )}
          </div>

          <CredentialConfig
            apiBaseUrl={apiBaseUrl}
            redirectUri={redirectUri}
            credentialQuery={credentialQuery}
            setCredentialQuery={setCredentialQuery}
            resetCredentialQuery={resetCredentialQuery}
          />

          <div className="flex flex-col mt-4 md:flex-row gap-4">
            <button
              type="button"
              className="flex-1 min-h-16 px-4 py-4 rounded bg-black text-white hover:bg-gray-700d disabled:bg-gray-400"
              onClick={() => requestCredentials()}
              disabled={credentialQuery.error !== null}
            >
              Auto mode detection
            </button>
            <button
              type="button"
              className="flex-1 min-h-16 px-4 py-2 rounded bg-black text-white hover:bg-gray-700d disabled:bg-gray-400"
              onClick={() => requestCredentials(MATTRVerifierSDK.Mode.sameDevice)}
              disabled={credentialQuery.error !== null}
            >
              Same device
            </button>
            <button
              type="button"
              className="flex-1 min-h-16 px-4 py-2 rounded bg-black text-white hover:bg-gray-700d disabled:bg-gray-400"
              onClick={() => requestCredentials(MATTRVerifierSDK.Mode.crossDevice)}
              disabled={credentialQuery.error !== null}
            >
              Cross device
            </button>
          </div>
        </div>

        <div className="flex flex-col w-full p-4 lg:p-8 rounded-lg border-[1px] lg:w-[50%] bg-white">
          <h2 className="text-lg lg:text-xl lg:pb-2 font-semibold tracking-tight">Results</h2>
          {!results && (
            <p className="text-gray-500">{loading ? "Loading results ..." : "No results yet."}</p>
          )}
          {results && <Results presentationResult={results} />}
        </div>
      </div>
    </div>
  );
}
