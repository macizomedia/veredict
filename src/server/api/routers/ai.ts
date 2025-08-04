import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { AIAgentService } from "@/lib/ai-agent";

export const aiRouter = createTRPCRouter({
  // Generate content using AI Agent
  generateContent: publicProcedure
    .input(z.object({
      prompt: z.string().min(1, "Prompt is required"),
      sources: z.array(z.string()).optional(),
      tone: z.enum(['neutral', 'optimistic', 'analytical', 'professional', 'conversational']).default('neutral'),
      style: z.enum(['standard', 'journalistic', 'academic', 'blog', 'technical']).default('standard'),
      length: z.enum(['short', 'medium', 'long']).default('medium'),
    }))
    .mutation(async ({ input }) => {
      try {
        const result = await AIAgentService.generateContentSimple(input);
        return {
          success: true,
          data: result,
        };
      } catch (error) {
        console.error('AI content generation failed:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          data: null,
        };
      }
    }),

  // Test AI Agent connection
  testConnection: publicProcedure
    .query(async () => {
      try {
        const isConnected = await AIAgentService.testConnection();
        return {
          connected: isConnected,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        return {
          connected: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        };
      }
    }),

  // Create a post with AI-generated content
  createPostWithAI: publicProcedure
    .input(z.object({
      title: z.string().min(1, "Title is required"),
      prompt: z.string().min(1, "Prompt is required"),
      sources: z.array(z.string()).optional(),
      tone: z.enum(['neutral', 'optimistic', 'analytical', 'professional', 'conversational']).default('neutral'),
      style: z.enum(['standard', 'journalistic', 'academic', 'blog', 'technical']).default('standard'),
      length: z.enum(['short', 'medium', 'long']).default('medium'),
      categoryId: z.number().optional(),
      minRead: z.number().min(1).default(5),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Generate content using AI Agent
        const aiResult = await AIAgentService.generateContentSimple({
          prompt: input.prompt,
          sources: input.sources,
          tone: input.tone,
          style: input.style,
          length: input.length,
        });

        if (!aiResult.contentBlocks || aiResult.contentBlocks.length === 0) {
          throw new Error('AI failed to generate content blocks');
        }

        // Create slug from title
        const slug = input.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') + `-${Date.now()}`;

        // Create the post container with PUBLISHED status so it appears in feed
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const post = await (ctx.db as any).post.create({
          data: {
            slug,
            status: 'PUBLISHED',
            ...(input.categoryId && { 
              category: {
                connect: { id: input.categoryId }
              }
            }),
          }
        });

        // Create the revision
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const revision = await (ctx.db as any).revision.create({
          data: {
            post: {
              connect: { id: post.id }
            },
            title: input.title,
            prompt: input.prompt,
            contentBlocks: {
              blocks: aiResult.contentBlocks,
            },
            tone: input.tone.toUpperCase(),
            style: input.style.toUpperCase(),
            minRead: input.minRead,
            summaryOfChanges: 'AI-generated initial version',
            version: 1,
          }
        });

        // Update post to link to the current revision
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updatedPost = await (ctx.db as any).post.update({
          where: { id: post.id },
          data: {
            currentRevision: {
              connect: { id: revision.id }
            }
          },
          include: {
            currentRevision: true,
          }
        });

        // Create analytics entry
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (ctx.db as any).analytics.create({
          data: {
            postId: updatedPost.id,
            views: 0,
            sourceClicks: 0,
          },
        });

        // Since we don't have authentication, we'll skip adding authors for now
        // This is a limitation for testing without auth

        return {
          success: true,
          post: {
            id: updatedPost.id,
            slug: updatedPost.slug,
            title: updatedPost.currentRevision.title,
            contentBlocks: updatedPost.currentRevision.contentBlocks,
            tone: updatedPost.currentRevision.tone,
            style: updatedPost.currentRevision.style,
            minRead: updatedPost.currentRevision.minRead,
            status: updatedPost.status,
            createdAt: updatedPost.createdAt,
            version: revision.version,
          },
          aiGenerated: true,
          reviewRequired: aiResult.reviewRequired,
        };

      } catch (error) {
        console.error('AI post creation failed:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to create AI-generated post');
      }
    }),
});
