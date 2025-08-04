import { z } from 'zod';

/**
 * Enhanced LLM Provider Management System
 * Supports multiple AI providers with user-configurable API keys and endpoints
 */

// Supported LLM Providers
export const LLM_PROVIDERS = {
  OPENAI: 'openai',
  ANTHROPIC: 'anthropic',
  GOOGLE: 'google',
  AZURE_OPENAI: 'azure-openai',
  COHERE: 'cohere',
  HUGGING_FACE: 'hugging-face',
  OLLAMA: 'ollama',
  CUSTOM: 'custom',
} as const;

export type LLMProvider = typeof LLM_PROVIDERS[keyof typeof LLM_PROVIDERS];

// Model configurations for different providers
export interface LLMModelConfig {
  id: string;
  name: string;
  provider: LLMProvider;
  maxTokens: number;
  costPer1kTokens: number;
  supportsStreaming: boolean;
  supportsVision: boolean;
  contextWindow: number;
  description: string;
}

export const DEFAULT_MODELS: Record<LLMProvider, LLMModelConfig[]> = {
  [LLM_PROVIDERS.OPENAI]: [
    {
      id: 'gpt-4-turbo-preview',
      name: 'GPT-4 Turbo',
      provider: 'openai',
      maxTokens: 4096,
      costPer1kTokens: 0.03,
      supportsStreaming: true,
      supportsVision: true,
      contextWindow: 128000,
      description: 'Most capable model for complex reasoning and analysis'
    },
    {
      id: 'gpt-4',
      name: 'GPT-4',
      provider: 'openai',
      maxTokens: 8192,
      costPer1kTokens: 0.06,
      supportsStreaming: true,
      supportsVision: false,
      contextWindow: 8192,
      description: 'High-quality model for detailed content generation'
    },
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      provider: 'openai',
      maxTokens: 4096,
      costPer1kTokens: 0.002,
      supportsStreaming: true,
      supportsVision: false,
      contextWindow: 16385,
      description: 'Fast and cost-effective for most tasks'
    }
  ],
  [LLM_PROVIDERS.ANTHROPIC]: [
    {
      id: 'claude-3-opus-20240229',
      name: 'Claude 3 Opus',
      provider: 'anthropic',
      maxTokens: 4096,
      costPer1kTokens: 0.075,
      supportsStreaming: true,
      supportsVision: true,
      contextWindow: 200000,
      description: 'Most intelligent model for complex analysis'
    },
    {
      id: 'claude-3-sonnet-20240229',
      name: 'Claude 3 Sonnet',
      provider: 'anthropic',
      maxTokens: 4096,
      costPer1kTokens: 0.015,
      supportsStreaming: true,
      supportsVision: true,
      contextWindow: 200000,
      description: 'Balanced performance and speed'
    },
    {
      id: 'claude-3-haiku-20240307',
      name: 'Claude 3 Haiku',
      provider: 'anthropic',
      maxTokens: 4096,
      costPer1kTokens: 0.0025,
      supportsStreaming: true,
      supportsVision: true,
      contextWindow: 200000,
      description: 'Fast and efficient for simple tasks'
    }
  ],
  [LLM_PROVIDERS.GOOGLE]: [
    {
      id: 'gemini-pro',
      name: 'Gemini Pro',
      provider: 'google',
      maxTokens: 8192,
      costPer1kTokens: 0.0005,
      supportsStreaming: true,
      supportsVision: false,
      contextWindow: 32000,
      description: 'Google\'s multimodal AI model'
    },
    {
      id: 'gemini-pro-vision',
      name: 'Gemini Pro Vision',
      provider: 'google',
      maxTokens: 4096,
      costPer1kTokens: 0.0025,
      supportsStreaming: true,
      supportsVision: true,
      contextWindow: 16000,
      description: 'Gemini with vision capabilities'
    }
  ],
  [LLM_PROVIDERS.AZURE_OPENAI]: [],
  [LLM_PROVIDERS.COHERE]: [
    {
      id: 'command-r-plus',
      name: 'Command R+',
      provider: 'cohere',
      maxTokens: 4096,
      costPer1kTokens: 0.03,
      supportsStreaming: true,
      supportsVision: false,
      contextWindow: 128000,
      description: 'Advanced reasoning and analysis'
    }
  ],
  [LLM_PROVIDERS.HUGGING_FACE]: [],
  [LLM_PROVIDERS.OLLAMA]: [],
  [LLM_PROVIDERS.CUSTOM]: []
};

// Provider-specific configuration schemas
export const ProviderConfigSchemas = {
  [LLM_PROVIDERS.OPENAI]: z.object({
    apiKey: z.string().min(1, 'OpenAI API key required'),
    organization: z.string().optional(),
    baseUrl: z.string().url().optional(),
  }),
  [LLM_PROVIDERS.ANTHROPIC]: z.object({
    apiKey: z.string().min(1, 'Anthropic API key required'),
    baseUrl: z.string().url().optional(),
  }),
  [LLM_PROVIDERS.GOOGLE]: z.object({
    apiKey: z.string().min(1, 'Google AI API key required'),
    projectId: z.string().optional(),
    region: z.string().default('us-central1'),
  }),
  [LLM_PROVIDERS.AZURE_OPENAI]: z.object({
    apiKey: z.string().min(1, 'Azure OpenAI API key required'),
    endpoint: z.string().url('Valid Azure endpoint required'),
    deploymentName: z.string().min(1, 'Deployment name required'),
    apiVersion: z.string().default('2024-02-01'),
  }),
  [LLM_PROVIDERS.COHERE]: z.object({
    apiKey: z.string().min(1, 'Cohere API key required'),
    baseUrl: z.string().url().optional(),
  }),
  [LLM_PROVIDERS.HUGGING_FACE]: z.object({
    apiKey: z.string().min(1, 'Hugging Face API key required'),
    endpoint: z.string().url().optional(),
  }),
  [LLM_PROVIDERS.OLLAMA]: z.object({
    baseUrl: z.string().url().default('http://localhost:11434'),
    model: z.string().default('llama2'),
  }),
  [LLM_PROVIDERS.CUSTOM]: z.object({
    name: z.string().min(1, 'Provider name required'),
    baseUrl: z.string().url('Valid endpoint URL required'),
    apiKey: z.string().optional(),
    headers: z.record(z.string()).optional(),
    requestFormat: z.enum(['openai', 'anthropic', 'custom']).default('openai'),
  }),
};

