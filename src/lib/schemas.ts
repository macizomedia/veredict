import { z } from 'zod';

/**
 * Enhanced Zod Schemas for Type-Safe API Validation
 * These schemas align perfectly with Prisma types for seamless type propagation
 */

// Enums - match Prisma schema exactly
export const PostStatusSchema = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'DISPUTED']);
export const LabelTypeSchema = z.enum(['FAKE', 'NOT_CHECKED', 'IN_DEVELOPMENT', 'OFFICIAL_PRESS_RELEASE', 'ACCURATE', 'INACCURATE']);
export const RoleSchema = z.enum(['AUTHOR', 'EDITOR', 'ADMIN']);
export const VoteTypeSchema = z.enum(['UPVOTE', 'DOWNVOTE']);

// Content block schema for structured content
export const ContentBlockSchema = z.object({
  type: z.enum(['paragraph', 'list', 'quote', 'citation', 'image', 'video']),
  content: z.string(),
  metadata: z.record(z.any()).optional(),
});

export const ContentBlocksSchema = z.object({
  blocks: z.array(ContentBlockSchema),
});

// Core entity schemas
export const CategorySchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const CategoryCreateSchema = z.object({
  name: z.string().min(1, 'Category name is required').max(50, 'Category name too long'),
});

export const UserSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  email: z.string().email().nullable(),
  emailVerified: z.date().nullable(),
  image: z.string().nullable(),
  role: RoleSchema,
  reputation: z.number(),
});

export const UserPublicSchema = UserSchema.omit({ 
  email: true, 
  emailVerified: true 
});

