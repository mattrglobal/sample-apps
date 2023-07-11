import { createTRPCRouter } from "@/server/trpc";
import { coreRoutes } from "./routers/core.routes";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  coreRoutes
});

// export type definition of API
export type AppRouter = typeof appRouter;
