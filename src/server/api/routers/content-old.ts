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

export const contentRouter = createTRPCRouter({
  // Research sources for a topic
  research: publicProcedure
    .input(researchSchema)
    .mutation(async ({ input }) => {
      // Simulate research API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const { topic, location } = input;
      
      const mockResults = [
        {
          title: `Local Impact of ${topic}`,
          url: `https://example-news.com/local-${topic.toLowerCase().replace(/\s+/g, '-')}`,
          snippet: `Recent developments regarding ${topic} have shown significant impact on local communities...`,
          credibility: LabelType.ACCURATE,
          source: 'Local News Network'
        },
        {
          title: `Official Statement on ${topic}`,
          url: `https://gov-official.com/statement-${topic.toLowerCase().replace(/\s+/g, '-')}`,
          snippet: `Government officials have released an official statement addressing ${topic}...`,
          credibility: LabelType.OFFICIAL_PRESS_RELEASE,
          source: 'Government Portal'
        },
        {
          title: `Analysis: ${topic} Trends`,
          url: `https://research-institute.org/analysis-${topic.toLowerCase().replace(/\s+/g, '-')}`,
          snippet: `Comprehensive analysis of current trends and implications of ${topic}...`,
          credibility: LabelType.ACCURATE,
          source: 'Research Institute'
        },
        {
          title: `Community Response to ${topic}`,
          url: `https://community-voice.com/response-${topic.toLowerCase().replace(/\s+/g, '-')}`,
          snippet: `Local community members share their perspectives on ${topic}...`,
          credibility: LabelType.NOT_CHECKED,
          source: 'Community Blog'
        }
      ];

      // Add location-specific results
      if (location?.city) {
        mockResults.push({
          title: `${location.city} Responds to ${topic}`,
          url: `https://${location.city.toLowerCase()}-news.com/${topic.toLowerCase().replace(/\s+/g, '-')}`,
          snippet: `Local ${location.city} officials and residents weigh in on ${topic}...`,
          credibility: LabelType.ACCURATE,
          source: `${location.city} News`
        });
      }

      return {
        sources: mockResults,
        count: mockResults.length
      };
    }),

  // Generate content based on research
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
        
        // Fallback to original mock generation
        return generateMockContent(input);
      }
    }),
      
      // Add more blocks based on target length
      if (targetBlocks > 3) {
        blocks.push(
          {
            id: 'heading-2',
            type: 'heading' as const,
            content: 'Community Impact and Response'
          },
          {
            id: 'community-impact',
            type: 'paragraph' as const,
            content: `The community response to ${topic} has been varied and nuanced, reflecting the diverse perspectives of local stakeholders. ${location?.city ? `${location.city} residents` : 'Community members'} have expressed both support and concern regarding various aspects of the initiative. Local leaders have emphasized the importance of transparent communication and inclusive decision-making processes to ensure that all voices are heard and considered in ongoing deliberations.`,
            sources: sources.filter(s => s.source.toLowerCase().includes('community')).map(s => s.source),
            credibilityScore: 0.75
          }
        );
      }
      
      if (targetBlocks > 5) {
        blocks.push(
          {
            id: 'expert-quote',
            type: 'paragraph' as const,
            content: `"The significance of ${topic} cannot be understated in terms of its potential long-term implications for our community and similar initiatives nationwide."`,
            sources: ['Expert Analysis Institute'],
            credibilityScore: 0.80
          },
          {
            id: 'future-outlook',
            type: 'paragraph' as const,
            content: `Looking ahead, the trajectory of ${topic} will likely depend on several key factors including continued stakeholder engagement, resource allocation, and adaptive management strategies. ${tone === 'formal' ? 'Preliminary assessments suggest' : 'Early indications show'} that success will require sustained collaboration between various parties and a commitment to evidence-based decision making. The coming months will be crucial in determining the ultimate impact and effectiveness of current approaches.`,
            sources: sources.slice(-2).map(s => s.source),
            credibilityScore: 0.70
          }
        );
      }
      
      // Calculate overall credibility score
      const credibilityScore = blocks
        .filter(b => b.credibilityScore)
        .reduce((sum, b) => sum + (b.credibilityScore || 0), 0) / blocks.filter(b => b.credibilityScore).length;
      
      return {
        title,
        blocks,
        metadata: {
          estimatedReadTime: minRead,
          sourceCount: sources.length,
          credibilityScore: Math.round(credibilityScore * 100) / 100
        }
      };
    }),

  // Create a new post with AI-generated content
  create: protectedProcedure
    .input(createPostSchema.extend({
      title: z.string().min(1, "Title is required"),
      contentBlocks: z.array(z.object({
        id: z.string(),
        type: z.enum(['paragraph', 'heading', 'quote', 'list']),
        content: z.string(),
        sources: z.array(z.string()).optional(),
        credibilityScore: z.number().optional(),
      })),
      sources: z.array(z.object({
        title: z.string(),
        url: z.string(),
        snippet: z.string(),
        credibility: z.nativeEnum(LabelType),
        source: z.string(),
      })).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { title, topic, tone, style, minRead, location, contentBlocks, sources } = input;
      
      // Create slug from title
      const slug = title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .substring(0, 100);
      
      // Ensure unique slug
      const existingPost = await ctx.db.post.findUnique({
        where: { slug }
      });
      
      const finalSlug = existingPost ? `${slug}-${Date.now()}` : slug;
      
      // Create post with revision
      const result = await ctx.db.post.create({
        data: {
          slug: finalSlug,
          status: 'DRAFT',
          revisions: {
            create: {
              title,
              contentBlocks: contentBlocks as any,
              prompt: topic,
              tone,
              style,
              minRead,
              location: location ? location as any : null,
              version: 1,
            }
          },
          authors: {
            create: {
              userId: ctx.session.user.id
            }
          },
          sources: sources ? {
            createMany: {
              data: sources.map(source => ({
                url: source.url
              }))
            }
          } : undefined,
          labels: sources ? {
            createMany: {
              data: sources.map(source => ({
                label: source.credibility,
                version: 1,
                justification: `Source: ${source.source}`,
                sourceUrl: source.url,
                count: 1,
              }))
            }
          } : undefined,
        },
      });
      
      // Get the created revision to set as current
      const revision = await ctx.db.revision.findFirst({
        where: { postId: result.id },
        orderBy: { createdAt: 'desc' }
      });
      
      // Update current revision reference
      const post = await ctx.db.post.update({
        where: { id: result.id },
        data: {
          currentRevisionId: revision?.id
        },
        include: {
          revisions: true,
          authors: {
            include: {
              user: true
            }
          },
          sources: true,
          labels: true,
        }
      });
      
      return post;
    }),
});
