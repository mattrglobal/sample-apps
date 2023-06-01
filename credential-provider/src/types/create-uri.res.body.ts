import { z } from 'zod';

export const createUriResBodySchema = z.object({
  uri: z.string(),
});

export type CreateUriResBody = z.infer<typeof createUriResBodySchema>;
