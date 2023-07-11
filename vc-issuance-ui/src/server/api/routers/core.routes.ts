import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/trpc";
import {
  createAuthTokenArgsSchema,
  createAuthTokenResBodySchema,
} from "@/types/create-auth-token";
import * as MattrService from "@/services/mattr.service";
import { configSchema } from "@/types/common";
import { retrieveCustomDomainResBodySchema } from "@/types/retrieve-custom-domain";
import {
  retrieveDidsArgsSchema,
  retrieveDidsResBodySchema,
} from "@/types/retrieve-dids";
import {
  resolveDidArgsSchema,
  resolveDidResBodySchema,
} from "@/types/resolve-did";
import { didDocumentSchema } from "@/types/did-document";
import { createDidArgsSchema } from "@/types/create-did";
import {
  createCredentialArgsSchema,
  createCredentialResBodySchema,
} from "@/types/create-credential";
import {
  encryptMessageArgsSchema,
  encryptMessageResBodySchema,
} from "@/types/encrypt-message";
import { sendMessageArgsSchema } from "@/types/send-message";

export const coreRoutes = createTRPCRouter({
  createAuthToken: publicProcedure
    .input(createAuthTokenArgsSchema)
    .output(createAuthTokenResBodySchema)
    .mutation(async ({ input }) => {
      return (await MattrService.createAuthToken(input)).data;
    }),

  retrieveCustomDomain: publicProcedure
    .input(configSchema)
    .output(retrieveCustomDomainResBodySchema)
    .query(async ({ input }) => {
      return (await MattrService.retrieveCustomDomain(input)).data;
    }),

  retrieveDids: publicProcedure
    .input(retrieveDidsArgsSchema)
    .output(retrieveDidsResBodySchema)
    .mutation(async ({ input }) => {
      return (await MattrService.retrieveDids(input)).data;
    }),

  resolveDid: publicProcedure
    .input(resolveDidArgsSchema)
    .output(resolveDidResBodySchema)
    .query(async ({ input }) => {
      return (await MattrService.resolveDid(input)).data;
    }),

  createDid: publicProcedure
    .input(createDidArgsSchema)
    .output(didDocumentSchema)
    .mutation(async ({ input }) => {
      return (await MattrService.createDid(input)).data;
    }),

  createCredential: publicProcedure
    .input(createCredentialArgsSchema)
    // .output(createCredentialResBodySchema)
    .mutation(async ({ input }) => {
      return (await MattrService.createCredential(input)).data;
    }),

  encryptMessage: publicProcedure
    .input(encryptMessageArgsSchema)
    .output(encryptMessageResBodySchema)
    .mutation(async ({ input }) => {
      return (await MattrService.encryptMessage(input)).data;
    }),

  sendMessage: publicProcedure
    .input(sendMessageArgsSchema)
    .output(z.object({ status: z.number() }))
    .mutation(async ({ input }) => {
      return {
        status: (await MattrService.sendMessage(input)).status,
      };
    }),
});
