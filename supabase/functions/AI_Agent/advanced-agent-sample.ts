import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// Advanced AI Agent with LangChain - SAMPLE IMPLEMENTATION
// This demonstrates how to create a more sophisticated agent with:
// - Web search capabilities
// - Image search and analysis
// - News source verification
// - Multi-step reasoning
// - Tool usage and decision making

// Import LangChain components (using more stable CDN versions)
import { ChatOpenAI } from 'https://esm.sh/@langchain/openai@0.2.0';
import { ChatGoogleGenerativeAI } from 'https://esm.sh/@langchain/google-genai@0.0.24';
import { AgentExecutor, createReactAgent } from 'https://esm.sh/langchain@0.2.0/agents';
import { DynamicTool } from 'https://esm.sh/@langchain/core@0.2.0/tools';
import { PromptTemplate } from 'https://esm.sh/@langchain/core@0.2.0/prompts';
import { StringOutputParser } from 'https://esm.sh/@langchain/core@0.2.0/output_parsers';

// Environment variables
const getEnvVar = (key: string): string => {
  const value = Deno.env.get(key);
  if (!value) throw new Error(`${key} environment variable is required`);
  return value;
};

// Agent State Interface
interface AgentState {
  prompt: string;
  sources: string[];
  tone: string;
  style: string;
  length: string;
  
  // Enhanced agent state
  searchResults: SearchResult[];
  verifiedSources: VerifiedSource[];
  relatedImages: ImageResult[];
  factChecks: FactCheck[];
  draft: string;
  contentBlocks: ContentBlock[];
  reviewRequired: boolean;
  confidence: number;
  citations: Citation[];
}

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  relevanceScore: number;
  publishDate?: string;
  source: string;
}

interface VerifiedSource {
  url: string;
  trustScore: number;
  bias: 'left' | 'center' | 'right' | 'unknown';
  factualRating: number;
  lastUpdated: string;
}

interface ImageResult {
  url: string;
  title: string;
  description: string;
  source: string;
  license: string;
  relevanceScore: number;
}

interface FactCheck {
  claim: string;
  verdict: 'true' | 'false' | 'partly-true' | 'unverifiable';
  sources: string[];
  confidence: number;
}

interface ContentBlock {
  type: 'heading' | 'paragraph' | 'quote' | 'list' | 'image' | 'fact-check';
  content: string;
  metadata?: any;
  citations?: string[];
}

interface Citation {
  id: string;
  url: string;
  title: string;
  author?: string;
  publishDate?: string;
  accessDate: string;
}

serve(async (req) => {
  try {
    // CORS and method handling
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        },
      });
    }

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const requestData = await req.json();
    const { prompt, sources = [], tone = 'neutral', style = 'journalistic', length = 'medium' } = requestData;

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Initialize the enhanced AI agent
    const agent = await createEnhancedAgent();
    
    // Set up streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        try {
          // Initial agent state
          let agentState: AgentState = {
            prompt,
            sources,
            tone,
            style,
            length,
            searchResults: [],
            verifiedSources: [],
            relatedImages: [],
            factChecks: [],
            draft: '',
            contentBlocks: [],
            reviewRequired: false,
            confidence: 0,
            citations: []
          };

          // Multi-step agent workflow
          const workflow = [
            { name: 'research_planning', fn: planResearch },
            { name: 'web_search', fn: performWebSearch },
            { name: 'source_verification', fn: verifySourceCredibility },
            { name: 'image_search', fn: searchRelatedImages },
            { name: 'fact_checking', fn: performFactChecking },
            { name: 'content_synthesis', fn: synthesizeContent },
            { name: 'content_formatting', fn: formatContentWithCitations },
            { name: 'quality_review', fn: performQualityReview }
          ];

          // Execute workflow steps
          for (const step of workflow) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              node: step.name,
              status: 'starting',
              message: `Executing ${step.name}...`
            })}\n\n`));

            agentState = await step.fn(agentState, agent);

            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              node: step.name,
              value: agentState,
              timestamp: new Date().toISOString()
            })}\n\n`));
          }

          controller.close();
        } catch (error) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            error: 'Agent execution failed',
            details: error instanceof Error ? error.message : 'Unknown error'
          })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
});

