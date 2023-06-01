import { z } from 'zod';

export const authProviderSchema = z.object({
  id: z.string(),
  url: z.string(),
  scope: z.string().array(),
  clientId: z.string(),
  clientSecret: z.string(),
  claimsToSync: z.string().array(),
  redirectUrl: z.string(),
});

export type AuthProvider = z.infer<typeof authProviderSchema>;

export const getAuthProvidersResBodySchema = z.object({
  data: authProviderSchema.array(),
});

export type GetAuthProvidersResBody = z.infer<
  typeof getAuthProvidersResBodySchema
>;
