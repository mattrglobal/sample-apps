interface Key {
  didDocumentKeyId: string;
  kmsKeyId: string;
}

interface PublicKey {
  id: string;
  controller: string;
  type: string;
  publicKeyBase58: string;
}

interface KeyAgreement {
  id: string;
  controller: string;
  type: string;
  publicKeyBase58: string;
}

interface InitialDidDocument {
  '@context': string;
  id: string;
  publicKey: PublicKey[];
  authentication: string[];
  assertionMethod: string[];
  capabilityDelegation: string[];
  capabilityInvocation: string[];
  keyAgreement: KeyAgreement[];
}

interface LocalMetadata {
  keys: Key[];
  registered: number;
  initialDidDocument: InitialDidDocument;
}

export interface DID_Web {
  did: string;
  registrationStatus: string;
  localMetadata: LocalMetadata;
}
