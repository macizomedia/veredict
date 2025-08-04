import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "@/server/api/trpc";

export const revisionRouter = createTRPCRouter({
  // Get all revisions for a post
  getByPostId: publicProcedure
    .input(z.object({ 
      postId: z.number(),
      includeContent: z.boolean().default(true)
    }))
    .query(async ({ ctx, input }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const revisions = await (ctx.db as any).revision.findMany({
        where: { postId: input.postId },
        orderBy: { version: 'desc' },
        select: {
          id: true,
          title: input.includeContent,
          contentBlocks: input.includeContent,
          prompt: input.includeContent,
          tone: true,
          style: true,
          minRead: true,
          location: input.includeContent,
          summaryOfChanges: true,
          version: true,
          createdAt: true,
          updatedAt: true,
          parentId: true,
          parent: {
            select: {
              id: true,
              version: true,
              title: true,
              createdAt: true,
            }
          }
        }
      });

      return revisions;
    }),

  // Get a specific revision
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const revision = await (ctx.db as any).revision.findUnique({
        where: { id: input.id },
        include: {
          post: {
            select: {
              id: true,
              slug: true,
              status: true,
              category: true,
              upVotes: true,
              downVotes: true,
              createdAt: true,
            }
          },
          parent: {
            select: {
              id: true,
              version: true,
              title: true,
              summaryOfChanges: true,
              createdAt: true,
            }
          },
          children: {
            select: {
              id: true,
              version: true,
              title: true,
              summaryOfChanges: true,
              createdAt: true,
            },
            orderBy: { version: 'asc' }
          }
        }
      });

      return revision;
    }),

  // Create a new revision
  create: protectedProcedure
    .input(z.object({
      postId: z.number(),
      title: z.string().min(1, "Title is required"),
      contentBlocks: z.any().optional(),
      prompt: z.string().min(1, "Prompt is required"),
      tone: z.string(),
      style: z.string(),
      minRead: z.number().min(1).default(5),
      location: z.any().optional(),
      summaryOfChanges: z.string().min(1, "Summary of changes is required"),
      parentId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Get the post to check permissions and get current version
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const post = await (ctx.db as any).post.findUnique({
        where: { id: input.postId },
        include: {
          currentRevision: { select: { version: true } },
          authors: { where: { userId: ctx.session.user.id } }
        }
      });

      if (!post) {
        throw new Error("Post not found");
      }

      // Check if user is an author of this post
      if (post.authors.length === 0) {
        throw new Error("You don't have permission to edit this post");
      }

      const nextVersion = (post.currentRevision?.version || 0) + 1;

      // Create the new revision
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const revision = await (ctx.db as any).revision.create({
        data: {
          ...input,
          version: nextVersion,
        },
        include: {
          post: { select: { id: true, slug: true } },
          parent: { select: { id: true, version: true } }
        }
      });

      // Update the post's current revision
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (ctx.db as any).post.update({
        where: { id: input.postId },
        data: { 
          currentRevisionId: revision.id,
          updatedAt: new Date()
        }
      });

      return revision;
    }),

  // Compare two revisions
  compare: publicProcedure
    .input(z.object({
      fromRevisionId: z.number(),
      toRevisionId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const [fromRevision, toRevision] = await Promise.all([
        (ctx.db as any).revision.findUnique({
          where: { id: input.fromRevisionId },
          select: {
            id: true,
            title: true,
            contentBlocks: true,
            prompt: true,
            tone: true,
            style: true,
            minRead: true,
            version: true,
            summaryOfChanges: true,
            createdAt: true,
          }
        }),
        (ctx.db as any).revision.findUnique({
          where: { id: input.toRevisionId },
          select: {
            id: true,
            title: true,
            contentBlocks: true,
            prompt: true,
            tone: true,
            style: true,
            minRead: true,
            version: true,
            summaryOfChanges: true,
            createdAt: true,
          }
        })
      ]);

      if (!fromRevision || !toRevision) {
        throw new Error("One or both revisions not found");
      }

      // Simple diff calculation (you could use a proper diff library here)
      const changes = {
        title: fromRevision.title !== toRevision.title,
        prompt: fromRevision.prompt !== toRevision.prompt,
        tone: fromRevision.tone !== toRevision.tone,
        style: fromRevision.style !== toRevision.style,
        minRead: fromRevision.minRead !== toRevision.minRead,
        contentBlocks: JSON.stringify(fromRevision.contentBlocks) !== JSON.stringify(toRevision.contentBlocks),
      };

      return {
        from: fromRevision,
        to: toRevision,
        changes,
        hasChanges: Object.values(changes).some(Boolean),
      };
    }),
});
