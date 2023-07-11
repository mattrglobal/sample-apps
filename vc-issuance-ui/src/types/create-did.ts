import { z } from "zod";
import { configSchema } from "./common";

const didTypeSchema = z.union([z.literal("key"), z.literal("web")]);
const keyTypeSchema = z.union([z.literal("Ed25519"), z.literal("P-256")]);

export const createDidReqBodySchema = z.object({
  method: didTypeSchema,
  options: z.object({
    keyType: keyTypeSchema.optional(),
    url: z.string().url().optional(),
  }),
});

export const createDidArgsSchema = z.object({
  config: configSchema,
  body: createDidReqBodySchema,
});

export type CreateDidArgs = z.infer<typeof createDidArgsSchema>;

export type CreateDidReqBody = z.infer<typeof createDidReqBodySchema>;