// Create enhanced agent with tools
async function createEnhancedAgent() {
  // Initialize LLM (can switch between OpenAI and Google based on preference)
  const llm = new ChatGoogleGenerativeAI({
    model: 'gemini-1.5-pro-latest',
    apiKey: getEnvVar('GOOGLE_API_KEY'),
    temperature: 0.3,
  });

  // Define agent tools
  const tools = [
    new DynamicTool({
      name: 'web_search',
      description: 'Search the web for current information about a topic',
      func: async (query: string) => {
        return await webSearchTool(query);
      },
    }),

    new DynamicTool({
      name: 'news_search',
      description: 'Search for recent news articles about a topic',
      func: async (query: string) => {
        return await newsSearchTool(query);
      },
    }),

    new DynamicTool({
      name: 'image_search',
      description: 'Find relevant images for a topic',
      func: async (query: string) => {
        return await imageSearchTool(query);
      },
    }),

    new DynamicTool({
      name: 'fact_checker',
      description: 'Verify claims and check facts against reliable sources',
      func: async (claim: string) => {
        return await factCheckTool(claim);
      },
    }),

    new DynamicTool({
      name: 'source_analyzer',
      description: 'Analyze the credibility and bias of a news source',
      func: async (url: string) => {
        return await sourceAnalysisTool(url);
      },
    }),

    new DynamicTool({
      name: 'content_analyzer',
      description: 'Analyze existing content for quality, bias, and factual accuracy',
      func: async (content: string) => {
        return await contentAnalysisTool(content);
      },
    })
  ];

  // Create agent with custom prompt
  const agentPrompt = PromptTemplate.fromTemplate(`
    You are an advanced AI content creation agent with access to various tools.
    Your goal is to create high-quality, factual, and well-sourced content.

    Available tools: {tools}
    Tool names: {tool_names}

    When creating content, follow these principles:
    1. Always verify information from multiple reliable sources
    2. Include proper citations and references
    3. Check for bias and present balanced perspectives
    4. Use relevant images when appropriate
    5. Fact-check important claims
    6. Maintain the requested tone and style
    7. Structure content logically with clear headings

    Current task: {input}

    Thought: I need to approach this systematically by first researching the topic, 
    then verifying sources, and finally creating well-structured content.

    {agent_scratchpad}
  `);

  const agent = await createReactAgent({
    llm,
    tools,
    prompt: agentPrompt,
  });

  return new AgentExecutor({
    agent,
    tools,
    maxIterations: 10,
    verbose: true,
  });
}

// Agent workflow functions
async function planResearch(state: AgentState, agent: AgentExecutor): Promise<AgentState> {
  const plan = await agent.invoke({
    input: `Create a research plan for: "${state.prompt}". 
           Consider: web search queries, fact-checking needs, image requirements, 
           and source verification priorities.`
  });

  return {
    ...state,
    // Add research plan to state
  };
}

async function performWebSearch(state: AgentState, agent: AgentExecutor): Promise<AgentState> {
  const searchResults = await agent.invoke({
    input: `Search for comprehensive information about: "${state.prompt}"`
  });

  // Process search results
  const results: SearchResult[] = [
    // Simulated results - would be populated by real search API
    {
      title: "Example Article Title",
      url: "https://example.com/article",
      snippet: "Relevant information snippet...",
      relevanceScore: 0.9,
      publishDate: "2025-07-28",
      source: "Example News"
    }
  ];

  return {
    ...state,
    searchResults: results
  };
}

async function verifySourceCredibility(state: AgentState, agent: AgentExecutor): Promise<AgentState> {
  const verifiedSources: VerifiedSource[] = [];
  
  for (const result of state.searchResults) {
    const analysis = await agent.invoke({
      input: `Analyze the credibility of this source: ${result.url}`
    });
    
    // Process credibility analysis
    verifiedSources.push({
      url: result.url,
      trustScore: 0.8, // Would be calculated from analysis
      bias: 'center',
      factualRating: 0.9,
      lastUpdated: new Date().toISOString()
    });
  }

  return {
    ...state,
    verifiedSources
  };
}

async function searchRelatedImages(state: AgentState, agent: AgentExecutor): Promise<AgentState> {
  const imageResults = await agent.invoke({
    input: `Find relevant, high-quality images for: "${state.prompt}"`
  });

  const images: ImageResult[] = [
    // Simulated results
    {
      url: "https://example.com/image.jpg",
      title: "Relevant Image",
      description: "Description of the image",
      source: "Example Source",
      license: "Creative Commons",
      relevanceScore: 0.85
    }
  ];

  return {
    ...state,
    relatedImages: images
  };
}

async function performFactChecking(state: AgentState, agent: AgentExecutor): Promise<AgentState> {
  // Extract key claims from research
  const claims = extractClaims(state.searchResults);
  const factChecks: FactCheck[] = [];

  for (const claim of claims) {
    const verification = await agent.invoke({
      input: `Fact-check this claim: "${claim}"`
    });

    factChecks.push({
      claim,
      verdict: 'true', // Would be determined by fact-checking
      sources: ['source1.com', 'source2.com'],
      confidence: 0.9
    });
  }

  return {
    ...state,
    factChecks
  };
}

