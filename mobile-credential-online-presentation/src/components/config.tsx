import { useState } from "react";

export function CredentialConfig({
  apiBaseUrl,
  redirectUri,
  credentialQuery,
  setCredentialQuery,
  resetCredentialQuery,
}: {
  apiBaseUrl: string | null;
  redirectUri: string | null;
  credentialQuery: { error: string | null; query: string };
  setCredentialQuery: (config: { error: string | null; query: string }) => void;
  resetCredentialQuery: () => void;
}) {
  const [configVisible, setConfigVisible] = useState(false);

  if (!configVisible) {
    return (
      <button
        type="button"
        className="flex flex-start underline"
        onClick={() => setConfigVisible(!configVisible)}
      >
        Show credential request
      </button>
    );
  }

  return (
    <div>
      <button
        type="button"
        className={`flex pointer ${credentialQuery.error ? "no-underline text-gray-400" : "underline text-black"}`}
        onClick={() => setConfigVisible(!configVisible)}
        disabled={credentialQuery.error !== null}
      >
        Hide credential request
      </button>

      <div className="flex flex-col mt-4 gap-4">
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
            <div className="flex gap-x-4">
              <h3 className="font-semibold text-gray-600">Credential query</h3>
              {credentialQuery.error && <div className="text-red-500">{credentialQuery.error}</div>}
            </div>

            <button type="button" className="underline" onClick={resetCredentialQuery}>
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
        </div>
      </div>
    </div>
  );
}
