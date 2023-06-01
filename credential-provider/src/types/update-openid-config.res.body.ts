import { z } from 'zod';

export const updateOpenIdConfigResBodySchema = z.object({
  interactionHook: z
    .object({
      url: z.string(),
      secret: z.string(),
      claims: z.string().array(),
      disabled: z.boolean(),
    })
    .strict(),
});

export type UpdateOpenIdConfigResBody = z.infer<
  typeof updateOpenIdConfigResBodySchema
>;
