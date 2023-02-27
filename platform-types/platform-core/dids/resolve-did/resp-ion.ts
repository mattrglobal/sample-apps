export interface ResolveDidIon {
  did: string;
  registrationStatus: string;
  localMetadata: LocalMetadata;
}

interface LocalMetadata {
  keys: Key[];
  registered: number;
  initialDidDocument: InitialDidDocument;
}

interface InitialDidDocument {
  id: string;
  '@context': Array<ContextClass | string>;
  verificationMethod: VerificationMethod[];
  authentication: string[];
  assertionMethod: string[];
  capabilityDelegation: string[];
  capabilityInvocation: string[];
  keyAgreement: string[];
}

interface ContextClass {
  '@base': string;
}

interface VerificationMethod {
  id: string;
  controller: string;
  type: string;
  publicKeyJwk: PublicKeyJwk;
}

interface PublicKeyJwk {
  kty: string;
  crv: string;
  x: string;
}

interface Key {
  didDocumentKeyId?: string;
  kmsKeyId: string;
  authorizedDidOperations?: string[];
}
