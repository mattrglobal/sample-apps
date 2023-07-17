export const CREDENTIAL_INFO = {
  type: ["VerifiableCredential", "KakapoAirlinePilotCredential"],
  contexts: [
    "https://www.w3.org/2018/credentials/v1",
    "https://w3id.org/vc-revocation-list-2020/v1",
    "https://mattr.global/contexts/vc-extensions/v2",
  ],
  requestReason: "Please present your Pilot License Credential",
};
