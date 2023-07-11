import { z } from "zod";
import { configSchema } from "./common";

export const encryptMessagePayloadSchema = z.object({
  id: z.string(),
  type: z
    .string()
    .default("https://mattr.global/schemas/verifiable-credential/offer/Direct"),
  from: z.string(),
  to: z.string().array().min(1),
  created_time: z.number().optional(),
  body: z.object({
    credentials: z.any().array(),
    domain: z.string(),
  }),
});

export const encryptMessageReqBodySchema = z.object({
  senderDidUrl: z.string(),
  recipientDidUrls: z.string().array().min(1),
  payload: encryptMessagePayloadSchema,
});

export const encryptMessageArgsSchema = z.object({
  config: configSchema,
  body: encryptMessageReqBodySchema,
});

export const encryptMessageResBodySchema = z.object({
  jwe: z.any(),
});

export type EncryptMessageArgs = z.infer<typeof encryptMessageArgsSchema>;
export type EncryptMessageReqBody = z.infer<typeof encryptMessageReqBodySchema>;
export type EncryptMessageResBody = z.infer<typeof encryptMessageResBodySchema>;
