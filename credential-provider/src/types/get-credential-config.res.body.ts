import { z } from 'zod';

export const getCredentialConfigsResBodySchema = z.object({
  data: z
    .object({
      id: z.string(),
      name: z.string(),
      type: z.string(),
      issuer: z.object({
        name: z.string(),
      }),
    })
    .array(),
});

export type GetCredentialConfigsResBody = z.infer<
  typeof getCredentialConfigsResBodySchema
>;
