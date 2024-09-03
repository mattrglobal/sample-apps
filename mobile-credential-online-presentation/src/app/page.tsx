"use client";

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
  const [results, setResults] = useState<MATTRVerifierSDK.PresentationSessionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiBaseUrl, setApiBaseUrl] = useState<string | null>(
    process.env.NEXT_PUBLIC_API_BASE_URL || localStorage.getItem("apiBaseUrl"),
  );
  const [redirectUri, setRedirectUri] = useState<string | null>(null);
  const [credentialQuery, setCredentialQuery] = useState<{ error: string | null; query: string }>({
    error: null,
    query: JSON.stringify(MDL_CREDENTIAL_QUERY, null, 2),
  });
  const [credentialQueryVisible, setCredentialQueryVisible] = useState(false);

  // To request credentials, we need to
  // 1. initialise the SDK,
  // 2. repare the request options, and
  // 3. call the requestCredentials function
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
            onSuccess: (callbackResponse) => {
              if ("result" in callbackResponse) {
                setResults(callbackResponse.result);
              }
            },
            onFailure: (error) => {
              console.log("SDK Error: ", error);
              if (error.type === "Abort") {
                return;
              }
              alert(`There was an error processing the request - ${error.message}`);
            },
          },
        };

        const result = await MATTRVerifierSDK.requestCredentials(options);
        if ("error" in result) {
          const cause = result.error.cause;
          if (typeof cause === "object" && cause && "status" in cause && cause.status === 404) {
            alert(`Request failed. Please check if your tenant URL is correct: ${apiBaseUrl}`)
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

  const handleRedirect = useCallback(async () => {
    // The API base URL must exist in localstorage so that we are able to handle the
    // redirect and can intialise the SDK
    const url = process.env.NEXT_PUBLIC_API_BASE_URL || localStorage.getItem("apiBaseUrl");
    if (!url) {
      alert("Verifier tenant URL is missing");
      return;
    }
    MATTRVerifierSDK.initialise({ apiBaseUrl: url });

    // A single function call handles the redirect callback for the same device flow
    const result = await MATTRVerifierSDK.handleRedirectCallback();
    if (result.isErr()) {
      alert(`Error retrieving results: ${result.error.message}`);
      return;
    }

    const presentationResult = result.value.result;
    if (!("sessionId" in presentationResult) || "error" in presentationResult) {
      alert("Something went wrong")
      return;
    }

    setResults(presentationResult);
    setLoading(false);
  }, []);

  useEffect(() => {
    setRedirectUri(window.location.origin);
    setApiBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL || localStorage.getItem("apiBaseUrl"))
  }, []);

  // In the same device flow, we check if URL contains a hash and and handle the
  // redirect when the page loads
  useEffect(() => {
    console.log("this runs", window.location.hash)
    if (window.location.hash) {
    console.log("this runs too")
      setLoading(true);
      handleRedirect();
    }
  }, [handleRedirect]);

  return (
    <main className="flex flex-col min-h-screen bg-gray-50 p-4 lg:px-16 lg:max-w-6xl lg:mx-auto">
      <h1 className="text-xl font-semibold tracking-tight py-8 lg:py-16 lg:text-3xl">
        Request Mobile Credentials Online
      </h1>

      <div className="flex flex-col gap-4 lg:flex-row lg:gap-16">
        <div className="flex flex-col w-full lg:w-[50%]">
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

          {credentialQueryVisible || credentialQuery.error ? (
            <div>
                <button
                  type="button"
                  className={`flex pointer ${!credentialQuery.error && "underline py-3"}`}
                  onClick={() => setCredentialQueryVisible(!credentialQueryVisible)}
                  disabled={credentialQuery.error !== null}
                >
                  Hide credential request
                </button>

                  <div className="flex flex-col gap-4">
              <div>
                <h3 className="font-semibold text-gray-600 pb-1">Verifier tenant URL</h3>
                  <div className="font-mono text-sm py-1">{apiBaseUrl || "N/A"}</div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-600 pb-1">Redirect URI</h3>
                  <div className="font-mono text-sm py-1">{redirectUri || "N/A"}</div>
              </div>
              <div>
              <div className="flex justify-between pb-1">
                <h3 className="font-semibold text-gray-600">Credential query</h3>
                <button
                  type="button"
                  className="underline"
                  onClick={() =>
                    setCredentialQuery({
                      error: null,
                      query: JSON.stringify(MDL_CREDENTIAL_QUERY, null, 2),
                    })
                  }
                >
                  Reset
                </button>
              </div>
              <textarea
                id="credential-query"
                rows={20}
                className="w-full bg-gray-100 mb-4 p-2 rounded font-mono"
                value={credentialQuery.query}
                onChange={(e) => {
                  try {
                    JSON.parse(e.target.value);
                    setCredentialQuery({ error: null, query: e.target.value });
                  } catch (error) {
                    setCredentialQuery({ error: "Invalid JSON", query: e.target.value });
                  }
                }}
              />
              {credentialQuery.error && (
                <div className="pb-4 text-red-500">{credentialQuery.error}</div>
              )}
                  </div>
                  </div>
            </div>
          ) : (
            <button
              type="button"
              className="flex flex-start underline py-3"
              onClick={() => setCredentialQueryVisible(!credentialQueryVisible)}
            >
              Show credential request
            </button>
          )}
          <div className="flex flex-col md:flex-row gap-4">
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

        <div className="flex flex-col w-full lg:w-[50%]">
          <h2 className="lg:pt-0 py-4 text-lg lg:text-xl font-semibold tracking-tight">Results</h2>
          {!results && <p className="text-gray-500">{loading ? "Loading results ..." : "No results yet."}</p>}
          {results && <Results presentationResult={results} />}
        </div>
      </div>
    </main>
  );
}
