"use client";

import { useCallback, useEffect, useState } from "react";
import * as MATTRVerifierSDK from "@mattrglobal/verifier-sdk-web";
import type { Claim } from "@mattrglobal/verifier-sdk-web/dist/typings/verifier/types";

type ResultError = { message: string };
type ResultSuccess = { verified: boolean; claims: Record<string, string> };
type Result = ResultSuccess | ResultError;

function mapToResult(result: MATTRVerifierSDK.PresentationSuccessResult) {
  const credential = result.credentials?.[0];

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
  MATTRVerifierSDK.initialise({ apiBaseUrl: "" });
  const [results, setResults] = useState<Result | null>(null);

  const requestCredentials = useCallback(async () => {
    try {
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
        redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/verification`,
        crossDeviceCallback: {
          onSuccess: (callbackResponse: MATTRVerifierSDK.HandleRedirectCallbackResponse) => {
            setResults(mapToResult(callbackResponse.result));
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
    const result = await MATTRVerifierSDK.handleRedirectCallback();
    if (result.isErr()) {
      setResults({ message: result.error.message });
      return;
    }

    const presentationResult = result.value.result;
    if (!("sessionId" in presentationResult) || "error" in presentationResult) {
      setResults({ message: "Something went wrong" })
      return;
    }

    setResults(mapToResult(presentationResult));
  }, []);

  useEffect(() => {
    if (window.location.hash) {
      handleRedirect();
    }
  }, [handleRedirect]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div>Hello</div>
    </main>
  );
}
