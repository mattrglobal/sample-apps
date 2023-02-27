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

interface DidDocument {
  '@context': string;
  id: string;
  publicKey: PublicKey[];
  authentication: string[];
  assertionMethod: string[];
  capabilityDelegation: string[];
  capabilityInvocation: string[];
  keyAgreement: KeyAgreement[];
}

interface Key {
  kmsKeyId: string;
  didDocumentKeyId: string;
}

interface PublicKey2 {
  id: string;
  type: string;
  controller: string;
  publicKeyBase58: string;
}

interface KeyAgreement2 {
  id: string;
  type: string;
  controller: string;
  publicKeyBase58: string;
}

interface InitialDidDocument {
  id: string;
  '@context': string;
  publicKey: PublicKey2[];
  keyAgreement: KeyAgreement2[];
  authentication: string[];
  assertionMethod: string[];
  capabilityDelegation: string[];
  capabilityInvocation: string[];
}

interface LocalMetadata {
  keys: Key[];
  registered: number;
  initialDidDocument: InitialDidDocument;
}

export interface ResolveDidKey {
  didDocument: DidDocument;
  registrationStatus: string;
  localMetadata: LocalMetadata;
}
