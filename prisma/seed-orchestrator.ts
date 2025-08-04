import { PrismaClient } from '@prisma/client';
import { getRedisClient } from '../src/server/redis';

const prisma = new PrismaClient();

/**
 * Seed Theme Configuration
 * Defines different content themes that can be applied to the database
 */
export interface SeedTheme {
  name: string;
  description: string;
  categories: string[];
  authors: AuthorConfig[];
  posts: PostConfig[];
}

export interface AuthorConfig {
  id: string;
  name: string;
  email: string;
  role: 'AUTHOR' | 'EDITOR' | 'ADMIN';
  reputation: number;
  image: string;
}

export interface PostConfig {
  slug: string;
  title: string;
  prompt: string;
  content: ContentBlock[];
  tone: string;
  style: string;
  categoryIndex: number; // Index into categories array
  authorIndex: number;   // Index into authors array
  upVotes: number;
  downVotes: number;
  sources?: string[];
}

export interface ContentBlock {
  type: 'paragraph' | 'list' | 'quote' | 'citation';
  content: string;
}

/**
 * Seed Theme Definitions
 */
export const SEED_THEMES: Record<string, SeedTheme> = {
  politics: {
    name: 'Political Analysis',
    description: 'Western Hemisphere politics, international relations, and policy analysis',
    categories: [
      'US Politics',
      'Canadian Politics', 
      'Latin American Politics',
      'Western Hemisphere Security',
      'Americas Trade & Economics',
      'Migration & Border Policy',
      'Environmental Policy'
    ],
    authors: [
      {
        id: 'user_maria_rodriguez',
        name: 'Maria Rodriguez',
        email: 'maria@politicalanalysis.com',
        role: 'AUTHOR',
        reputation: 78,
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'
      },
      {
        id: 'user_james_wilson',
        name: 'James Wilson',
        email: 'james@hemispherewatch.com',
        role: 'EDITOR',
        reputation: 85,
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
      }
    ],
    posts: [
      {
        slug: 'usmca-trade-impact-2025',
        title: 'USMCA Trade Agreement: 2025 Impact Assessment',
        prompt: 'Analyze the economic impact of USMCA after five years of implementation',
        content: [
          {
            type: 'paragraph',
            content: 'Five years after implementation, the USMCA has fundamentally reshaped North American trade relationships, with significant implications for manufacturing, agriculture, and digital commerce across the three member nations.'
          }
        ],
        tone: 'ANALYTICAL',
        style: 'ACADEMIC',
        categoryIndex: 4, // Americas Trade & Economics
        authorIndex: 0,
        upVotes: 156,
        downVotes: 12,
        sources: ['https://ustr.gov/trade-agreements/free-trade-agreements/united-states-mexico-canada-agreement']
      }
    ]
  },

  tech: {
    name: 'Technology & Markets',
    description: 'AI, cryptocurrency, stock analysis, and tech industry insights',
    categories: [
      'Artificial Intelligence',
      'Cryptocurrency', 
      'Stock Market Analysis',
      'Tech IPOs',
      'Venture Capital',
      'Cybersecurity',
      'Cloud Computing'
    ],
    authors: [
      {
        id: 'user_alex_chen',
        name: 'Alex Chen',
        email: 'alex.chen@techanalyst.com',
        role: 'AUTHOR',
        reputation: 92,
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
      },
      {
        id: 'user_sarah_kim',
        name: 'Sarah Kim',
        email: 'sarah.kim@venture.com',
        role: 'EDITOR',
        reputation: 88,
        image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150'
      }
    ],
    posts: [
      {
        slug: 'nvidia-q3-ai-dominance',
        title: 'NVIDIA Q3 Earnings: AI Chip Dominance Continues',
        prompt: 'Analyze NVIDIA\'s latest quarterly earnings and their position in the AI chip market',
        content: [
          {
            type: 'paragraph',
            content: 'NVIDIA reported exceptional Q3 results, with data center revenue reaching $47.5 billion, driven primarily by AI chip demand from major cloud providers and enterprises accelerating their AI infrastructure deployments.'
          }
        ],
        tone: 'ANALYTICAL',
        style: 'TECHNICAL',
        categoryIndex: 0, // Artificial Intelligence
        authorIndex: 0,
        upVotes: 234,
        downVotes: 18,
        sources: ['https://investor.nvidia.com/financial-info/quarterly-results']
      }
    ]
  }
};

/**
 * Database Reset and Clean Utilities
 */
export class SeedOrchestrator {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Complete database reset - clears all data in correct dependency order
   */
  async resetDatabase(): Promise<void> {
    console.log('🧹 Performing complete database reset...');
    
    // Clear in dependency order to avoid foreign key constraints
    await this.prisma.analytics.deleteMany({});
    await this.prisma.postLabel.deleteMany({});
    await this.prisma.source.deleteMany({});
    await this.prisma.postAuthor.deleteMany({});
    await this.prisma.vote.deleteMany({});
    await this.prisma.comment.deleteMany({});
    await this.prisma.revision.deleteMany({});
    await this.prisma.post.deleteMany({});
    await this.prisma.category.deleteMany({});
    await this.prisma.user.deleteMany({});
    
    console.log('✅ Database reset completed');
  }

