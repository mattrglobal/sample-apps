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
  id: string;
  '@context': string;
  publicKey: PublicKey[];
  keyAgreement: KeyAgreement[];
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

export interface ResolveDidWeb {
  registrationStatus: string;
  localMetadata: LocalMetadata;
}
