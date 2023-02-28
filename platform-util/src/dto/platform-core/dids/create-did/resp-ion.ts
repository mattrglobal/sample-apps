interface Key {
  didDocumentKeyId: string;
  kmsKeyId: string;
  authorizedDidOperations: string[];
}

interface PublicKeyJwk {
  kty: string;
  crv: string;
  x: string;
}

interface VerificationMethod {
  id: string;
  controller: string;
  type: string;
  publicKeyJwk: PublicKeyJwk;
}

interface InitialDidDocument {
  id: string;
  '@context': any[];
  verificationMethod: VerificationMethod[];
  authentication: string[];
  assertionMethod: string[];
  capabilityDelegation: string[];
  capabilityInvocation: string[];
  keyAgreement: string[];
}

interface LocalMetadata {
  keys: Key[];
  registered: number;
  initialDidDocument: InitialDidDocument;
}

export interface DID_Ion {
  did: string;
  registrationStatus: string;
  localMetadata: LocalMetadata;
}