async function synthesizeContent(state: AgentState, agent: AgentExecutor): Promise<AgentState> {
  const synthesis = await agent.invoke({
    input: `Create a ${state.length} ${state.style} article in a ${state.tone} tone about: "${state.prompt}"
           
           Use this verified information:
           - Search results: ${JSON.stringify(state.searchResults.slice(0, 3))}
           - Fact checks: ${JSON.stringify(state.factChecks)}
           - Source credibility: ${JSON.stringify(state.verifiedSources.slice(0, 3))}
           
           Requirements:
           - Include proper citations
           - Use verified facts only
           - Maintain journalistic integrity
           - Structure with clear headings`
  });

  return {
    ...state,
    draft: synthesis.output || '',
    confidence: calculateConfidenceScore(state)
  };
}

async function formatContentWithCitations(state: AgentState, agent: AgentExecutor): Promise<AgentState> {
  const formatted = await agent.invoke({
    input: `Format this content into structured blocks with proper citations:
           
           Content: ${state.draft}
           
           Available images: ${JSON.stringify(state.relatedImages.slice(0, 2))}
           
           Format as JSON with blocks: heading, paragraph, image, quote, fact-check`
  });

  // Parse and structure content blocks
  const contentBlocks: ContentBlock[] = parseFormattedContent(formatted.output);
  const citations: Citation[] = generateCitations(state.verifiedSources);

  return {
    ...state,
    contentBlocks,
    citations
  };
}

async function performQualityReview(state: AgentState, agent: AgentExecutor): Promise<AgentState> {
  const review = await agent.invoke({
    input: `Review this content for quality, accuracy, and completeness:
           
           Content blocks: ${JSON.stringify(state.contentBlocks)}
           Confidence score: ${state.confidence}
           Fact checks: ${JSON.stringify(state.factChecks)}
           
           Determine if human review is required.`
  });

  const reviewRequired = state.confidence < 0.8 || 
                        state.factChecks.some(fc => fc.verdict === 'false') ||
                        state.verifiedSources.some(vs => vs.trustScore < 0.6);

  return {
    ...state,
    reviewRequired
  };
}

// Tool implementations (these would connect to real APIs in production)
async function webSearchTool(query: string): Promise<string> {
  // Would integrate with Google Search API, Bing API, or similar
  return JSON.stringify({
    results: [
      { title: `Search result for: ${query}`, url: 'example.com', snippet: 'Example snippet' }
    ]
  });
}

async function newsSearchTool(query: string): Promise<string> {
  // Would integrate with NewsAPI, Google News, or similar
  return JSON.stringify({
    articles: [
      { title: `News about: ${query}`, source: 'Example News', publishedAt: '2025-07-29' }
    ]
  });
}

async function imageSearchTool(query: string): Promise<string> {
  // Would integrate with Unsplash API, Pexels API, or similar
  return JSON.stringify({
    images: [
      { url: 'example.com/image.jpg', title: `Image of ${query}`, license: 'free' }
    ]
  });
}

async function factCheckTool(claim: string): Promise<string> {
  // Would integrate with fact-checking APIs or databases
  return JSON.stringify({
    claim,
    verdict: 'true',
    confidence: 0.9,
    sources: ['factcheck.org', 'snopes.com']
  });
}

async function sourceAnalysisTool(url: string): Promise<string> {
  // Would analyze source credibility using various metrics
  return JSON.stringify({
    url,
    trustScore: 0.8,
    bias: 'center',
    factualRating: 0.9
  });
}

async function contentAnalysisTool(content: string): Promise<string> {
  // Would analyze content for quality, bias, readability
  return JSON.stringify({
    qualityScore: 0.85,
    biasScore: 0.1,
    readabilityScore: 0.9,
    issues: []
  });
}

// Helper functions
function extractClaims(searchResults: SearchResult[]): string[] {
  // Extract key factual claims from search results
  return searchResults.map(result => result.snippet).slice(0, 3);
}

function calculateConfidenceScore(state: AgentState): number {
  // Calculate overall confidence based on source quality, fact-checks, etc.
  const sourceScore = state.verifiedSources.reduce((acc, source) => acc + source.trustScore, 0) / state.verifiedSources.length;
  const factScore = state.factChecks.reduce((acc, fact) => acc + fact.confidence, 0) / state.factChecks.length;
  return (sourceScore + factScore) / 2;
}

function parseFormattedContent(content: string): ContentBlock[] {
  // Parse AI-generated formatted content into structured blocks
  return [
    { type: 'heading', content: 'Example Heading' },
    { type: 'paragraph', content: 'Example paragraph content...' }
  ];
}

function generateCitations(sources: VerifiedSource[]): Citation[] {
  // Generate proper citations from verified sources
  return sources.map((source, index) => ({
    id: `cite-${index + 1}`,
    url: source.url,
    title: 'Example Source Title',
    accessDate: new Date().toISOString()
  }));
}

// This sample demonstrates:
// 1. Multi-step agent workflow with LangChain
// 2. Tool integration for web search, fact-checking, image search
// 3. Source verification and credibility analysis
// 4. Structured content creation with citations
// 5. Quality assessment and review requirements
// 6. Streaming responses with detailed progress updates
