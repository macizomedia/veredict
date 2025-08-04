import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { LabelType } from "@prisma/client";
import { AIAgentService } from "@/lib/ai-agent";
import { llmService } from "@/lib/enhanced-llm-service";

const createPostSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  tone: z.string(),
  style: z.string(),
  minRead: z.number().min(1).max(30),
  location: z.object({
    city: z.string(),
    state: z.string(),
    country: z.string(),
  }).optional(),
});

const researchSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  location: z.object({
    city: z.string(),
    state: z.string(),
    country: z.string(),
  }).optional(),
});

const generateContentSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  tone: z.string(),
  style: z.string(),
  minRead: z.number().min(1).max(30),
  sources: z.array(z.object({
    title: z.string(),
    url: z.string(),
    snippet: z.string(),
    credibility: z.nativeEnum(LabelType),
    source: z.string(),
  })),
  location: z.object({
    city: z.string(),
    state: z.string(),
    country: z.string(),
  }).optional(),
});

// Helper function to parse content into structured blocks
function parseContentIntoBlocks(content: string, sources: any[]) {
  const lines = content.split('\n').filter(line => line.trim());
  const blocks = [];
  let currentId = 1;

  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('#') || (trimmed.match(/^[A-Z][^.]*$/) && trimmed.length < 100)) {
      // Treat as heading
      blocks.push({
        id: `heading-${currentId++}`,
        type: 'heading' as const,
        content: trimmed.replace(/^#+\s*/, '')
      });
    } else if (trimmed.length > 50) {
      // Treat as paragraph
      blocks.push({
        id: `paragraph-${currentId++}`,
        type: 'paragraph' as const,
        content: trimmed,
        sources: sources.slice(0, 2).map((s: any) => s.source),
        credibilityScore: 0.85
      });
    }
  }

  // Ensure we have at least some content
  if (blocks.length === 0) {
    blocks.push({
      id: 'generated-content',
      type: 'paragraph' as const,
      content,
      sources: sources.map((s: any) => s.source),
      credibilityScore: 0.80
    });
  }

  return blocks;
}

// Fallback mock generation function
function generateMockContent(input: any) {
  const { topic, tone, style, minRead, sources, location } = input;
  
  // Generate title based on topic and location
  const locationPrefix = location?.city ? `${location.city}: ` : '';
  const title = `${locationPrefix}${topic} - A Comprehensive Analysis`;
  
  // Calculate target blocks based on reading time
  const targetWords = minRead * 200;
  
  const blocks = [
    {
      id: 'intro',
      type: 'paragraph' as const,
      content: `Recent developments surrounding ${topic} have garnered significant attention from both local communities and broader stakeholders. ${location?.city ? `In ${location.city}, ` : ''}the implications of these changes are becoming increasingly apparent as various sectors adapt to new realities. This comprehensive analysis examines the multifaceted aspects of ${topic}, drawing from credible sources and expert insights to provide a balanced perspective on this evolving situation.`,
      sources: sources.slice(0, 2).map((s: any) => s.source),
      credibilityScore: 0.85
    },
    {
      id: 'heading-1',
      type: 'heading' as const,
      content: 'Current State of Affairs'
    },
    {
      id: 'current-state',
      type: 'paragraph' as const,
      content: `The current landscape of ${topic} reflects a complex interplay of factors that have shaped its trajectory over recent months. According to official sources, key developments have included policy changes, community responses, and technological adaptations that collectively influence the broader narrative. ${style === 'analytical' ? 'Data analysis reveals' : 'Reports indicate'} that stakeholder engagement has been particularly robust, with various parties contributing to ongoing discussions about implementation and future directions.`,
      sources: sources.filter((s: any) => s.credibility === LabelType.OFFICIAL_PRESS_RELEASE || s.credibility === LabelType.ACCURATE).map((s: any) => s.source),
      credibilityScore: 0.90
    }
  ];

  return {
    title,
    blocks,
    metadata: {
      generatedBy: 'Mock Generator',
      tokensUsed: Math.floor(targetWords * 1.3),
      cost: 0.001,
      generationTime: 3000,
      confidence: 0.75,
      reviewRequired: true
    }
  };
}

