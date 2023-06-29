import { createTRPCRouter } from "@/server/api/trpc";
import { mattrRoutes } from "./routes/mattr.routes";

export const appRouter = createTRPCRouter({
  mattrRoutes,
});

export type AppRouter = typeof appRouter;
