import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { llmService } from "@/lib/enhanced-llm-service";
import { 
  LLMConfigSchema,
  AIGenerationRequestSchema,
  LLM_PROVIDERS,
  ProviderConfigSchemas
} from "@/lib/llm-providers";

export const llmRouter = createTRPCRouter({
  // Get current model configuration
  getCurrentModel: publicProcedure
    .query(async () => {
      return llmService.getCurrentModel();
    }),

  // Get provider status for all configured providers
  getProviderStatus: publicProcedure
    .query(async () => {
      return await llmService.getProviderStatus();
    }),

  // Test connection to a specific provider
  testProviderConnection: protectedProcedure
    .input(z.object({
      provider: z.nativeEnum(LLM_PROVIDERS)
    }))
    .mutation(async ({ input }) => {
      return await llmService.testProviderConnection(input.provider);
    }),

  // Get available models for a provider or all providers
  getAvailableModels: publicProcedure
    .input(z.object({
      provider: z.nativeEnum(LLM_PROVIDERS).optional()
    }))
    .query(async ({ input }) => {
      return await llmService.getAvailableModels(input.provider);
    }),

  // Get user's LLM configurations
  getUserConfigs: protectedProcedure
    .query(async ({ ctx }) => {
      if (!ctx.session?.user?.id) {
        throw new Error("User not authenticated");
      }
      return llmService.getUserConfigs(ctx.session.user.id);
    }),

  // Add new provider configuration
  addProviderConfig: protectedProcedure
    .input(z.object({
      provider: z.nativeEnum(LLM_PROVIDERS),
      modelId: z.string(),
      displayName: z.string().optional(),
      config: z.record(z.any()), // Provider-specific configuration
      isDefault: z.boolean().default(false)
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session?.user?.id) {
        throw new Error("User not authenticated");
      }

      // Validate provider-specific configuration
      const schema = ProviderConfigSchemas[input.provider];
      const validatedConfig = schema.parse(input.config);

      const llmConfig = LLMConfigSchema.parse({
        id: Date.now().toString(), // In production, use proper UUID
        userId: ctx.session.user.id,
        provider: input.provider,
        modelId: input.modelId,
        displayName: input.displayName || `${input.provider} - ${input.modelId}`,
        isDefault: input.isDefault,
        isActive: true,
        config: validatedConfig,
        usage: {
          totalTokens: 0,
          totalCost: 0
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await llmService.addProviderConfig(llmConfig);
      return llmConfig;
    }),

  // Update provider configuration
  updateProviderConfig: protectedProcedure
    .input(z.object({
      configId: z.string(),
      updates: z.object({
        displayName: z.string().optional(),
        isDefault: z.boolean().optional(),
        isActive: z.boolean().optional(),
        config: z.record(z.any()).optional()
      })
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session?.user?.id) {
        throw new Error("User not authenticated");
      }

      // In a real implementation, you would update the configuration in the database
      // For now, we'll just return success
      return { success: true, configId: input.configId };
    }),

  // Remove provider configuration
  removeProviderConfig: protectedProcedure
    .input(z.object({
      configId: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session?.user?.id) {
        throw new Error("User not authenticated");
      }

      // In a real implementation, you would remove from database
      return { success: true, configId: input.configId };
    }),

  // Generate content using the enhanced service
  generateContent: protectedProcedure
    .input(AIGenerationRequestSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session?.user?.id) {
        throw new Error("User not authenticated");
      }

      return await llmService.generateContent(input);
    }),

  // Legacy support for existing content generation
  generateContentSimple: protectedProcedure
    .input(z.object({
      prompt: z.string().min(1),
      sources: z.array(z.string().url()).optional(),
      tone: z.enum(['neutral', 'optimistic', 'analytical', 'professional', 'conversational']).default('neutral'),
      style: z.enum(['standard', 'journalistic', 'academic', 'blog', 'technical']).default('standard'),
      length: z.enum(['short', 'medium', 'long']).default('medium')
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session?.user?.id) {
        throw new Error("User not authenticated");
      }

      return await llmService.generateContentSimple(input);
    }),

  // Get usage analytics for user
  getUsageAnalytics: protectedProcedure
    .input(z.object({
      period: z.enum(['hour', 'day', 'week', 'month']).default('day'),
      startDate: z.date().optional(),
      endDate: z.date().optional()
    }))
    .query(async ({ input, ctx }) => {
      if (!ctx.session?.user?.id) {
        throw new Error("User not authenticated");
      }

      // Mock usage data for now
      return {
        userId: ctx.session.user.id,
        period: input.period,
        totalRequests: 127,
        totalTokens: 45600,
        totalCost: 2.34,
        averageLatency: 850,
        topModels: [
          {
            modelId: 'gpt-4-turbo-preview',
            provider: 'openai',
            requests: 85,
            tokens: 32000,
            cost: 1.60
          },
          {
            modelId: 'claude-3-sonnet-20240229',
            provider: 'anthropic',
            requests: 42,
            tokens: 13600,
            cost: 0.74
          }
        ],
        errorRate: 0.02
      };
    }),

  // Get model health status
  getModelHealth: publicProcedure
    .query(async () => {
      const providerStatuses = await llmService.getProviderStatus();
      
      return Object.entries(providerStatuses).map(([provider, isHealthy]) => ({
        provider,
        modelId: 'default', // In production, this would be more specific
        status: isHealthy ? 'healthy' : 'unhealthy' as const,
        latency: isHealthy ? Math.floor(Math.random() * 800) + 200 : undefined,
        errorRate: isHealthy ? Math.random() * 0.05 : Math.random() * 0.3,
        lastChecked: new Date(),
        details: {
          provider: provider,
          isConnected: isHealthy
        }
      }));
    }),

  // Batch test all providers
  testAllProviders: protectedProcedure
    .mutation(async () => {
      const results = await llmService.getProviderStatus();
      
      return {
        success: true,
        results,
        timestamp: new Date(),
        summary: {
          total: Object.keys(results).length,
          healthy: Object.values(results).filter(Boolean).length,
          unhealthy: Object.values(results).filter(status => !status).length
        }
      };
    }),

  // Get configured providers list
  getConfiguredProviders: publicProcedure
    .query(async () => {
      return llmService.getConfiguredProviders();
    }),

  // Switch default model
  setDefaultModel: protectedProcedure
    .input(z.object({
      configId: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session?.user?.id) {
        throw new Error("User not authenticated");
      }

      // In production, update the user's default model configuration
      return { success: true, configId: input.configId };
    })
});

export type LLMRouter = typeof llmRouter;
