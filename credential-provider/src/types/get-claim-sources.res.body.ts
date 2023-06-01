import { z } from 'zod';

export const getClaimSourcesResBodySchema = z.object({
  data: z
    .object({
      id: z.string(),
      url: z.string(),
      name: z.string(),
    })
    .array(),
});

export type GetClaimSourcesResBody = z.infer<
  typeof getClaimSourcesResBodySchema
>;
