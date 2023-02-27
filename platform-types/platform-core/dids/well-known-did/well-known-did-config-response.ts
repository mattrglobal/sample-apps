interface CredentialSubject {
  id: string;
  origin: string;
}

interface Proof {
  jws: string;
  type: string;
  created: Date;
  proofPurpose: string;
  verificationMethod: string;
  proofValue: string;
}

interface Entry {
  "@context": string[];
  type: string[];
  issuer: string;
  issuanceDate: Date;
  credentialSubject: CredentialSubject;
  proof: Proof;
}

export interface WellKnownDidConfigResponse {
  entries: Entry[];
}
