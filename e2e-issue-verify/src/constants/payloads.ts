export const CREDENTIAL_INFO = {
  name: "Kakapo Airline Pilot",
  type: ["VerifiableCredential", "KakapoAirlinePilotCredential"],
  contexts: [
    "https://www.w3.org/2018/credentials/v1",
    "https://w3id.org/vc-revocation-list-2020/v1",
    "https://mattr.global/contexts/vc-extensions/v2",
  ],
  issuer: {
    name: "Kakapo Airlines",
    logoUrl: "https://silvereye.mattrlabs.com/assets/wm80sZB5ZFscf8FJ0oF_k.svg",
    iconUrl: "https://silvereye.mattrlabs.com/assets/dggFEuZ6ez6sJ-Wkuo0r-.svg",
  },
  credentialBranding: {
    backgroundColor: "#FEFBFF",
    watermarkImageUrl:
    "https://silvereye.mattrlabs.com/assets/hbkW-o7A3CzfZZqLFx58J.svg",
  },
  requestReason: "Please present your Pilot License Credential",
};
