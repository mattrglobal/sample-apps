import { z } from "zod";
import { mattrConfigSchema } from "./common";

// Create PresentationTemplate
export const presentationTemplateTypeSchema = z.union([
  z.literal("QueryByExmple"),
  z.literal("QueryByFrame"),
  z.literal("DIDAuth"),
]);
export type PresentationTemplateType = z.infer<
  typeof presentationTemplateTypeSchema
>;

export const trustedIssuerSchema = z.object({
  required: z.boolean(),
  issuer: z.string(),
});

export const queryByExampleSchema = z.object({
  required: z.boolean(),
  reason: z.string().optional(),
  example: z
    .object({
      "@context": z.string().array(),
      type: z.string().array(),
      trustedIssuer: trustedIssuerSchema.array(),
    })
    .array(),
});

export const credentialQuerySchema = z.union([queryByExampleSchema, z.any()]);

export const presentationTemplateQuerySchema = z.object({
  type: presentationTemplateTypeSchema,
  credentialQuery: credentialQuerySchema.array(),
});

export const createPresentationTemplateReqBodySchema = z.object({
  domain: z.string(),
  name: z.string(),
  query: presentationTemplateQuerySchema.array(),
});
export type CreatePresentationTemplateReqBodySchema = z.infer<
  typeof createPresentationTemplateReqBodySchema
>;

export const createPresentationTemplateArgsSchema = z.object({
  config: mattrConfigSchema,
  body: createPresentationTemplateReqBodySchema,
});

// Create PresentationRequest
export const createPresentationRequestReqBodySchema = z.object({
  challenge: z.string(),
  did: z.string().startsWith("did:"),
  templateId: z.string(),
  expiresTime: z.number().optional(),
  callbackUrl: z.string().optional(),
});
export type CreatePresentationRequestReqBody = z.infer<
  typeof createPresentationRequestReqBodySchema
>;

export const createPresentationRequestArgsSchema = z.object({
  config: mattrConfigSchema,
  body: createPresentationRequestReqBodySchema,
});
export type CreatePresentationRequestArgs = z.infer<
  typeof createPresentationRequestArgsSchema
>;

export const createPresentationRequestResBodySchema = z.object({
  id: z.string(),
  callbackUrl: z.string().optional(),
  request: z.any(),
});

export type CreatePresentationRequestResBody = z.infer<
  typeof createPresentationRequestResBodySchema
>;
