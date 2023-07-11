import { z } from "zod";

export const createAuthTokenReqBodySchema = z.object({
  client_id: z.string({
    required_error: "Please provide a client ID",
    invalid_type_error: "Please provide a valid client ID",
  }),
  client_secret: z.string({
    required_error: "Please provide a client secret",
    invalid_type_error: "Please provide a valid client secret",
  }),
  audience: z.string().default("https://vii.mattr.global"),
  grant_type: z.string().default("client_credentials"),
});

export const createAuthTokenArgsSchema = z.object({
  url: z.string().default("https://auth.mattr.global/oauth/token"),
  body: createAuthTokenReqBodySchema,
});

export const createAuthTokenResBodySchema = z.object({
  access_token: z.string(),
  expires_in: z.number(),
});

export type CreateAuthTokenArgs = z.infer<typeof createAuthTokenArgsSchema>;

export type CreateAuthTokenReqBody = z.infer<
  typeof createAuthTokenReqBodySchema
>;

export type CreateAuthTokenResBody = z.infer<
  typeof createAuthTokenResBodySchema
>;
