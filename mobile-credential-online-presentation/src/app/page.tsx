"use client";

import * as MATTRVerifierSDK from "@mattrglobal/verifier-sdk-web";
import type { Claim } from "@mattrglobal/verifier-sdk-web/dist/typings/verifier/types";
import { useCallback, useEffect, useState } from "react";

type ResultError = { message: string };
type ResultSuccess = { verified: boolean; claims: Record<string, string> };
type Result = ResultSuccess | ResultError;

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

  // To request credentials, we need to
  // 1. initialise the SDK,
  // 2. repare the request options, and
  // 3. call the requestCredentials function
  const requestCredentials = useCallback(async (mode?: MATTRVerifierSDK.Mode) => {
    try {
      const apiBaseUrl = localStorage.getItem("apiBaseUrl");
      const redirectUri = localStorage.getItem("redirectUri");
      if (!apiBaseUrl || !redirectUri) {
        alert("Verifier tenant URL or redirect URI is missing");
        return;
      }

      MATTRVerifierSDK.initialise({ apiBaseUrl: apiBaseUrl });

      const options: MATTRVerifierSDK.RequestCredentialsOptions = {
        credentialQuery: [
          {
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
          },
        ],
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
            if (error.type === "Abort") {
              return;
            }
            alert(`There was an error processing the request - ${error.message}`);
          },
        },
      };

      await MATTRVerifierSDK.requestCredentials(options);
    } catch (e) {
      if (e instanceof Error) {
        alert(e.message);
      }
    }
  }, []);

  const handleRedirect = useCallback(async () => {
    // The API base URL must exist in localstorage so that we are able to handle the
    // redirect and can intialise the SDK
    const apiBaseUrl = localStorage.getItem("apiBaseUrl");
    if (!apiBaseUrl) {
      alert("Verifier tenant URL is missing");
      return;
    }
    MATTRVerifierSDK.initialise({ apiBaseUrl: apiBaseUrl });

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

  // In the same device flow, we check if URL contains a hash and and handle the
  // redirect when the page loads
  useEffect(() => {
    if (window.location.hash) {
      console.log("Handling redirect");
      handleRedirect();
    }
  }, [handleRedirect]);

  return (
    <main className="flex min-h-screen flex-col p-4 lg:p-24">
      <h1 className="text-xl font-semibold tracking-tight py-8 lg:py-16 lg:text-3xl">
        Mobile Credential Online Presentation
      </h1>

      <div className="flex flex-col gap-4 lg:flex-row lg:gap-16">
        <div className="flex flex-col w-full lg:w-[50%]">
          <h2 className="pb-2 lg:pb-4 text-lg lg:text-xl font-semibold tracking-tight">
            Configuration
          </h2>
          <p className="pb-8 leading-wide">
            Provide your verifier tenant URL and the redirect URL to request credentials. A MATTR
            verifier tenant URL should look like{" "}
            <code className="bg-slate-100 p-1 rounded">
              https://your-tenant.vii.au01.mattr.global
            </code>
            . The redirect URL is the public URL of the sample app. If you are using ngrok or
            cloudflare tunnels, it is the URL of the tunnel.
          </p>

          <div className="flex flex-col gap-y-4 w-full">
            <div className="flex flex-col gap-y-1">
              <label htmlFor="baseApi" className="font-semibold text-gray-600">
                Verifier Tenant URL
              </label>
              <input
                type="text"
                id="baseApi"
                defaultValue={localStorage.getItem("apiBaseUrl") || ""}
                placeholder="https://your-tenant.vii.au01.mattr.global"
                onChange={(e) => localStorage.setItem("apiBaseUrl", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="flex flex-col gap-y-1">
              <label htmlFor="redirectUri" className="font-semibold text-gray-600">
                Redirect URL
              </label>
              <input
                type="text"
                id="redirectUri"
                defaultValue={localStorage.getItem("redirectUri") || ""}
                onChange={(e) => localStorage.setItem("redirectUri", e.target.value)}
                placeholder="https://your-cloudflare-tunnel.trycloudflare.com"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          <h2 className="pt-8 pb-2 lg:pb-4 text-lg lg:text-xl font-semibold tracking-tight">
            Request credentials
          </h2>
          <div className="flex flex-row gap-x-2">
            <button
              type="submit"
              className="px-4 py-2 rounded bg-black text-white hover:bg-gray-700d disabled:bg-gray-400"
              onClick={() => requestCredentials()}
            >
              Auto mode detection
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded bg-black text-white hover:bg-gray-700d disabled:bg-gray-400"
              onClick={() => requestCredentials(MATTRVerifierSDK.Mode.sameDevice)}
            >
              Same device
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded bg-black text-white hover:bg-gray-700d disabled:bg-gray-400"
              onClick={() => requestCredentials(MATTRVerifierSDK.Mode.crossDevice)}
            >
              Cross device
            </button>
          </div>
        </div>

        <div className="flex flex-col w-full lg:w-[50%]">
          <h2 className="pt-16 lg:pt-0 pb-4 text-lg lg:text-xl font-semibold tracking-tight">
            Results
          </h2>
          {!results && <p className="text-gray-500">No results yet</p>}
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
