import { z } from "zod";
import { configSchema } from "./common";
import { didDocumentSchema } from "./did-document";

export const resolveDidArgsSchema = z.object({
  config: configSchema,
  query: z.object({
    did: z.string().startsWith("did:"),
  }),
});

export const resolveDidResBodySchema = z.object({
  didDocument: didDocumentSchema,
});

export type ResolveDidArgs = z.infer<typeof resolveDidArgsSchema>;

export type ResolveDidResBody = z.infer<typeof resolveDidResBodySchema>;
