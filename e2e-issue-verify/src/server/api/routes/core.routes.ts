import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  issueStaticCredentialArgsSchema,
  issueStaticCredentialResSchema,
} from "@/types/issue-static-credential";
import * as CoreService from "@/services/core.service";
import { mattrConfigSchema } from "@/types/common";
import { z } from "zod";
import { prisma } from "@/server/db";

export const coreRoutes = createTRPCRouter({
  issueStaticCredential: publicProcedure
    .input(issueStaticCredentialArgsSchema)
    .output(issueStaticCredentialResSchema)
    .mutation(async ({ input }) => {
      return await CoreService.issueStaticCredential(input);
    }),
  createPresentationRequestQueryByExample: publicProcedure
    .input(mattrConfigSchema)
    .mutation(async ({ input }) => {
      return await CoreService.createPresentationRequestQueryByExample(input);
    }),
  getPresentationResponse: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const { id } = input;
      return await prisma.presentationRequest.findUnique({
        where: { id },
        select: { id: true, response: true },
      });
    }),
});
