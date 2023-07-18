import { z } from "zod";

export const mattrConfigSchema = z.object({
  tenantDomain: z
    .string()
    .nonempty(
      "Please provide a MATTR tenant domain. For e.g, your-tenant.vii.mattr.global"
    ),
  token: z.string().nonempty("Please provide a MATTR auth token"),
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