// LLM Configuration for user settings
export const LLMConfigSchema = z.object({
  id: z.string(),
  userId: z.string(),
  provider: z.nativeEnum(LLM_PROVIDERS),
  modelId: z.string(),
  displayName: z.string(),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
  config: z.record(z.any()), // Provider-specific config
  usage: z.object({
    totalTokens: z.number().default(0),
    totalCost: z.number().default(0),
    lastUsed: z.date().optional(),
  }).default({}),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

// Request/Response schemas for AI generation
export const AIGenerationRequestSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  modelConfigId: z.string().optional(), // Use specific model config
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(1).max(8192).default(2048),
  topP: z.number().min(0).max(1).default(1),
  stream: z.boolean().default(false),
  sources: z.array(z.string().url()).optional(),
  tone: z.enum(['neutral', 'optimistic', 'analytical', 'professional', 'conversational']).default('neutral'),
  style: z.enum(['standard', 'journalistic', 'academic', 'blog', 'technical']).default('standard'),
  length: z.enum(['short', 'medium', 'long']).default('medium'),
  metadata: z.record(z.any()).optional(),
});

export const AIGenerationResponseSchema = z.object({
  success: z.boolean(),
  content: z.string(),
  contentBlocks: z.array(z.object({
    type: z.string(),
    content: z.string(),
  })).optional(),
  modelUsed: z.object({
    provider: z.string(),
    modelId: z.string(),
    tokensUsed: z.number(),
    cost: z.number(),
  }),
  metadata: z.object({
    generationTime: z.number(),
    reviewRequired: z.boolean().default(false),
    confidence: z.number().min(0).max(1).optional(),
    fallbackUsed: z.boolean().optional(),
    originalProvider: z.string().optional(),
  }),
  error: z.string().optional(),
});

// Model status and health check schemas
export const ModelHealthSchema = z.object({
  provider: z.nativeEnum(LLM_PROVIDERS),
  modelId: z.string(),
  status: z.enum(['healthy', 'degraded', 'unhealthy', 'unknown']),
  latency: z.number().optional(),
  errorRate: z.number().min(0).max(1).optional(),
  lastChecked: z.date(),
  details: z.record(z.any()).optional(),
});

// Usage analytics schema
export const UsageAnalyticsSchema = z.object({
  userId: z.string(),
  period: z.enum(['hour', 'day', 'week', 'month']),
  totalRequests: z.number(),
  totalTokens: z.number(),
  totalCost: z.number(),
  averageLatency: z.number(),
  topModels: z.array(z.object({
    modelId: z.string(),
    provider: z.string(),
    requests: z.number(),
    tokens: z.number(),
    cost: z.number(),
  })),
  errorRate: z.number().min(0).max(1),
});

// Type exports
export type LLMConfig = z.infer<typeof LLMConfigSchema>;
export type AIGenerationRequest = z.infer<typeof AIGenerationRequestSchema>;
export type AIGenerationResponse = z.infer<typeof AIGenerationResponseSchema>;
export type ModelHealth = z.infer<typeof ModelHealthSchema>;
export type UsageAnalytics = z.infer<typeof UsageAnalyticsSchema>;

// Utility functions
export function getProviderDisplayName(provider: LLMProvider): string {
  const names: Record<LLMProvider, string> = {
    [LLM_PROVIDERS.OPENAI]: 'OpenAI',
    [LLM_PROVIDERS.ANTHROPIC]: 'Anthropic',
    [LLM_PROVIDERS.GOOGLE]: 'Google AI',
    [LLM_PROVIDERS.AZURE_OPENAI]: 'Azure OpenAI',
    [LLM_PROVIDERS.COHERE]: 'Cohere',
    [LLM_PROVIDERS.HUGGING_FACE]: 'Hugging Face',
    [LLM_PROVIDERS.OLLAMA]: 'Ollama',
    [LLM_PROVIDERS.CUSTOM]: 'Custom Provider',
  };
  return names[provider];
}

export function getModelsByProvider(provider: LLMProvider): LLMModelConfig[] {
  return DEFAULT_MODELS[provider] || [];
}

export function validateProviderConfig(provider: LLMProvider, config: any): boolean {
  try {
    const schema = ProviderConfigSchemas[provider];
    schema.parse(config);
    return true;
  } catch {
    return false;
  }
}

export function estimateTokens(text: string): number {
  // Rough estimation: 1 token ≈ 4 characters for English text
  return Math.ceil(text.length / 4);
}

export function calculateCost(tokens: number, costPer1k: number): number {
  return (tokens / 1000) * costPer1k;
}
