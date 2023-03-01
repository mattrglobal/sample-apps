export interface Issuer {
  id: string;
  name: string;
}

export interface CredentialStatus {
  id: string;
  type: string;
  revocationListIndex: number;
  revocationListCredential: string;
}

export interface Proof {
  type: string;
  created: Date;
  jws: string;
  proofPurpose: string;
  verificationMethod: string;
}

export interface CredentialData {
  "@context": string[];
  type: string[];
  issuer: Issuer;
  issuanceDate: Date;
  credentialStatus: CredentialStatus;
  credentialSubject: any;
  proof: Proof;
  name: string;
  description: string;
}

export interface CredentialCore {
  id: string;
  credential: CredentialData;
  tag: string;
  credentialStatus: CredentialStatus;
  issuanceDate: Date;
}
