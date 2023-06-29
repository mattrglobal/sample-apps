import { z } from "zod";
import { mattrConfigSchema } from "./common";

export const sendMessageReqBodySchema = z.object({
  to: z.string(),
  message: z.any(),
});

export const sendMessageArgsSchema = z.object({
  config: mattrConfigSchema,
  body: sendMessageReqBodySchema,
});

export type SendMessageReqBody = z.infer<typeof sendMessageReqBodySchema>;

export type SendMessageArgs = z.infer<typeof sendMessageArgsSchema>;
