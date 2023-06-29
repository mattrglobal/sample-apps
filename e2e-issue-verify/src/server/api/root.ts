import { createTRPCRouter } from "@/server/api/trpc";
import { coreRoutes } from "./routes/core.routes";
import { mattrRoutes } from "./routes/mattr.routes";

export const appRouter = createTRPCRouter({
  mattrRoutes,
  coreRoutes,
});

export type AppRouter = typeof appRouter;
