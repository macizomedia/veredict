import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

export const userRouter = createTRPCRouter({
  // Get current user profile with stats
  getProfile: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const user = await (ctx.db as any).user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            reputation: true,
            _count: {
              select: {
                authoredPosts: true,
                votes: true,
                internalComments: true,
              },
            },
          },
        });

        if (!user) {
          throw new Error("User not found");
        }

        // Get user's posts stats - handle case where user has no posts
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const postsStats = await (ctx.db as any).post.groupBy({
          by: ['status'],
          where: {
            authors: {
              some: {
                userId,
              },
            },
          },
          _count: {
            id: true,
          },
        }).catch(() => []); // Return empty array if no posts found

        // Get user's recent activity
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const recentPosts = await (ctx.db as any).post.findMany({
          where: {
            authors: {
              some: {
                userId,
              },
            },
          },
          select: {
            id: true,
            title: true,
            status: true,
            upVotes: true,
            downVotes: true,
            createdAt: true,
            updatedAt: true,
            version: true,
          },
          orderBy: { updatedAt: "desc" },
          take: 5,
        }).catch(() => []); // Return empty array if no posts found

        // Transform posts stats into a more usable format
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const statusCounts = Array.isArray(postsStats) ? postsStats.reduce((acc: Record<string, number>, stat: any) => {
          acc[stat.status] = stat._count.id;
          return acc;
        }, {} as Record<string, number>) : {};

        return {
          ...user,
          stats: {
            totalPosts: user._count.authoredPosts,
            totalVotes: user._count.votes,
            totalComments: user._count.internalComments,
            postsByStatus: {
              DRAFT: statusCounts.DRAFT ?? 0,
              PUBLISHED: statusCounts.PUBLISHED ?? 0,
              ARCHIVED: statusCounts.ARCHIVED ?? 0,
              DISPUTED: statusCounts.DISPUTED ?? 0,
            },
          },
          recentPosts: Array.isArray(recentPosts) ? recentPosts : [],
          _count: undefined, // Remove the raw count data
        };
      } catch (error) {
        console.error('Error in getProfile:', error);
        throw new Error(`Failed to get user profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }),

  // Get user's posts with pagination
  getUserPosts: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(10),
      cursor: z.number().optional(),
      status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED", "DISPUTED"]).optional(),
    }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const posts = await (ctx.db as any).post.findMany({
        where: {
          authors: {
            some: {
              userId,
            },
          },
          ...(input.status && { status: input.status }),
        },
        select: {
          id: true,
          title: true,
          status: true,
          version: true,
          isLatest: true,
          summaryOfChanges: true,
          upVotes: true,
          downVotes: true,
          createdAt: true,
          updatedAt: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          analytics: {
            select: {
              views: true,
              sourceClicks: true,
            },
          },
          _count: {
            select: {
              internalComments: true,
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        take: input.limit + 1,
        ...(input.cursor && {
          cursor: { id: input.cursor },
          skip: 1,
        }),
      });

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (posts.length > input.limit) {
        const nextItem = posts.pop();
        nextCursor = nextItem?.id;
      }

      return {
        posts,
        nextCursor,
      };
    }),

  // Update user role (admin only)
  updateRole: protectedProcedure
    .input(z.object({
      userId: z.string(),
      role: z.enum(["AUTHOR", "EDITOR", "ADMIN"]),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if current user is admin
      if (ctx.session.user.role !== "ADMIN") {
        throw new Error("Only admins can update user roles");
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updatedUser = await (ctx.db as any).user.update({
        where: { id: input.userId },
        data: { role: input.role },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

      return updatedUser;
    }),

  // Get all users (admin only)
  getAllUsers: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      cursor: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      // Check if current user is admin
      if (ctx.session.user.role !== "ADMIN") {
        throw new Error("Only admins can view all users");
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const users = await (ctx.db as any).user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          reputation: true,
          _count: {
            select: {
              authoredPosts: true,
              votes: true,
            },
          },
        },
        orderBy: { reputation: "desc" },
        take: input.limit + 1,
        ...(input.cursor && {
          cursor: { id: input.cursor },
          skip: 1,
        }),
      });

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (users.length > input.limit) {
        const nextItem = users.pop();
        nextCursor = nextItem?.id;
      }

      return {
        users,
        nextCursor,
      };
    }),

  // Get user by email (for adding authors)
  getUserByEmail: protectedProcedure
    .input(z.object({
      email: z.string().email(),
    }))
    .query(async ({ ctx, input }) => {
      // Only allow if user is EDITOR or ADMIN, or is searching for collaboration
      const userRole = ctx.session.user.role;
      if (!['EDITOR', 'ADMIN'].includes(userRole)) {
        // Allow authors to search for other users for collaboration
        // but limit the information returned
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const user = await (ctx.db as any).user.findUnique({
        where: { email: input.email },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
        },
      });

      return user;
    }),

  // Search users by partial email/name (for better UX in author management)
  searchUsers: protectedProcedure
    .input(z.object({
      query: z.string().min(2).max(50),
      limit: z.number().min(1).max(10).default(5),
    }))
    .query(async ({ ctx, input }) => {
      const { query, limit } = input;
      
      // Validate query is not just whitespace
      if (!query.trim()) {
        return [];
      }

      const userRole = ctx.session.user.role;
      if (!['EDITOR', 'ADMIN'].includes(userRole)) {
        // Allow authors to search for collaboration but limit results
      }

      const searchTerm = query.trim().toLowerCase();

      // TODO: Add Redis caching here
      // Example Redis implementation:
      // const cacheKey = `user_search:${searchTerm}`;
      // const cached = await redis.get(cacheKey);
      // if (cached) return JSON.parse(cached);

      // Search by email or name using contains/ILIKE for partial matching
      // This provides much better UX than exact email matching
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const users = await (ctx.db as any).user.findMany({
        where: {
          OR: [
            {
              email: {
                contains: searchTerm,
                mode: 'insensitive' as const,
              },
            },
            {
              name: {
                contains: searchTerm,
                mode: 'insensitive' as const,
              },
            },
          ],
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
        },
        take: limit,
        orderBy: [
          // Prioritize exact email matches first
          {
            email: 'asc' as const,
          },
          {
            name: 'asc' as const,
          },
        ],
      });

      // TODO: Cache results for 5-10 minutes
      // await redis.setex(cacheKey, 300, JSON.stringify(users));

      return users;
    }),
});
