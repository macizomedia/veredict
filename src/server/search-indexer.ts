import { getRedisClient } from './redis';
import { db } from './db';

// Search indexing utility for Redis
export class SearchIndexer {
  private static redis: any = null;

  private static async getRedis() {
    if (!SearchIndexer.redis) {
      SearchIndexer.redis = await getRedisClient();
    }
    return SearchIndexer.redis;
  }

  /**
   * Index a single post for search
   */
  static async indexPost(postId: number) {
    try {
      const redis = await SearchIndexer.getRedis();
      
      // Get post with all related data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const post = await (db as any).post.findUnique({
        where: { id: postId },
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
        },
      });

      if (!post || post.status !== 'PUBLISHED' || !post.isLatest) {
        // If post is not published or not latest, remove from index
        await SearchIndexer.removePostFromIndex(postId);
        return;
      }

      // Create search document
      const searchDoc = {
        id: post.id,
        title: post.title,
        prompt: post.prompt,
        contentBlocks: post.contentBlocks,
        categoryId: post.categoryId,
        categoryName: post.category?.name || null,
        authorNames: post.authors.map((a: any) => a.user.name).join(' '),
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        views: post.analytics?.views || 0,
        commentCount: post._count.internalComments,
        upVotes: post.upVotes || 0,
        downVotes: post.downVotes || 0,
        minRead: post.minRead,
        tone: post.tone,
        style: post.style,
        // Create searchable text combining all searchable fields
        searchText: [
          post.title,
          post.prompt,
          post.category?.name,
          ...post.authors.map((a: any) => a.user.name),
          typeof post.contentBlocks === 'object' && post.contentBlocks?.blocks 
            ? post.contentBlocks.blocks.map((block: any) => block.content).join(' ')
            : ''
        ].filter(Boolean).join(' ').toLowerCase(),
      };

      // Store in Redis with multiple keys for different search patterns
      await Promise.all([
        // Main document
        redis.setEx(`post:${postId}`, 3600, JSON.stringify(searchDoc)), // 1 hour TTL
        
        // Add to sorted sets for different orderings
        redis.zAdd('posts:by_date', { score: new Date(post.createdAt).getTime(), value: postId.toString() }),
        redis.zAdd('posts:by_views', { score: searchDoc.views, value: postId.toString() }),
        redis.zAdd('posts:by_votes', { score: (searchDoc.upVotes - searchDoc.downVotes), value: postId.toString() }),
        
        // Add to category-specific indexes
        ...(post.categoryId ? [
          redis.sAdd(`category:${post.categoryId}:posts`, postId.toString()),
          redis.zAdd(`category:${post.categoryId}:by_date`, { score: new Date(post.createdAt).getTime(), value: postId.toString() }),
        ] : []),
        
        // Add to full-text search index using Redis Search if available, or use sets
        redis.sAdd('all_posts', postId.toString()),
        
        // Index searchable keywords
        ...SearchIndexer.extractKeywords(searchDoc.searchText).map(keyword => 
          redis.sAdd(`keyword:${keyword}`, postId.toString())
        ),
      ]);

      console.log(`✅ Indexed post ${postId} for search`);
    } catch (error) {
      console.error(`❌ Failed to index post ${postId}:`, error);
    }
  }

  /**
   * Remove a post from search index
   */
  static async removePostFromIndex(postId: number) {
    try {
      const redis = await SearchIndexer.getRedis();
      
      // Get existing document to clean up category associations
      const existingDoc = await redis.get(`post:${postId}`);
      let categoryId = null;
      
      if (existingDoc) {
        const doc = JSON.parse(existingDoc);
        categoryId = doc.categoryId;
      }

      await Promise.all([
        // Remove main document
        redis.del(`post:${postId}`),
        
        // Remove from sorted sets
        redis.zRem('posts:by_date', postId.toString()),
        redis.zRem('posts:by_views', postId.toString()),
        redis.zRem('posts:by_votes', postId.toString()),
        
        // Remove from category indexes
        ...(categoryId ? [
          redis.sRem(`category:${categoryId}:posts`, postId.toString()),
          redis.zRem(`category:${categoryId}:by_date`, postId.toString()),
        ] : []),
        
        // Remove from all posts
        redis.sRem('all_posts', postId.toString()),
      ]);

      console.log(`✅ Removed post ${postId} from search index`);
    } catch (error) {
      console.error(`❌ Failed to remove post ${postId} from index:`, error);
    }
  }

  /**
   * Full reindex of all posts
   */
  static async reindexAll() {
    try {
      console.log('🔄 Starting full reindex...');
      
      // Get all published posts
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const posts = await (db as any).post.findMany({
        where: {
          status: 'PUBLISHED',
          isLatest: true,
        },
        select: { id: true },
      });

      console.log(`📄 Found ${posts.length} posts to index`);

      // Clear existing indexes
      await SearchIndexer.clearAllIndexes();

      // Index each post
      for (const post of posts) {
        await SearchIndexer.indexPost(post.id);
      }

      console.log(`✅ Reindexed ${posts.length} posts`);
    } catch (error) {
      console.error('❌ Full reindex failed:', error);
    }
  }

  /**
   * Clear all search indexes
   */
  static async clearAllIndexes() {
    try {
      const redis = await SearchIndexer.getRedis();
      
      // Get all post IDs to clean up
      const postIds = await redis.sMembers('all_posts');
      
      if (postIds.length > 0) {
        const keys = [
          ...postIds.map((id: string) => `post:${id}`),
          'posts:by_date',
          'posts:by_views', 
          'posts:by_votes',
          'all_posts',
        ];
        
        // Get all category and keyword keys
        const allKeys = await redis.keys('category:*');
        const keywordKeys = await redis.keys('keyword:*');
        
        await redis.del([...keys, ...allKeys, ...keywordKeys]);
      }

      console.log('✅ Cleared all search indexes');
    } catch (error) {
      console.error('❌ Failed to clear indexes:', error);
    }
  }

  /**
   * Search posts using Redis indexes
   */
  static async searchPosts(
    query: string,
    options: {
      categoryId?: number;
      sortBy?: 'relevance' | 'date' | 'views' | 'votes';
      limit?: number;
      offset?: number;
    } = {}
  ) {
    try {
      const redis = await SearchIndexer.getRedis();
      const { categoryId, sortBy = 'relevance', limit = 20, offset = 0 } = options;

      let postIds: string[] = [];

      if (query.trim()) {
        // Keyword-based search
        const keywords = SearchIndexer.extractKeywords(query.toLowerCase());
        
        if (keywords.length > 0) {
          // Get intersection of all keyword sets
          const keywordSets = keywords.map(keyword => `keyword:${keyword}`);
          
          if (keywordSets.length === 1) {
            postIds = await redis.sMembers(keywordSets[0]);
          } else {
            // Use temporary key for intersection
            const tempKey = `temp:search:${Date.now()}`;
            await redis.sInterStore(tempKey, keywordSets);
            postIds = await redis.sMembers(tempKey);
            await redis.del(tempKey);
          }
        }
      } else {
        // No query, get all posts
        postIds = await redis.sMembers('all_posts');
      }

      // Filter by category if specified
      if (categoryId && postIds.length > 0) {
        const categoryPosts = await redis.sMembers(`category:${categoryId}:posts`);
        postIds = postIds.filter(id => categoryPosts.includes(id));
      }

      // Sort results
      if (postIds.length > 0) {
        let sortedPostIds: string[] = [];
        
        switch (sortBy) {
          case 'date':
            const dateScores = await Promise.all(
              postIds.map(async id => ({
                id,
                score: await redis.zScore('posts:by_date', id) || 0
              }))
            );
            sortedPostIds = dateScores
              .sort((a, b) => b.score - a.score)
              .map(item => item.id);
            break;
            
          case 'views':
            const viewScores = await Promise.all(
              postIds.map(async id => ({
                id,
                score: await redis.zScore('posts:by_views', id) || 0
              }))
            );
            sortedPostIds = viewScores
              .sort((a, b) => b.score - a.score)
              .map(item => item.id);
            break;
            
          case 'votes':
            const voteScores = await Promise.all(
              postIds.map(async id => ({
                id,
                score: await redis.zScore('posts:by_votes', id) || 0
              }))
            );
            sortedPostIds = voteScores
              .sort((a, b) => b.score - a.score)
              .map(item => item.id);
            break;
            
          default: // relevance
            // For relevance, we could implement TF-IDF scoring
            // For now, just use date as fallback
            sortedPostIds = postIds;
            break;
        }
        
        postIds = sortedPostIds;
      }

      // Apply pagination
      const paginatedIds = postIds.slice(offset, offset + limit);

      // Get full post documents
      const posts = [];
      if (paginatedIds.length > 0) {
        const docs = await redis.mGet(paginatedIds.map(id => `post:${id}`));
        
        for (const doc of docs) {
          if (doc) {
            posts.push(JSON.parse(doc));
          }
        }
      }

      return {
        posts,
        total: postIds.length,
        hasMore: offset + limit < postIds.length,
      };
    } catch (error) {
      console.error('❌ Redis search failed:', error);
      return { posts: [], total: 0, hasMore: false };
    }
  }

  /**
   * Extract keywords from text for indexing
   */
  private static extractKeywords(text: string): string[] {
    // Simple keyword extraction - in production you might use more sophisticated NLP
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2) // Filter out very short words
      .filter(word => !SearchIndexer.stopWords.has(word))
      .slice(0, 50); // Limit to prevent too many keys
  }

  private static stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'
  ]);
}

// Hook functions to be called from your tRPC mutations
export const searchHooks = {
  async onPostCreated(postId: number) {
    await SearchIndexer.indexPost(postId);
  },

  async onPostUpdated(postId: number) {
    await SearchIndexer.indexPost(postId);
  },

  async onPostDeleted(postId: number) {
    await SearchIndexer.removePostFromIndex(postId);
  },

  async onPostPublished(postId: number) {
    await SearchIndexer.indexPost(postId);
  },

  async onPostUnpublished(postId: number) {
    await SearchIndexer.removePostFromIndex(postId);
  },

  async onCommentCreated(postId: number) {
    // Reindex post to update comment count
    await SearchIndexer.indexPost(postId);
  },

  async onCommentDeleted(postId: number) {
    // Reindex post to update comment count
    await SearchIndexer.indexPost(postId);
  },
};
