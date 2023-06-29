import { z } from "zod";
import { mattrConfigSchema } from "./common";

// Create PresentationTemplate
export const presentationTemplateTypeSchema = z.union([
  z.literal("QueryByExmple"),
  z.literal("QueryByFrame"),
  z.literal("DIDAuth"),
]);

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

export const presentationTemplateQuerySchema = z.object({
  type: presentationTemplateTypeSchema,
  credentialQuery: z.union([queryByExampleSchema, z.any()]), // update later
});

export const createPresentationTemplateReqBodySchema = z.object({
  domain: z.string(),
  name: z.string(),
  query: z.any().array(),
});

export const createPresentationTemplateArgsSchema = z.object({
  config: mattrConfigSchema,
  body: createPresentationTemplateReqBodySchema,
});

// Create PresentationRequest
export const createPresentationRequestArgsSchema = z.object({
  config: mattrConfigSchema,
  body: z.object({
    challenge: z.string(),
    did: z.string().startsWith("did:"),
    templateId: z.string(),
    expiresTime: z.number().optional(),
    callbackUrl: z.string().optional(),
  }),
});

export const createPresentationRequestResBodySchema = z.object({
  id: z.string(),
  callbackUrl: z.string().optional(),
  request: z.any(),
});

export type CreatePresentationRequestArgs = z.infer<
  typeof createPresentationRequestArgsSchema
>;

export type CreatePresentationRequestResBody = z.infer<
  typeof createPresentationRequestResBodySchema
>;
