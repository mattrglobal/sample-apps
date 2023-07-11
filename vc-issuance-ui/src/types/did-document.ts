import { z } from "zod";

export const didDocumentSchema = z.object({
  did: z.string(),
  localMetadata: z.object({
    initialDidDocument: z.object({
      keyAgreement: z.any()
    }),
  }),
});

export type DidDocument = z.infer<typeof didDocumentSchema>;
