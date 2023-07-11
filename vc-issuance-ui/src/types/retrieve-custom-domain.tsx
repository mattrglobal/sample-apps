import { z } from "zod";

export const retrieveCustomDomainResBodySchema = z.object({
  name: z.string(),
  domain: z.string().nonempty(),
  homepage: z.string(),
  verificationToken: z.string().optional(),
  isVerified: z.boolean(),
});

export type RetrieveCustomDomainResBody = z.infer<
  typeof retrieveCustomDomainResBodySchema
>;