export const contentRouter = createTRPCRouter({
  // Research sources for a topic
  research: publicProcedure
    .input(researchSchema)
    .mutation(async ({ input }) => {
      // Simulate research
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const { topic, location } = input;
      const locationText = location?.city ? ` in ${location.city}` : '';
      
      const mockSources = [
        {
          title: `Official Statement on ${topic}${locationText}`,
          url: `https://government.example.com/${topic.toLowerCase().replace(/\s+/g, '-')}`,
          snippet: `Official government statement regarding recent developments in ${topic}. Key stakeholders have been briefed on the current situation and appropriate measures are being taken.`,
          credibility: LabelType.OFFICIAL_PRESS_RELEASE,
          source: "Government Portal"
        },
        {
          title: `Expert Analysis: ${topic} Trends and Implications`,
          url: `https://research.example.com/analysis/${topic.toLowerCase().replace(/\s+/g, '-')}`,
          snippet: `Comprehensive analysis by leading experts examining the broader implications of ${topic} on various sectors and communities.`,
          credibility: LabelType.ACCURATE,
          source: "Research Institute"
        },
        {
          title: `Community Response to ${topic}${locationText}`,
          url: `https://news.example.com/${topic.toLowerCase().replace(/\s+/g, '-')}-community-response`,
          snippet: `Local community leaders and residents share their perspectives on how ${topic} affects daily life and future planning.`,
          credibility: LabelType.ACCURATE,
          source: "Local News Network"
        }
      ];

      return {
        sources: mockSources,
        count: mockSources.length
      };
    }),

  // Generate content using enhanced LLM service
  generateContent: publicProcedure
    .input(generateContentSchema)
    .mutation(async ({ input }) => {
      try {
        const { topic, tone, style, minRead, sources, location } = input;
        
        // Create a comprehensive prompt for the AI
        const locationContext = location?.city ? ` in ${location.city}, ${location.state}` : '';
        const sourcesContext = sources.length > 0 ? 
          `\n\nReference these sources:\n${sources.map(s => `- ${s.title}: ${s.snippet} (${s.source})`).join('\n')}` : '';
        
        const prompt = `Write a comprehensive ${minRead}-minute read article about "${topic}"${locationContext}. 
        
        Style: ${style}
        Tone: ${tone}
        Target length: ${minRead * 200} words
        
        Please structure the article with:
        1. An engaging introduction that sets the context
        2. Clear section headings
        3. Well-researched body paragraphs
        4. Data and insights where relevant
        5. A balanced perspective on the topic
        
        ${sourcesContext}
        
        Make it informative, engaging, and suitable for a news platform.`;

        // Use the enhanced LLM service
        const response = await AIAgentService.generateContentWithLLM({
          prompt,
          sources: sources.map(s => s.url),
          tone: tone as any,
          style: style as any,
          length: minRead > 10 ? 'long' : minRead > 5 ? 'medium' : 'short'
        });

        if (!response.value.draft) {
          throw new Error('No content generated');
        }

        // Parse the generated content into blocks
        const content = response.value.draft;
        const blocks = parseContentIntoBlocks(content, sources);
        
        // Generate title based on topic and location
        const locationPrefix = location?.city ? `${location.city}: ` : '';
        const title = `${locationPrefix}${topic} - A Comprehensive Analysis`;

        return {
          title,
          blocks,
          metadata: {
            generatedBy: response.value.modelUsed ? 
              `${response.value.modelUsed.provider}/${response.value.modelUsed.modelId}` : 
              'AI Assistant',
            tokensUsed: response.value.modelUsed?.tokensUsed || 0,
            cost: response.value.modelUsed?.cost || 0,
            generationTime: response.value.metadata?.generationTime || 0,
            confidence: response.value.metadata?.confidence || 0.8,
            reviewRequired: response.value.reviewRequired || false
          }
        };
      } catch (error) {
        console.error('Content generation failed:', error);
        
        // Fallback to mock generation
        return generateMockContent(input);
      }
    }),

  // Create a new post
  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1, "Title is required"),
      contentBlocks: z.array(z.object({
        id: z.string(),
        type: z.enum(['paragraph', 'heading']),
        content: z.string(),
        sources: z.array(z.string()).optional(),
        credibilityScore: z.number().min(0).max(1).optional(),
      })),
      categoryId: z.string().optional(),
      labels: z.array(z.nativeEnum(LabelType)).default([]),
      isPublished: z.boolean().default(false),
      metadata: z.object({
        generatedBy: z.string().optional(),
        tokensUsed: z.number().optional(),
        cost: z.number().optional(),
        generationTime: z.number().optional(),
        confidence: z.number().optional(),
        reviewRequired: z.boolean().optional(),
      }).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session?.user?.id) {
        throw new Error("User not authenticated");
      }

      // Mock post creation - in a real app, save to database
      const post = {
        id: Date.now().toString(),
        title: input.title,
        contentBlocks: input.contentBlocks,
        authorId: ctx.session.user.id,
        categoryId: input.categoryId,
        labels: input.labels,
        isPublished: input.isPublished,
        metadata: input.metadata,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('Created post:', {
        id: post.id,
        title: post.title,
        author: ctx.session.user.email,
        blocks: post.contentBlocks.length,
        metadata: post.metadata
      });

      return {
        success: true,
        postId: post.id,
        post
      };
    }),
});
