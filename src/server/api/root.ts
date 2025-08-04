import { postRouter } from "@/server/api/routers/post";
import { categoryRouter } from "@/server/api/routers/category";
import { userRouter } from "@/server/api/routers/user";
import { searchRouter } from "@/server/api/routers/search";
import { commentRouter } from "@/server/api/routers/comment";
import { aiRouter } from "@/server/api/routers/ai";
import { revisionRouter } from "@/server/api/routers/revision";
import { contentRouter } from "@/server/api/routers/content";
import { llmRouter } from "@/server/api/routers/llm";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  category: categoryRouter,
  user: userRouter,
  search: searchRouter,
  comment: commentRouter,
  ai: aiRouter,
  revision: revisionRouter,
  content: contentRouter,
  llm: llmRouter,
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
