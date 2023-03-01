import { CredentialStatus } from "../core";

export interface CreateCredentailReqResponse {
    id: string;
    credential: Credential;
    tag: string;
    credentialStatus: CredentialStatus;
    issuanceDate: Date;
  }
  