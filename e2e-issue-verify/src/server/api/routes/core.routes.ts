import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  issueStaticCredentialArgsSchema,
  issueStaticCredentialResSchema,
} from "@/types/issue-static-credential";
import * as CoreService from "@/services/core.service";

export const coreRoutes = createTRPCRouter({
  issueStaticCredential: publicProcedure
    .input(issueStaticCredentialArgsSchema)
    .output(issueStaticCredentialResSchema)
    .mutation(async ({ input }) => {
      return await CoreService.issueStaticCredential(input);
    }),
  createPresentationRequestQueryByExample: publicProcedure.query(() => ({
    firedAt: Date.now(),
  })),
});
