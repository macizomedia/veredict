import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const searchRouter = createTRPCRouter({
  // Full-text search across posts
  searchPosts: publicProcedure
    .input(z.object({
      query: z.string().min(1).max(100),
      categoryId: z.number().optional(),
      limit: z.number().min(1).max(50).default(20),
      sortBy: z.enum(["relevance", "date", "views"]).default("relevance"),
    }))
    .query(async ({ ctx, input }) => {
      const { query, categoryId, limit, sortBy } = input;
      
      // Validate query is not just whitespace
      if (!query.trim()) {
        return { posts: [], total: 0 };
      }
      
      // PostgreSQL full-text search with ranking
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const posts = await (ctx.db as any).$queryRaw`
        SELECT 
          p.*,
          c.id as "categoryId", c.name as "categoryName",
          a.views, a."sourceClicks",
          ts_rank(
            to_tsvector('english', p.title || ' ' || p.prompt || ' ' || COALESCE(p."contentBlocks"::text, '')),
            plainto_tsquery('english', ${query})
          ) as rank
        FROM "Post" p
        LEFT JOIN "Category" c ON p."categoryId" = c.id
        LEFT JOIN "Analytics" a ON p.id = a."postId"
        WHERE 
          p.status = 'PUBLISHED' 
          AND p."isLatest" = true
          AND to_tsvector('english', p.title || ' ' || p.prompt || ' ' || COALESCE(p."contentBlocks"::text, ''))
              @@ plainto_tsquery('english', ${query})
          ${categoryId ? `AND p."categoryId" = ${categoryId}` : ''}
        ORDER BY 
          ${sortBy === 'relevance' ? 'rank DESC' : 
            sortBy === 'date' ? 'p."createdAt" DESC' :
            'COALESCE(a.views, 0) DESC'}
        LIMIT ${limit}
      `;

      // Get authors for each post
      const postIds = posts.map((p: any) => p.id);
      
      if (postIds.length === 0) return { posts: [], total: 0 };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const authors = await (ctx.db as any).postAuthor.findMany({
        where: { postId: { in: postIds } },
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
      });

      // Group authors by post
      const authorsByPost = authors.reduce((acc: any, author: any) => {
        if (!acc[author.postId]) acc[author.postId] = [];
        acc[author.postId].push(author);
        return acc;
      }, {});

      // Enrich posts with authors
      const enrichedPosts = posts.map((post: any) => ({
        ...post,
        category: post.categoryId ? { id: post.categoryId, name: post.categoryName } : null,
        analytics: { views: post.views || 0, sourceClicks: post.sourceClicks || 0 },
        authors: authorsByPost[post.id] || [],
        userVote: null, // Could be enhanced with user votes if needed
        isAuthor: false,
      }));

      return {
        posts: enrichedPosts,
        total: enrichedPosts.length,
      };
    }),

  // Search suggestions/autocomplete
  searchSuggestions: publicProcedure
    .input(z.object({
      query: z.string().min(1).max(50),
      limit: z.number().min(1).max(10).default(5),
    }))
    .query(async ({ ctx, input }) => {
      const { query, limit } = input;
      
      // Validate query is not just whitespace
      if (!query.trim()) {
        return [];
      }
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const suggestions = await (ctx.db as any).$queryRaw`
        SELECT DISTINCT
          p.title,
          ts_rank(
            to_tsvector('english', p.title),
            plainto_tsquery('english', ${query})
          ) as rank
        FROM "Post" p
        WHERE 
          p.status = 'PUBLISHED' 
          AND p."isLatest" = true
          AND to_tsvector('english', p.title) @@ plainto_tsquery('english', ${query})
        ORDER BY rank DESC
        LIMIT ${limit}
      `;

      return suggestions.map((s: any) => s.title);
    }),

  // Recent searches (could be stored in localStorage or user preferences)
  getPopularSearches: publicProcedure
    .query(() => {
      // For now, return some hardcoded popular searches
      // In production, you'd track search analytics
      return [
        "artificial intelligence",
        "climate change",
        "technology",
        "politics",
        "economics",
      ];
    }),
});
