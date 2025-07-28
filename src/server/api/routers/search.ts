import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { SearchCache } from "@/server/redis";

export const searchRouter = createTRPCRouter({
  // Full-text search across posts with Redis caching
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

      // Generate cache key
      const cacheKey = SearchCache.generateSearchKey(query.trim(), categoryId, sortBy);
      
      // Try to get from cache first
      const cachedResult = await SearchCache.get(cacheKey);
      if (cachedResult) {
        console.log('🎯 Cache HIT for search:', query.trim());
        return cachedResult;
      }

      console.log('💾 Cache MISS for search:', query.trim(), '- fetching from DB');
      
      // Build the WHERE clause conditionally
      let whereClause = `
        WHERE 
          p.status = 'PUBLISHED' 
          AND p."isLatest" = true
          AND to_tsvector('english', p.title || ' ' || p.prompt || ' ' || COALESCE(p."contentBlocks"::text, ''))
              @@ plainto_tsquery('english', $1)
      `;
      
      // Build the ORDER BY clause conditionally
      let orderByClause = '';
      if (sortBy === 'relevance') {
        orderByClause = 'ORDER BY rank DESC';
      } else if (sortBy === 'date') {
        orderByClause = 'ORDER BY p."createdAt" DESC';
      } else {
        orderByClause = 'ORDER BY COALESCE(a.views, 0) DESC';
      }

      // PostgreSQL full-text search with ranking
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let posts: any[];
      
      if (categoryId) {
        whereClause += ' AND p."categoryId" = $2';
        posts = await (ctx.db as any).$queryRaw`
          SELECT 
            p.*,
            c.id as "categoryId", c.name as "categoryName",
            a.views, a."sourceClicks",
            COALESCE(comment_counts.count, 0) as "commentCount",
            ts_rank(
              to_tsvector('english', p.title || ' ' || p.prompt || ' ' || COALESCE(p."contentBlocks"::text, '')),
              plainto_tsquery('english', ${query.trim()})
            ) as rank
          FROM "Post" p
          LEFT JOIN "Category" c ON p."categoryId" = c.id
          LEFT JOIN "Analytics" a ON p.id = a."postId"
          LEFT JOIN (
            SELECT "postId", COUNT(*) as count 
            FROM "Comment" 
            GROUP BY "postId"
          ) comment_counts ON p.id = comment_counts."postId"
          WHERE 
            p.status = 'PUBLISHED' 
            AND p."isLatest" = true
            AND to_tsvector('english', p.title || ' ' || p.prompt || ' ' || COALESCE(p."contentBlocks"::text, ''))
                @@ plainto_tsquery('english', ${query.trim()})
            AND p."categoryId" = ${categoryId}
          ORDER BY 
            ${sortBy === 'relevance' ? 'rank DESC' : 
              sortBy === 'date' ? 'p."createdAt" DESC' :
              'COALESCE(a.views, 0) DESC'}
          LIMIT ${limit}
        `;
      } else {
        posts = await (ctx.db as any).$queryRaw`
          SELECT 
            p.*,
            c.id as "categoryId", c.name as "categoryName",
            a.views, a."sourceClicks",
            COALESCE(comment_counts.count, 0) as "commentCount",
            ts_rank(
              to_tsvector('english', p.title || ' ' || p.prompt || ' ' || COALESCE(p."contentBlocks"::text, '')),
              plainto_tsquery('english', ${query.trim()})
            ) as rank
          FROM "Post" p
          LEFT JOIN "Category" c ON p."categoryId" = c.id
          LEFT JOIN "Analytics" a ON p.id = a."postId"
          LEFT JOIN (
            SELECT "postId", COUNT(*) as count 
            FROM "Comment" 
            GROUP BY "postId"
          ) comment_counts ON p.id = comment_counts."postId"
          WHERE 
            p.status = 'PUBLISHED' 
            AND p."isLatest" = true
            AND to_tsvector('english', p.title || ' ' || p.prompt || ' ' || COALESCE(p."contentBlocks"::text, ''))
                @@ plainto_tsquery('english', ${query.trim()})
          ORDER BY 
            ${sortBy === 'relevance' ? 'rank DESC' : 
              sortBy === 'date' ? 'p."createdAt" DESC' :
              'COALESCE(a.views, 0) DESC'}
          LIMIT ${limit}
        `;
      }

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

      const result = {
        posts: enrichedPosts,
        total: enrichedPosts.length,
      };

      // Cache the result for 5 minutes
      await SearchCache.set(cacheKey, result, 300);

      return result;
    }),

  // Search suggestions/autocomplete with Redis caching
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

      // Generate cache key for suggestions
      const cacheKey = `suggestions:${query.trim()}:${limit}`;
      
      // Try to get from cache first
      const cachedSuggestions = await SearchCache.get(cacheKey);
      if (cachedSuggestions) {
        console.log('🎯 Cache HIT for suggestions:', query.trim());
        return cachedSuggestions;
      }

      console.log('💾 Cache MISS for suggestions:', query.trim(), '- fetching from DB');
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const suggestions = await (ctx.db as any).$queryRaw`
        SELECT DISTINCT
          p.title,
          ts_rank(
            to_tsvector('english', p.title),
            plainto_tsquery('english', ${query.trim()})
          ) as rank
        FROM "Post" p
        WHERE 
          p.status = 'PUBLISHED' 
          AND p."isLatest" = true
          AND to_tsvector('english', p.title) @@ plainto_tsquery('english', ${query.trim()})
        ORDER BY rank DESC
        LIMIT ${limit}
      `;

      const result = suggestions.map((s: any) => s.title);
      
      // Cache suggestions for 10 minutes
      await SearchCache.set(cacheKey, result, 600);
      
      return result;
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
