import { z } from 'zod';

const configSchema = z.object({
  NGROK_AUTH_TOKEN: z.string(),
  MATTR_TENANT: z.string().default('YOUR_TENANT_SUBDOMAIN.vii.mattr.global'),
  MATTR_AUTH_TOKEN: z.string(),
});

export type AppConfig = z.infer<typeof configSchema>;

export const validate = (
  config: Record<string, unknown>,
): Record<string, unknown> => {
  const result = configSchema.safeParse(config);
  if (result.success === true) {
    return result.data;
  }
  throw new Error(result.error.toString());
};
