"use client";

import * as MATTRVerifierSDK from "@mattrglobal/verifier-sdk-web";
import type {
  Claim,
  CredentialQuery,
} from "@mattrglobal/verifier-sdk-web/dist/typings/verifier/types";
import { useCallback, useEffect, useState } from "react";

type ResultError = { message: string };
type ResultSuccess = { verified: boolean; claims: Record<string, string> };
type ResultLoading = { loading: true };
type Result = ResultSuccess | ResultError | ResultLoading;

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

// A helper function to extract the verification status and the claims form the PresentationSuccessResult
function mapToResult(result: MATTRVerifierSDK.PresentationSuccessResult) {
  let credential: MATTRVerifierSDK.MobileCredentialPresentationCredential | undefined;
  if ("credentials" in result) {
    credential = result?.credentials?.[0];
  }

  const isoClaims = (credential?.claims?.["org.iso.18013.5.1"] ?? {}) as Record<string, Claim>;

  const claims = Object.entries(isoClaims).map(([key, value]) => {
    if (key === "portrait") {
      const image = imageDataUri(value.value as string);
      return ["image", image];
    }
    return [key, value.value];
  });

  return {
    verified: credential?.verificationResult.verified,
    claims: Object.fromEntries(claims),
  } as Result;
}

// A helper function to map the binary image data to a data URI string for rendering
function imageDataUri(data: string) {
  const signatures = {
    iVBORw0KGgo: "image/png",
    "/9j/": "image/jpg",
    _9j_: "image/jpeg",
  } as Record<string, string>;

  const prefix = Object.keys(signatures).find((prefix) => data.startsWith(prefix));
  const mimeType = prefix ? signatures[prefix] : "image/jpeg";
  const base64Data = data.replace(/_/g, "/").replace(/-/g, "+");
  return `data:${mimeType};base64,${base64Data}`;
}

export default function Home() {
  const [results, setResults] = useState<Result | null>(null);
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
          ...(mode && { mode: mode }),
          crossDeviceCallback: {
            onSuccess: (callbackResponse) => {
              if ("result" in callbackResponse) {
                setResults(mapToResult(callbackResponse.result));
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
          alert(
            `Request failed. Please ensure ${redirectUri} is a public domain and is configured on your tenant as a redirect URI`,
          );
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
      setResults({ message: result.error.message });
      return;
    }

    const presentationResult = result.value.result;
    if (!("sessionId" in presentationResult) || "error" in presentationResult) {
      setResults({ message: "Something went wrong" });
      return;
    }

    setResults(mapToResult(presentationResult));
  }, []);

  useEffect(() => {
    setRedirectUri(window.location.origin);
  }, []);

  // In the same device flow, we check if URL contains a hash and and handle the
  // redirect when the page loads
  useEffect(() => {
    if (window.location.hash !== null) {
      setResults({ loading: true });
      handleRedirect();
    }
  }, [handleRedirect]);

  return (
    <main className="flex min-h-screen flex-col p-4 lg:max-w-6xl lg:mx-auto">
      <h1 className="text-xl font-semibold tracking-tight py-8 lg:py-16 lg:text-3xl">
        Request Mobile Credentials Online
      </h1>

      <div className="flex flex-col gap-4 lg:flex-row lg:gap-16">
        <div className="flex flex-col w-full lg:w-[50%]">
          <div className="flex flex-col gap-y-4 w-full">
            {!apiBaseUrl && (
              <div className="flex flex-col gap-y-1">
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
              <div className="py-3 flex justify-between">
                <button
                  type="button"
                  className={`flex pointer ${!credentialQuery.error && "underline"}`}
                  onClick={() => setCredentialQueryVisible(!credentialQueryVisible)}
                  disabled={credentialQuery.error !== null}
                >
                  Hide credential config
                </button>
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
          ) : (
            <button
              type="button"
              className="flex flex-start underline py-3"
              onClick={() => setCredentialQueryVisible(!credentialQueryVisible)}
            >
              Show credential config
            </button>
          )}
          <div className="flex flex-row gap-x-4">
            <button
              type="submit"
              className="px-4 py-4 rounded bg-black text-white hover:bg-gray-700d disabled:bg-gray-400"
              onClick={() => requestCredentials()}
              disabled={credentialQuery.error !== null}
            >
              Auto mode detection
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded bg-black text-white hover:bg-gray-700d disabled:bg-gray-400"
              onClick={() => requestCredentials(MATTRVerifierSDK.Mode.sameDevice)}
              disabled={credentialQuery.error !== null}
            >
              Same device
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded bg-black text-white hover:bg-gray-700d disabled:bg-gray-400"
              onClick={() => requestCredentials(MATTRVerifierSDK.Mode.crossDevice)}
              disabled={credentialQuery.error !== null}
            >
              Cross device
            </button>
          </div>
        </div>

        <div className="flex flex-col w-full lg:w-[50%]">
          <h2 className="lg:pt-0 py-4 text-lg lg:text-xl font-semibold tracking-tight">Results</h2>
          {!results && <p className="text-gray-500">No results yet</p>}
          {results && "loading" in results && <p className="text-gray-500">Loading...</p>}
          {results && "claims" in results && (
            <div className="flex flex-col gap-4">
              <img width={200} src={results.claims.image} alt="portrait" />
              <div>
                <div className="text-sm text-slate-500">Given Name</div>
                <div>{results.claims.given_name}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Family Name</div>
                <div>{results.claims.family_name}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Age over 18</div>
                <div>{results.claims.age_over_18 ? "true" : "false"}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Presentation Status</div>
                <div>{results.verified ? "verified" : "not verified"}</div>
              </div>
            </div>
          )}
          {results && "message" in results && <p className="text-red-500">{results.message}</p>}
        </div>
      </div>
    </main>
  );
}
