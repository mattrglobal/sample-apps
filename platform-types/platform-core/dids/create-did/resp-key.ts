interface Key {
  kmsKeyId: string;
  didDocumentKeyId: string;
}

interface PublicKey {
  id: string;
  type: string;
  controller: string;
  publicKeyBase58: string;
}

interface KeyAgreement {
  id: string;
  type: string;
  controller: string;
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

export interface DID_Key {
  did: string;
  registrationStatus: string;
  localMetadata: LocalMetadata;
}
