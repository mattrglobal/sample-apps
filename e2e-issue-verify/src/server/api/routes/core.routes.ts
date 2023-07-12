import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  issueStaticCredentialArgsSchema,
  issueStaticCredentialResSchema,
} from "@/types/issue-static-credential";
import * as CoreService from "@/services/core.service";
import { mattrConfigSchema } from "@/types/common";

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
});
