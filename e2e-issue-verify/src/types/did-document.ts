import { z } from "zod";

export const DID_KEY_Ed25519_SCHEMA = z.object({
  did: z.string(),
  localMetadata: z.object({
    initialDidDocument: z.object({
      keyAgreement: z
        .object({
          id: z.string(),
        })
        .array()
        .min(1),
      authentication: z.string().array().min(1),
    }),
  }),
});

export const DID_KEY_Bls12381G2_SCHEMA = z.object({
  did: z.string(),
});

export const didDocumentSchema = z.union([
  DID_KEY_Ed25519_SCHEMA,
  DID_KEY_Bls12381G2_SCHEMA,
]);
export type DID_KEY_Ed25519 = z.infer<typeof DID_KEY_Ed25519_SCHEMA>

export type DidDocument = z.infer<typeof didDocumentSchema>;