export const AnalyticsSchema = z.object({
  id: z.number(),
  postId: z.number(),
  views: z.number(),
  sourceClicks: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const SourceSchema = z.object({
  id: z.number(),
  url: z.string().url(),
  postId: z.number(),
});

export const PostLabelSchema = z.object({
  id: z.number(),
  postId: z.number(),
  label: LabelTypeSchema,
  version: z.number(),
  justification: z.string(),
  sourceUrl: z.string().url().nullable(),
  count: z.number(),
});

export const CommentSchema = z.object({
  id: z.number(),
  content: z.string(),
  postId: z.number(),
  authorId: z.string(),
  createdAt: z.date(),
});

export const VoteSchema = z.object({
  id: z.number(),
  postId: z.number(),
  userId: z.string(),
  voteType: VoteTypeSchema,
  createdAt: z.date(),
});

export const RevisionSchema = z.object({
  id: z.number(),
  title: z.string(),
  contentBlocks: ContentBlocksSchema.nullable(),
  prompt: z.string(),
  tone: z.string(),
  style: z.string(),
  minRead: z.number(),
  location: z.record(z.any()).nullable(),
  summaryOfChanges: z.string().nullable(),
  version: z.number(),
  postId: z.number(),
  parentId: z.number().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const PostSchema = z.object({
  id: z.number(),
  slug: z.string(),
  status: PostStatusSchema,
  categoryId: z.number().nullable(),
  currentRevisionId: z.number().nullable(),
  upVotes: z.number(),
  downVotes: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Enhanced schemas with relationships
export const PostWithRelationsSchema = PostSchema.extend({
  category: CategorySchema.nullable(),
  currentRevision: RevisionSchema.nullable(),
  authors: z.array(z.object({
    user: UserPublicSchema,
  })),
  analytics: AnalyticsSchema.nullable(),
  sources: z.array(SourceSchema),
  labels: z.array(PostLabelSchema),
  _count: z.object({
    internalComments: z.number(),
    votes: z.number(),
  }).optional(),
});

export const CategoryWithCountSchema = CategorySchema.extend({
  postCount: z.number(),
  _count: z.object({
    posts: z.number(),
  }).optional(),
});

// Input schemas for mutations
export const CreatePostInputSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  prompt: z.string().min(10, 'Prompt must be at least 10 characters'),
  contentBlocks: ContentBlocksSchema.optional(),
  tone: z.string().default('NEUTRAL'),
  style: z.string().default('STANDARD'),
  categoryId: z.number().positive('Category is required'),
  minRead: z.number().min(1, 'Minimum read time is 1 minute').default(5),
  sources: z.array(z.string().url()).optional(),
  status: PostStatusSchema.default('DRAFT'),
});

export const UpdatePostInputSchema = z.object({
  id: z.number().positive(),
  title: z.string().min(1).max(200).optional(),
  prompt: z.string().min(10).optional(),
  contentBlocks: ContentBlocksSchema.optional(),
  tone: z.string().optional(),
  style: z.string().optional(),
  categoryId: z.number().positive().optional(),
  minRead: z.number().min(1).optional(),
  status: PostStatusSchema.optional(),
  summaryOfChanges: z.string().optional(),
});

export const SearchInputSchema = z.object({
  query: z.string().optional(),
  categoryId: z.number().positive().optional(),
  sortBy: z.enum(['relevance', 'date', 'views', 'votes']).default('relevance'),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

export const VoteInputSchema = z.object({
  postId: z.number().positive(),
  voteType: VoteTypeSchema,
});

export const CommentInputSchema = z.object({
  postId: z.number().positive(),
  content: z.string().min(1, 'Comment cannot be empty').max(1000, 'Comment too long'),
});

export const UserSearchInputSchema = z.object({
  query: z.string().min(1),
  limit: z.number().min(1).max(50).default(10),
  excludeIds: z.array(z.string()).optional(),
});

export const PaginationInputSchema = z.object({
  limit: z.number().min(1).max(100).default(20),
  cursor: z.number().positive().optional(),
});

// AI-related schemas
export const AIAgentRequestSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  sources: z.array(z.string().url()).optional(),
  tone: z.enum(['neutral', 'optimistic', 'analytical', 'professional', 'conversational']).default('neutral'),
  style: z.enum(['standard', 'journalistic', 'academic', 'blog', 'technical']).default('standard'),
  length: z.enum(['short', 'medium', 'long']).default('medium'),
});

export const AIAgentResponseSchema = z.object({
  success: z.boolean(),
  content: z.string().optional(),
  contentBlocks: z.array(ContentBlockSchema).optional(),
  reviewRequired: z.boolean().optional(),
  error: z.string().optional(),
});

// Analytics and reporting schemas
export const AnalyticsReportSchema = z.object({
  totalPosts: z.number(),
  totalViews: z.number(),
  totalSourceClicks: z.number(),
  averageReadTime: z.number(),
  topCategories: z.array(z.object({
    category: CategorySchema,
    postCount: z.number(),
    totalViews: z.number(),
  })),
  topAuthors: z.array(z.object({
    author: UserPublicSchema,
    postCount: z.number(),
    totalViews: z.number(),
  })),
});

// Cache invalidation schemas
export const CacheInvalidationSchema = z.object({
  type: z.enum(['post', 'category', 'user', 'search', 'all']),
  id: z.number().optional(),
  reason: z.string().optional(),
});

// Error response schema
export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  code: z.string().optional(),
  details: z.record(z.any()).optional(),
});

// Success response schema
export const SuccessResponseSchema = z.object({
  success: z.literal(true),
  data: z.any().optional(),
  message: z.string().optional(),
});

// Type exports for use throughout the application
export type PostStatus = z.infer<typeof PostStatusSchema>;
export type LabelType = z.infer<typeof LabelTypeSchema>;
export type Role = z.infer<typeof RoleSchema>;
export type VoteType = z.infer<typeof VoteTypeSchema>;
export type ContentBlock = z.infer<typeof ContentBlockSchema>;
export type ContentBlocks = z.infer<typeof ContentBlocksSchema>;
export type Category = z.infer<typeof CategorySchema>;
export type CategoryWithCount = z.infer<typeof CategoryWithCountSchema>;
export type User = z.infer<typeof UserSchema>;
export type UserPublic = z.infer<typeof UserPublicSchema>;
export type Post = z.infer<typeof PostSchema>;
export type PostWithRelations = z.infer<typeof PostWithRelationsSchema>;
export type Revision = z.infer<typeof RevisionSchema>;
export type Analytics = z.infer<typeof AnalyticsSchema>;
export type Source = z.infer<typeof SourceSchema>;
export type Comment = z.infer<typeof CommentSchema>;
export type Vote = z.infer<typeof VoteSchema>;
export type CreatePostInput = z.infer<typeof CreatePostInputSchema>;
export type UpdatePostInput = z.infer<typeof UpdatePostInputSchema>;
export type SearchInput = z.infer<typeof SearchInputSchema>;
export type VoteInput = z.infer<typeof VoteInputSchema>;
export type CommentInput = z.infer<typeof CommentInputSchema>;
export type UserSearchInput = z.infer<typeof UserSearchInputSchema>;
export type PaginationInput = z.infer<typeof PaginationInputSchema>;
export type AIAgentRequest = z.infer<typeof AIAgentRequestSchema>;
export type AIAgentResponse = z.infer<typeof AIAgentResponseSchema>;
export type AnalyticsReport = z.infer<typeof AnalyticsReportSchema>;
export type CacheInvalidation = z.infer<typeof CacheInvalidationSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type SuccessResponse = z.infer<typeof SuccessResponseSchema>;

/**
 * Validation utilities
 */
export const validatePostSlug = (slug: string): boolean => {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug) && slug.length >= 3 && slug.length <= 100;
};

export const validateEmail = (email: string): boolean => {
  return z.string().email().safeParse(email).success;
};

export const validateUrl = (url: string): boolean => {
  return z.string().url().safeParse(url).success;
};

/**
 * Schema transformation utilities
 */
export const transformPrismaPost = (prismaPost: any): PostWithRelations => {
  return PostWithRelationsSchema.parse({
    ...prismaPost,
    createdAt: new Date(prismaPost.createdAt),
    updatedAt: new Date(prismaPost.updatedAt),
    currentRevision: prismaPost.currentRevision ? {
      ...prismaPost.currentRevision,
      createdAt: new Date(prismaPost.currentRevision.createdAt),
      updatedAt: new Date(prismaPost.currentRevision.updatedAt),
    } : null,
    analytics: prismaPost.analytics ? {
      ...prismaPost.analytics,
      createdAt: new Date(prismaPost.analytics.createdAt),
      updatedAt: new Date(prismaPost.analytics.updatedAt),
    } : null,
  });
};

export const transformPrismaUser = (prismaUser: any): UserPublic => {
  return UserPublicSchema.parse(prismaUser);
};

export const transformPrismaCategory = (prismaCategory: any): Category => {
  return CategorySchema.parse(prismaCategory);
};
