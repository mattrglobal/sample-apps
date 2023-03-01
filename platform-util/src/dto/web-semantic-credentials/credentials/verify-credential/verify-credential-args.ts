import { CredentialCore } from "../core";

export interface VerifyCredentialArgs {
  query: { id: string };
  body: CredentialCore;
};
