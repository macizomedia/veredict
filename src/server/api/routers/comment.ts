import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";

export const commentRouter = createTRPCRouter({
  // Get comments for a post
  getByPostId: publicProcedure
    .input(z.object({ postId: z.number() }))
    .query(async ({ ctx, input }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comments = await (ctx.db as any).comment.findMany({
        where: { postId: input.postId },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return comments;
    }),

  // Create a new comment
  create: protectedProcedure
    .input(
      z.object({
        postId: z.number(),
        content: z.string().min(1, "Comment cannot be empty").max(1000, "Comment too long"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if post exists and is published
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const post = await (ctx.db as any).post.findUnique({
        where: { id: input.postId },
        select: { id: true, status: true },
      });

      if (!post) {
        throw new Error("Post not found");
      }

      if (post.status !== "PUBLISHED") {
        throw new Error("Cannot comment on unpublished posts");
      }

      // Create the comment
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comment = await (ctx.db as any).comment.create({
        data: {
          content: input.content,
          postId: input.postId,
          authorId: ctx.session.user.id,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              role: true,
            },
          },
        },
      });

      return comment;
    }),

  // Update a comment (only by author)
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        content: z.string().min(1, "Comment cannot be empty").max(1000, "Comment too long"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if comment exists and user is the author
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const existingComment = await (ctx.db as any).comment.findUnique({
        where: { id: input.id },
        select: { authorId: true },
      });

      if (!existingComment) {
        throw new Error("Comment not found");
      }

      if (existingComment.authorId !== ctx.session.user.id) {
        throw new Error("You can only edit your own comments");
      }

      // Update the comment
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comment = await (ctx.db as any).comment.update({
        where: { id: input.id },
        data: { content: input.content },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              role: true,
            },
          },
        },
      });

      return comment;
    }),

  // Delete a comment (by author or admin)
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Check if comment exists and user has permission
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const existingComment = await (ctx.db as any).comment.findUnique({
        where: { id: input.id },
        select: { authorId: true },
      });

      if (!existingComment) {
        throw new Error("Comment not found");
      }

      const isAuthor = existingComment.authorId === ctx.session.user.id;
      const isAdmin = ctx.session.user.role === "ADMIN";

      if (!isAuthor && !isAdmin) {
        throw new Error("You can only delete your own comments");
      }

      // Delete the comment
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (ctx.db as any).comment.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Get comment count for a post
  getCount: publicProcedure
    .input(z.object({ postId: z.number() }))
    .query(async ({ ctx, input }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const count = await (ctx.db as any).comment.count({
        where: { postId: input.postId },
      });

      return count;
    }),
});
