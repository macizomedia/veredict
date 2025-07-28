import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { SearchCache } from "@/server/redis";

export const postRouter = createTRPCRouter({
  // Get all posts - now with relationships and voting information + Redis caching
  getFeed: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(10),
      categoryId: z.number().optional(),
    }))
    .query(async ({ ctx, input }) => {
      // Generate cache key for feed
      const cacheKey = SearchCache.generateFeedKey(input.categoryId, input.limit);
      
      // Try to get from cache first (shorter TTL for feeds since they update frequently)
      const cachedResult = await SearchCache.get(cacheKey);
      if (cachedResult) {
        console.log('🎯 Cache HIT for feed:', input.categoryId || 'all');
        return cachedResult;
      }

      console.log('💾 Cache MISS for feed:', input.categoryId || 'all', '- fetching from DB');
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const posts = await (ctx.db as any).post.findMany({
        take: input.limit,
        where: {
          ...(input.categoryId !== undefined ? { categoryId: input.categoryId } : {}),
          isLatest: true, // Only show latest versions
          status: 'PUBLISHED', // Only show published posts in the feed
        },
        orderBy: { createdAt: "desc" },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          authors: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                  role: true,
                },
              },
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
          // Include user's vote if authenticated
          ...(ctx.session?.user && {
            votes: {
              where: { userId: ctx.session.user.id },
              select: { voteType: true },
            },
          }),
        },
      });

      // Add derived fields for each post
      const enrichedPosts = posts.map((post: any) => ({
        ...post,
        userVote: post.votes?.[0]?.voteType ?? null,
        isAuthor: ctx.session?.user 
          ? post.authors.some((author: { user: { id: string } }) => author.user.id === ctx.session!.user.id)
          : false,
        commentCount: post._count.internalComments,
        // Remove votes from response to keep it clean
        votes: undefined,
      }));

      const result = {
        posts: enrichedPosts,
        nextCursor: undefined,
      };

      // Cache the result for 2 minutes (shorter TTL for feeds)
      await SearchCache.set(cacheKey, result, 120);

      return result;
    }),

  // Create a new post - now requires authentication and handles relationships
  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1, "Title is required"),
      prompt: z.string().min(1, "Prompt is required"),
      minRead: z.number().min(1, "Minimum read time is required"),
      categoryId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { categoryId, ...postData } = input;
      
      // Create the post with default tone and style
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const post = await (ctx.db as any).post.create({
        data: {
          ...postData,
          tone: "Professional", // Default tone
          style: "Article", // Default style
          ...(categoryId && { categoryId }),
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          authors: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                  role: true,
                },
              },
            },
          },
        },
      });

      // Add the current user as an author
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (ctx.db as any).postAuthor.create({
        data: {
          postId: post.id,
          userId: ctx.session.user.id,
        },
      });

      // Create analytics entry for the new post
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (ctx.db as any).analytics.create({
        data: {
          postId: post.id,
          views: 0,
          sourceClicks: 0,
        },
      });

      // Invalidate relevant caches
      await SearchCache.invalidate('feed:*');
      if (categoryId) {
        await SearchCache.invalidate(`feed:${categoryId}:*`);
      }
      await SearchCache.invalidate('search:*');

      return post;
    }),

    // Get post by ID - now with full relationships including version info
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const post = await (ctx.db as any).post.findUnique({
        where: { id: input.id },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          authors: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                  role: true,
                  reputation: true,
                },
              },
            },
          },
          sources: {
            select: {
              id: true,
              url: true,
            },
          },
          labels: {
            select: {
              id: true,
              label: true,
              justification: true,
              sourceUrl: true,
            },
          },
          analytics: {
            select: {
              views: true,
              sourceClicks: true,
            },
          },
          // Include version history
          parent: {
            select: {
              id: true,
              version: true,
              summaryOfChanges: true,
              createdAt: true,
            },
          },
          revisions: {
            select: {
              id: true,
              version: true,
              summaryOfChanges: true,
              createdAt: true,
              status: true,
            },
            orderBy: { version: "desc" },
          },
          // Include user's vote if authenticated
          ...(ctx.session?.user && {
            votes: {
              where: { userId: ctx.session.user.id },
              select: { voteType: true },
            },
          }),
        },
      });

      if (!post) {
        throw new Error("Post not found");
      }

      return {
        ...post,
        userVote: post.votes?.[0]?.voteType ?? null,
        isAuthor: ctx.session?.user 
          ? post.authors.some((author: { user: { id: string } }) => author.user.id === ctx.session!.user.id)
          : false,
        // Remove votes from response to keep it clean
        votes: undefined,
      };
    }),

  // Increment view count for a post
  incrementViews: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Update or create analytics entry
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (ctx.db as any).analytics.upsert({
          where: { postId: input.id },
          update: {
            views: {
              increment: 1,
            },
            updatedAt: new Date(),
          },
          create: {
            postId: input.id,
            views: 1,
            sourceClicks: 0,
          },
        });

        return { success: true };
      } catch (error) {
        console.error("Error incrementing views for post", input.id, error);
        throw new Error("Failed to increment views");
      }
    }),

  // Vote on a post
  vote: protectedProcedure
    .input(z.object({
      postId: z.number(),
      voteType: z.enum(["UPVOTE", "DOWNVOTE"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const { postId, voteType } = input;
      const userId = ctx.session.user.id;

      // Check if the post exists and is published
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const post = await (ctx.db as any).post.findUnique({
        where: { id: postId },
        select: { 
          id: true, 
          status: true,
          authors: {
            select: {
              userId: true,
            },
          },
        },
      });

      if (!post) {
        throw new Error("Post not found");
      }

      if (post.status !== "PUBLISHED") {
        throw new Error("Only published posts can be voted on");
      }

      // Check if user is an author of the post (users can vote on their own posts)
      const isAuthor = post.authors.some((author: { userId: string }) => author.userId === userId);

      // Check if user already voted
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const existingVote = await (ctx.db as any).vote.findUnique({
        where: {
          postId_userId: {
            postId,
            userId,
          },
        },
      });

      if (existingVote) {
        if (existingVote.voteType === voteType) {
          // Same vote type - remove the vote
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (ctx.db as any).vote.delete({
            where: {
              postId_userId: {
                postId,
                userId,
              },
            },
          });

          // Update post vote counts
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (ctx.db as any).post.update({
            where: { id: postId },
            data: {
              ...(voteType === "UPVOTE" 
                ? { upVotes: { decrement: 1 } }
                : { downVotes: { decrement: 1 } }
              ),
            },
          });
        } else {
          // Different vote type - update the vote
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (ctx.db as any).vote.update({
            where: {
              postId_userId: {
                postId,
                userId,
              },
            },
            data: { voteType },
          });

          // Update post vote counts (remove old vote, add new vote)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (ctx.db as any).post.update({
            where: { id: postId },
            data: {
              ...(voteType === "UPVOTE" 
                ? { upVotes: { increment: 1 }, downVotes: { decrement: 1 } }
                : { downVotes: { increment: 1 }, upVotes: { decrement: 1 } }
              ),
            },
          });
        }
      } else {
        // Create new vote
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (ctx.db as any).vote.create({
          data: {
            postId,
            userId,
            voteType,
          },
        });

        // Update post vote counts
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (ctx.db as any).post.update({
          where: { id: postId },
          data: {
            ...(voteType === "UPVOTE" 
              ? { upVotes: { increment: 1 } }
              : { downVotes: { increment: 1 } }
            ),
          },
        });
      }

      // Return updated post with user's vote status
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updatedPost = await (ctx.db as any).post.findUnique({
        where: { id: postId },
        select: {
          id: true,
          upVotes: true,
          downVotes: true,
          votes: {
            where: { userId },
            select: { voteType: true },
          },
        },
      });

      return {
        ...updatedPost,
        userVote: updatedPost.votes[0]?.voteType ?? null,
        isAuthor,
      };
    }),

  // Get user's vote status for posts
  getUserVotes: protectedProcedure
    .input(z.object({
      postIds: z.array(z.number()),
    }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const votes = await (ctx.db as any).vote.findMany({
        where: {
          userId,
          postId: { in: input.postIds },
        },
        select: {
          postId: true,
          voteType: true,
        },
      });

      return votes.reduce((acc: Record<number, string>, vote: { postId: number; voteType: string }) => {
        acc[vote.postId] = vote.voteType;
        return acc;
      }, {} as Record<number, string>);
    }),

  // Publish a draft post
  publish: protectedProcedure
    .input(z.object({
      postId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // First check if the post exists and user is an author
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const post = await (ctx.db as any).post.findFirst({
        where: {
          id: input.postId,
          authors: {
            some: {
              userId,
            },
          },
        },
      });

      if (!post) {
        throw new Error("Post not found or you don't have permission to publish it");
      }

      if (post.status !== 'DRAFT') {
        throw new Error("Only draft posts can be published");
      }

      // Update the post status to PUBLISHED
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updatedPost = await (ctx.db as any).post.update({
        where: { id: input.postId },
        data: { 
          status: 'PUBLISHED',
          updatedAt: new Date(),
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          authors: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      // Invalidate relevant caches when post is published
      await SearchCache.invalidate('feed:*');
      await SearchCache.invalidate('search:*');
      if (updatedPost.categoryId) {
        await SearchCache.invalidate(`feed:${updatedPost.categoryId}:*`);
      }

      return updatedPost;
    }),

  // Update/Edit a post - with role-based permissions
  update: protectedProcedure
    .input(z.object({
      postId: z.number(),
      title: z.string().min(1, "Title is required").optional(),
      prompt: z.string().min(1, "Prompt is required").optional(),
      tone: z.string().min(1, "Tone is required").optional(),
      style: z.string().min(1, "Style is required").optional(),
      minRead: z.number().min(1, "Minimum read time is required").optional(),
      categoryId: z.number().optional(),
      contentBlocks: z.any().optional(),
      summaryOfChanges: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { postId, summaryOfChanges, ...updateData } = input;

      // Check if user has permission to edit this post
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const post = await (ctx.db as any).post.findUnique({
        where: { id: postId },
        include: {
          authors: {
            include: {
              user: {
                select: {
                  id: true,
                  role: true,
                },
              },
            },
          },
        },
      });

      if (!post) {
        throw new Error("Post not found");
      }

      const userId = ctx.session.user.id;
      const userRole = ctx.session.user.role;
      const isAuthor = post.authors.some((author: any) => author.user.id === userId);
      const canEdit = isAuthor || userRole === 'EDITOR' || userRole === 'ADMIN';

      if (!canEdit) {
        throw new Error("You don't have permission to edit this post");
      }

      // If this is a significant edit, create a new version
      const shouldCreateVersion = summaryOfChanges && Object.keys(updateData).length > 0;
      
      if (shouldCreateVersion) {
        // Mark current version as not latest
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (ctx.db as any).post.update({
          where: { id: postId },
          data: { isLatest: false },
        });

        // Create new version
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { authors, ...postDataWithoutRelations } = post;
        const newVersion = await (ctx.db as any).post.create({
          data: {
            ...postDataWithoutRelations,
            id: undefined, // Let DB generate new ID
            parentId: postId,
            version: post.version + 1,
            isLatest: true,
            summaryOfChanges,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...updateData,
          },
        });

        // Copy authors to new version
        for (const author of post.authors) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (ctx.db as any).postAuthor.create({
            data: {
              postId: newVersion.id,
              userId: author.user.id,
            },
          });
        }

        return newVersion;
      } else {
        // Simple update without versioning
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updatedPost = await (ctx.db as any).post.update({
          where: { id: postId },
          data: {
            ...updateData,
            updatedAt: new Date(),
          },
          include: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
            authors: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    role: true,
                  },
                },
              },
            },
          },
        });

        return updatedPost;
      }
    }),

  // Add author to post - EDITOR and ADMIN can add authors
  addAuthor: protectedProcedure
    .input(z.object({
      postId: z.number(),
      userId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const userRole = ctx.session.user.role;

      // Check if user has permission to add authors
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const post = await (ctx.db as any).post.findUnique({
        where: { id: input.postId },
        include: {
          authors: {
            include: {
              user: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      });

      if (!post) {
        throw new Error("Post not found");
      }

      const isAuthor = post.authors.some((author: any) => author.user.id === userId);
      const canAddAuthors = isAuthor || userRole === 'EDITOR' || userRole === 'ADMIN';

      if (!canAddAuthors) {
        throw new Error("You don't have permission to add authors to this post");
      }

      // Check if user is already an author
      const isAlreadyAuthor = post.authors.some((author: any) => author.user.id === input.userId);
      if (isAlreadyAuthor) {
        throw new Error("User is already an author of this post");
      }

      // Add the author
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (ctx.db as any).postAuthor.create({
        data: {
          postId: input.postId,
          userId: input.userId,
        },
      });

      return { success: true };
    }),

  // Remove author from post - EDITOR and ADMIN can remove authors
  removeAuthor: protectedProcedure
    .input(z.object({
      postId: z.number(),
      userId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const currentUserId = ctx.session.user.id;
      const userRole = ctx.session.user.role;

      // Check if user has permission to remove authors
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const post = await (ctx.db as any).post.findUnique({
        where: { id: input.postId },
        include: {
          authors: {
            include: {
              user: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      });

      if (!post) {
        throw new Error("Post not found");
      }

      const isCurrentUserAuthor = post.authors.some((author: any) => author.user.id === currentUserId);
      const canRemoveAuthors = isCurrentUserAuthor || userRole === 'EDITOR' || userRole === 'ADMIN';

      if (!canRemoveAuthors) {
        throw new Error("You don't have permission to remove authors from this post");
      }

      // Don't allow removing the last author
      if (post.authors.length <= 1) {
        throw new Error("Cannot remove the last author from a post");
      }

      // Remove the author
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (ctx.db as any).postAuthor.delete({
        where: {
          postId_userId: {
            postId: input.postId,
            userId: input.userId,
          },
        },
      });

      return { success: true };
    }),

  // Get post versions/history
  getVersions: protectedProcedure
    .input(z.object({
      postId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      // Check if user has access to this post
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const post = await (ctx.db as any).post.findUnique({
        where: { id: input.postId },
        include: {
          authors: {
            include: {
              user: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      });

      if (!post) {
        throw new Error("Post not found");
      }

      const userId = ctx.session.user.id;
      const userRole = ctx.session.user.role;
      const isAuthor = post.authors.some((author: any) => author.user.id === userId);
      const canViewVersions = isAuthor || userRole === 'EDITOR' || userRole === 'ADMIN';

      if (!canViewVersions) {
        throw new Error("You don't have permission to view post versions");
      }

      // Get all versions (including the original and revisions)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const versions = await (ctx.db as any).post.findMany({
        where: {
          OR: [
            { id: input.postId },
            { parentId: input.postId },
          ],
        },
        select: {
          id: true,
          version: true,
          isLatest: true,
          summaryOfChanges: true,
          createdAt: true,
          updatedAt: true,
          status: true,
          title: true,
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
        orderBy: { version: 'desc' },
      });

      return versions;
    }),

});
