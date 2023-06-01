import { z } from 'zod';

export const getOpenIdConfigResBodySchema = z.object({
  interactionHook: z
    .object({
      url: z.string(),
      secret: z.string(),
      claims: z.string().array(),
      disabled: z.boolean(),
    })
    .strict(),
});

export type GetOpenIdConfigResBody = z.infer<
  typeof getOpenIdConfigResBodySchema
>;
