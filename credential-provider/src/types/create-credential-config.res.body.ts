import { z } from 'zod';

export const createCredentialConfigResBodySchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  issuer: z.object({
    name: z.string(),
    iconUrl: z.string().optional(),
    logoUrl: z.string().optional(),
  }),
  persist: z.boolean(),
  revocable: z.boolean(),
  includeId: z.boolean(),
  description: z.string().optional(),
  claimMappings: z.any().optional(),
  claimSourceId: z.string().optional(),
});

export type CreateCredentialConfigResBody = z.infer<
  typeof createCredentialConfigResBodySchema
>;
