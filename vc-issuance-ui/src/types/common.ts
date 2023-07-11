import { z } from "zod";

export const issuerSchema = z.object({
  id: z.string().startsWith("did:"),
  name: z.string(),
  iconUrl: z.string().url().optional(),
  logoUrl: z.string().url().optional(),
});

export const configSchema = z.object({
  tenantDomain: z.string(),
  token: z.string(),
});

export type Issuer = z.infer<typeof issuerSchema>;

export type MattrConfig = z.infer<typeof configSchema>;
