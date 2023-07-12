import { z } from "zod";
import { mattrConfigSchema } from "./common";

export const signMessageArgsSchema = z.object({
  config: mattrConfigSchema,
  body: z.object({
    didUrl: z.string().includes("#"),
    payload: z.any(),
  }),
});

export type SignMessageArgs = z.infer<typeof signMessageArgsSchema>;
