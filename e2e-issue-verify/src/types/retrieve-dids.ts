import { z } from "zod";
import { mattrConfigSchema } from "./common";
import { didDocumentSchema } from "./did-document";

export const retrieveDidsArgsSchema = z.object({
  config: mattrConfigSchema,
});

export const retrieveDidsResBodySchema = z.object({
  data: didDocumentSchema.array(),
});

export type RetrieveDidsArgs = z.infer<typeof retrieveDidsArgsSchema>;

export type RetrieveDidsResBody = z.infer<typeof retrieveDidsResBodySchema>;