  /**
   * Clear Redis cache
   */
  async clearCache(): Promise<void> {
    try {
      console.log('🧹 Clearing Redis cache...');
      const redis = await getRedisClient();
      await redis.flushDb();
      console.log('✅ Redis cache cleared');
    } catch (error) {
      console.warn('⚠️ Redis cache clear failed (Redis may not be available):', error);
    }
  }

  /**
   * Apply a specific seed theme to the database
   */
  async applySeedTheme(themeName: string): Promise<void> {
    const theme = SEED_THEMES[themeName];
    if (!theme) {
      throw new Error(`Theme '${themeName}' not found. Available themes: ${Object.keys(SEED_THEMES).join(', ')}`);
    }

    console.log(`🌱 Applying seed theme: ${theme.name}`);
    console.log(`   Description: ${theme.description}`);

    // Create categories
    const categories = await Promise.all(
      theme.categories.map(name => 
        this.prisma.category.create({ data: { name } })
      )
    );
    console.log(`✅ Created ${categories.length} categories`);

    // Create authors
    const authors = await Promise.all(
      theme.authors.map(author => 
        this.prisma.user.create({ data: author })
      )
    );
    console.log(`✅ Created ${authors.length} authors`);

    // Create posts with revisions
    for (const postConfig of theme.posts) {
      const category = categories[postConfig.categoryIndex];
      const author = authors[postConfig.authorIndex];
      
      if (!category) {
        throw new Error(`Category at index ${postConfig.categoryIndex} not found`);
      }
      if (!author) {
        throw new Error(`Author at index ${postConfig.authorIndex} not found`);
      }

      const post = await this.prisma.post.create({
        data: {
          slug: postConfig.slug,
          status: 'PUBLISHED',
          categoryId: category.id,
          upVotes: postConfig.upVotes,
          downVotes: postConfig.downVotes,
        },
      });

      const revision = await this.prisma.revision.create({
        data: {
          title: postConfig.title,
          prompt: postConfig.prompt,
          contentBlocks: { blocks: postConfig.content } as any, // JSON type handling
          tone: postConfig.tone,
          style: postConfig.style,
          minRead: Math.ceil(postConfig.content.length * 2), // Estimate reading time
          postId: post.id,
          version: 1,
        },
      });

      // Link current revision
      await this.prisma.post.update({
        where: { id: post.id },
        data: { currentRevisionId: revision.id },
      });

      // Add author
      await this.prisma.postAuthor.create({
        data: {
          postId: post.id,
          userId: author.id,
        },
      });

      // Add sources if provided
      if (postConfig.sources) {
        await this.prisma.source.createMany({
          data: postConfig.sources.map(url => ({
            postId: post.id,
            url,
          })),
        });
      }

      // Add analytics
      await this.prisma.analytics.create({
        data: {
          postId: post.id,
          views: Math.floor(Math.random() * 1000) + 100,
          sourceClicks: Math.floor(Math.random() * 50) + 5,
        },
      });
    }

    console.log(`✅ Created ${theme.posts.length} posts with revisions`);
  }

  /**
   * Full reset and reseed workflow
   */
  async resetAndReseed(themeName: string): Promise<void> {
    console.log('🔄 Starting complete reset and reseed workflow...');
    
    await this.resetDatabase();
    await this.clearCache();
    await this.applySeedTheme(themeName);
    
    // Print summary
    const summary = await this.getDatabaseSummary();
    console.log('\n📊 Database Summary:');
    Object.entries(summary).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`);
    });
    
    console.log(`\n🎉 Reset and reseed completed successfully with theme: ${themeName}!`);
  }

  /**
   * Get database statistics
   */
  async getDatabaseSummary(): Promise<Record<string, number>> {
    return {
      posts: await this.prisma.post.count(),
      revisions: await this.prisma.revision.count(),
      categories: await this.prisma.category.count(),
      users: await this.prisma.user.count(),
      comments: await this.prisma.comment.count(),
      votes: await this.prisma.vote.count(),
    };
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

/**
 * CLI execution when run directly
 */
async function main() {
  const orchestrator = new SeedOrchestrator();
  
  try {
    const theme = process.argv[2] || 'politics';
    const availableThemes = Object.keys(SEED_THEMES);
    
    if (!availableThemes.includes(theme)) {
      console.error(`❌ Invalid theme: ${theme}`);
      console.log(`Available themes: ${availableThemes.join(', ')}`);
      process.exit(1);
    }
    
    await orchestrator.resetAndReseed(theme);
  } catch (error) {
    console.error('💥 Seed orchestration failed:', error);
    process.exit(1);
  } finally {
    await orchestrator.disconnect();
  }
}

// Run if called directly (ES module check)
if (import.meta.url === new URL(process.argv[1] || '', 'file://').href) {
  main();
}
