import { z } from "zod";
import { mattrConfigSchema } from "./common";

export const issueStaticCredentialArgsSchema = z.object({
  config: mattrConfigSchema,
  walletDid: z.string(),
});
export type IssueStaticCredentialArgs = z.infer<
  typeof issueStaticCredentialArgsSchema
>;

const credentialIssuanceStatus = z.union([
  z.literal("Credential issued"),
  z.literal("Failed to create credential"),
  z.literal("Failed to encrypt credential"),
  z.literal("Credential encrypted, but failed to send credential"),
]);
export const issueStaticCredentialResSchema = z.object({
  success: z.boolean(),
  status: credentialIssuanceStatus,
});
export type IssueStaticCredentialRes = z.infer<
  typeof issueStaticCredentialResSchema
>;
