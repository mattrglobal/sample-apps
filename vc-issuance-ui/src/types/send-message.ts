import { z } from "zod";
import { configSchema } from "./common";

export const sendMessageReqBodySchema = z.object({
  to: z.string(),
  message: z.any(),
});

export const sendMessageArgsSchema = z.object({
  config: configSchema,
  body: sendMessageReqBodySchema,
});

export type SendMessageReqBody = z.infer<typeof sendMessageReqBodySchema>;

export type SendMessageArgs = z.infer<typeof sendMessageArgsSchema>;
