import { z } from 'zod';

export const createClaimSourceResBodySchema = z.object({
  id: z.string(),
  url: z.string(),
  name: z.string(),
  authorization: z.object({
    type: z.string(),
    value: z.string(),
  }),
  requestParameters: z.any(),
});

export type CreateClaimSourceResBody = z.infer<
  typeof createClaimSourceResBodySchema
>;
