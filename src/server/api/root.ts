import { functionRouter } from "@/server/api/routers/function";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import {questionRouter} from "@/server/api/routers/question";
import { submissionRouter } from "@/server/api/routers/submission";
import { leaderboardRouter } from "./routers/leaderboard";
import { functionR1Router } from "./routers/R1";


/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  f: functionRouter,
  question: questionRouter,
  submission: submissionRouter,
  leaderboard: leaderboardRouter,
  r1: functionR1Router,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
