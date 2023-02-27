interface Key {
  kmsKeyId: string;
  didDocumentKeyId: string;
}

interface LocalMetadata {
  keys: Key[];
  registered: any;
}

interface Datum {
  did: string;
  localMetadata: LocalMetadata;
}

export interface RetrieveDidsReqResponse {
  nextCursor?: string;
  data: Datum[];
}
