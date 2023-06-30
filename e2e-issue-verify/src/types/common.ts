import { z } from "zod";

export const mattrConfigSchema = z.object({
  tenantDomain: z.string(),
  token: z.string(),
});

export const issuerSchema = z.object({
  id: z.string(),
  name: z.string(),
  iconUrl: z.string().url().optional(),
  logoUrl: z.string().url().optional(),
});

export const queryParamSchema = z.object({
  limit: z.number().optional(),
  cursor: z.string().optional(),
});

export type MattrConfig = z.infer<typeof mattrConfigSchema>;

export type Issuer = z.infer<typeof issuerSchema>;