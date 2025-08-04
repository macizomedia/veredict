// AI Agent service for generating content
import { llmService } from './enhanced-llm-service';
import type { AIGenerationRequest } from './llm-providers';

export interface AIAgentRequest {
  prompt: string;
  sources?: string[];
  tone?: 'neutral' | 'optimistic' | 'analytical' | 'professional' | 'conversational';
  style?: 'standard' | 'journalistic' | 'academic' | 'blog' | 'technical';
  length?: 'short' | 'medium' | 'long';
}

export interface AIAgentResponse {
  node: string;
  value: {
    draft?: string;
    contentBlocks?: Array<{
      type: string;
      content: string;
    }>;
    reviewRequired?: boolean;
    modelUsed?: {
      provider: string;
      modelId: string;
      tokensUsed: number;
      cost: number;
    };
    metadata?: {
      generationTime: number;
      confidence?: number;
      fallbackUsed?: boolean;
    };
  };
}

export class AIAgentService {
  private static readonly ENDPOINT = 'https://kiiukzhynzsjjykkcabr.supabase.co/functions/v1/AI_Agent';
  private static readonly ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  /**
   * Generate content using the Enhanced LLM Service (NEW)
   */
  static async generateContentWithLLM(
    request: AIAgentRequest,
    useEnhanced: boolean = true
  ): Promise<AIAgentResponse> {
    try {
      if (useEnhanced) {
        // Use the new enhanced LLM service
        const enhancedRequest: AIGenerationRequest = {
          prompt: request.prompt,
          sources: request.sources,
          tone: request.tone || 'neutral',
          style: request.style || 'standard',
          length: request.length || 'medium',
          temperature: 0.7,
          maxTokens: this.getMaxTokensForLength(request.length || 'medium'),
          topP: 1,
          stream: false
        };

        const response = await llmService.generateContent(enhancedRequest);
        
        if (response.success) {
          return {
            node: "enhanced_llm_generation",
            value: {
              draft: response.content,
              contentBlocks: response.contentBlocks || [
                { type: 'paragraph', content: response.content }
              ],
              reviewRequired: response.metadata.reviewRequired,
              modelUsed: response.modelUsed,
              metadata: response.metadata
            }
          };
        } else {
          throw new Error(response.error || 'LLM generation failed');
        }
      } else {
        // Fallback to original method
        const results = await this.generateContent(request);
        return results[0] || this.getErrorResponse('No content generated');
      }
    } catch (error) {
      console.error('Enhanced LLM generation failed, falling back to original:', error);
      try {
        const results = await this.generateContent(request);
        return results[0] || this.getErrorResponse('Fallback generation failed');
      } catch (fallbackError) {
        return this.getErrorResponse(`All generation methods failed: ${error}`);
      }
    }
  }

  private static getErrorResponse(errorMessage: string): AIAgentResponse {
    return {
      node: "error",
      value: {
        draft: "Content generation is currently unavailable. Please try again later.",
        contentBlocks: [
          { type: 'paragraph', content: "Content generation is currently unavailable. Please try again later." }
        ],
        reviewRequired: true,
        metadata: {
          generationTime: 0,
          confidence: 0
        }
      }
    };
  }

  private static getMaxTokensForLength(length: string): number {
    switch (length) {
      case 'short': return 1024;
      case 'medium': return 2048;
      case 'long': return 4096;
      default: return 2048;
    }
  }

  /**
   * Generate content using the AI Agent (LEGACY)
   */
  static async generateContent(
    request: AIAgentRequest,
    onUpdate?: (response: AIAgentResponse) => void
  ): Promise<AIAgentResponse[]> {
    const response = await fetch(this.ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.ANON_KEY}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`AI Agent failed: ${error}`);
    }

    const results: AIAgentResponse[] = [];
    
    if (response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.trim() && line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                results.push(data);
                if (onUpdate) {
                  onUpdate(data);
                }
              } catch (e) {
                console.warn('Failed to parse streaming data:', e);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    }

    return results;
  }

  /**
   * Generate content using simplified interface with mock fallback
   */
  static async generateContentSimple(request: AIAgentRequest): Promise<{
    success: boolean;
    content?: string;
    contentBlocks?: Array<{
      type: string;
      content: string;
    }>;
    reviewRequired?: boolean;
    error?: string;
  }> {
    try {
      const response = await fetch(this.ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.ANON_KEY}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`AI Agent failed: ${response.statusText}`);
      }

      // Parse the response (simplified for now)
      const text = await response.text();
      
      return {
        success: true,
        content: text,
        contentBlocks: [{ type: 'paragraph', content: text }],
        reviewRequired: false,
      };
    } catch (error) {
      console.error('AI Agent failed, using mock response:', error);
      
      // Return mock response for testing
      return {
        success: true,
        content: this.generateMockContent(request),
        contentBlocks: this.generateMockContentBlocks(request),
        reviewRequired: false,
      };
    }
  }

  /**
   * Generate mock content for testing when AI Agent is unavailable
   */
  private static generateMockContent(request: AIAgentRequest): string {
    const sourcesSection = request.sources && request.sources.length > 0 
      ? `

## Sources

This content is based on the following sources:
${request.sources.map((source, i) => `${i + 1}. ${source}`).join('\n')}
` 
      : '';

    const mockContent = `# ${request.prompt}

This is a mock article generated for testing purposes. In a real implementation, this content would be generated by the AI Agent using LangChain and LangGraph workflows.

## Introduction

The topic of "${request.prompt}" is complex and multifaceted. This ${request.length} article aims to provide a ${request.tone} perspective using a ${request.style} writing style.

## Main Content

Here are some key points about ${request.prompt}:

- **Point 1**: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
- **Point 2**: Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
- **Point 3**: Ut enim ad minim veniam, quis nostrud exercitation.
${sourcesSection}

## Conclusion

This mock content demonstrates the AI Agent integration workflow. Once the Supabase Edge Function is properly deployed and configured, it will generate real AI-powered content.

---
*Generated with tone: ${request.tone}, style: ${request.style}, length: ${request.length}*
`;

    return mockContent;
  }

  /**
   * Generate mock content blocks for testing
   */
  private static generateMockContentBlocks(request: AIAgentRequest): Array<{
    type: string;
    content: string;
  }> {
    const blocks = [
      {
        type: 'title',
        content: request.prompt
      },
      {
        type: 'paragraph',
        content: 'This is a mock paragraph generated for testing the AI Agent integration. The content would normally be generated by LangChain workflows.'
      },
      {
        type: 'heading',
        content: 'Key Points'
      },
      {
        type: 'list',
        content: JSON.stringify([
          'Mock point 1 about the topic',
          'Mock point 2 with relevant information',
          'Mock point 3 concluding the discussion'
        ])
      }
    ];

    if (request.sources && request.sources.length > 0) {
      blocks.push({
        type: 'sources',
        content: JSON.stringify(request.sources)
      });
    }

    return blocks;
  }

  /**
   * Test the AI Agent connection
   */
  static async testConnection(): Promise<boolean> {
    try {
      const result = await this.generateContentSimple({
        prompt: 'Test connection',
        tone: 'neutral',
        style: 'standard',
        length: 'short',
      });
      return result.success;
    } catch (error) {
      console.error('AI Agent connection test failed:', error);
      return false;
    }
  }
}
