import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

export const categoryRouter = createTRPCRouter({
  // Get all categories
  getAll: publicProcedure.query(async ({ ctx }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const categories = await (ctx.db as any).category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            posts: {
              where: {
                status: 'PUBLISHED',
                isLatest: true,
              },
            },
          },
        },
      },
    });

    return categories;
  }),

  // Create a new category (admin only for now)
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1, "Category name is required") }))
    .mutation(async ({ ctx, input }) => {
      // TODO: Add role-based authorization here
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const category = await (ctx.db as any).category.create({
        data: {
          name: input.name,
        },
      });

      return category;
    }),

  // Get category by ID with posts
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const category = await (ctx.db as any).category.findUnique({
        where: { id: input.id },
        include: {
          posts: {
            where: {
              status: "PUBLISHED",
              isLatest: true,
            },
            take: 10,
            orderBy: { createdAt: "desc" },
            include: {
              authors: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      image: true,
                    },
                  },
                },
              },
            },
          },
          _count: {
            select: {
              posts: true,
            },
          },
        },
      });

      return category;
    }),
});
