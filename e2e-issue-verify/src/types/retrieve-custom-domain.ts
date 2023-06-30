import { z } from "zod";

export const customDomainSchema = z.object({
  name: z.string(),
  logoUrl: z.string(),
  domain: z.string(),
  homepage: z.string(),
  verificationToken: z.string(),
  isVerified: z.boolean(),
  verifiedAt: z.string().optional(),
});
export type CustomDomain = z.infer<typeof customDomainSchema>;
