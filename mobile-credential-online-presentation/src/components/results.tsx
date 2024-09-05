import type * as MATTRVerifierSDK from "@mattrglobal/verifier-sdk-web";
import type { Claim } from "@mattrglobal/verifier-sdk-web";

type ResultSuccess = { verified: boolean; claims: Record<string, string> };

// A helper function to extract the verification status and the claims form the
// PresentationSuccessResult. It transforms the binary data from the 'portrait'
// claim into a data URI.
function mapToResult(result: MATTRVerifierSDK.PresentationSuccessResult) {
  let credential: MATTRVerifierSDK.MobileCredentialPresentationCredential | undefined;
  if ("credentials" in result) {
    credential = result?.credentials?.[0];
  }

  const isoClaims = (credential?.claims?.["org.iso.18013.5.1"] ?? {}) as Record<string, Claim>;

  const claims = Object.entries(isoClaims).map(([key, value]) => {
    if (key === "portrait") {
      const image = imageDataUri(value.value as string);
      return ["portrait", image];
    }
    return [key, value.value];
  });

  return {
    verified: credential?.verificationResult.verified,
    claims: Object.fromEntries(claims),
  } as ResultSuccess;
}

// A helper function to map the binary image data to a data URI string for rendering
// This helper function will also handle binary encoded PNGs. Note that ISO18013-5
// requires the 'portrait' claim to be a binary encoded JPEG.
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

export function Results({
  presentationResult,
}: { presentationResult: MATTRVerifierSDK.PresentationSessionResult }) {
  if ("error" in presentationResult) {
    return <div>{presentationResult.error.message}</div>;
  }

  if ("credentialErrors" in presentationResult) {
    return (
      <div>
        {presentationResult?.credentialErrors?.map((error) => (
          <div
            key={`cred-err-${error.docType}`}
          >{`Error presenting '${error.docType}': ${error.errorCode}`}</div>
        ))}
      </div>
    );
  }

  const results = mapToResult(presentationResult);
  return (
    <div className="flex flex-col gap-4">
      <img width={200} src={results.claims.portrait} alt="portrait" />
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
  );
}
