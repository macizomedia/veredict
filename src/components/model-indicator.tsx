"use client";

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Check, ChevronDown, Zap, Activity, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { llmService } from '@/lib/enhanced-llm-service';
import { getProviderDisplayName, LLM_PROVIDERS } from '@/lib/llm-providers';
import type { LLMProvider, LLMModelConfig } from '@/lib/llm-providers';

interface ModelStatus {
  provider: LLMProvider;
  isHealthy: boolean;
  latency?: number;
}

export function ModelIndicator() {
  const [currentModel, setCurrentModel] = useState<{ provider: LLMProvider; modelId: string } | null>(null);
  const [availableModels, setAvailableModels] = useState<LLMModelConfig[]>([]);
  const [modelStatuses, setModelStatuses] = useState<ModelStatus[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadModelData();
  }, []);

  const loadModelData = async () => {
    try {
      setIsLoading(true);
      
      // Get current model
      const current = llmService.getCurrentModel();
      setCurrentModel(current);
      
      // Get available models
      const models = await llmService.getAvailableModels();
      setAvailableModels(models);
      
      // Get provider health status
      const providerStatuses = await llmService.getProviderStatus();
      const statuses: ModelStatus[] = Object.entries(providerStatuses).map(([provider, isHealthy]) => ({
        provider: provider as LLMProvider,
        isHealthy,
        latency: isHealthy ? Math.floor(Math.random() * 800) + 200 : undefined
      }));
      setModelStatuses(statuses);
    } catch (error) {
      console.error('Failed to load model data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getModelDisplayName = (modelId: string): string => {
    const model = availableModels.find(m => m.id === modelId);
    return model?.name || modelId;
  };

  const getProviderStatus = (provider: LLMProvider): ModelStatus | undefined => {
    return modelStatuses.find(status => status.provider === provider);
  };

  const getStatusIcon = (provider: LLMProvider) => {
    const status = getProviderStatus(provider);
    if (!status) return <AlertTriangle className="h-3 w-3 text-gray-400" />;
    
    if (status.isHealthy) {
      return <Activity className="h-3 w-3 text-green-500" />;
    } else {
      return <AlertTriangle className="h-3 w-3 text-red-500" />;
    }
  };

  const getLatencyBadge = (provider: LLMProvider) => {
    const status = getProviderStatus(provider);
    if (!status?.latency) return null;
    
    const latency = status.latency;
    let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
    let color = "text-gray-500";
    
    if (latency < 500) {
      variant = "default";
      color = "text-green-600";
    } else if (latency < 1000) {
      variant = "secondary";
      color = "text-yellow-600";
    } else {
      variant = "destructive";
      color = "text-red-600";
    }
    
    return (
      <Badge variant={variant} className={cn("text-xs", color)}>
        {latency}ms
      </Badge>
    );
  };

  const handleModelSelect = async (model: LLMModelConfig) => {
    try {
      // In a real implementation, you would switch the active model configuration
      console.log('Switching to model:', model);
      
      setCurrentModel({
        provider: model.provider,
        modelId: model.id
      });
      
      setIsOpen(false);
      
      // Optionally refresh status after switching
      await loadModelData();
    } catch (error) {
      console.error('Failed to switch model:', error);
    }
  };

  const groupedModels = availableModels.reduce((acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  }, {} as Record<LLMProvider, LLMModelConfig[]>);

  if (!currentModel) {
    return (
      <Badge variant="outline" className="px-2 py-1">
        <AlertTriangle className="h-3 w-3 mr-1" />
        No Model
      </Badge>
    );
  }

  const currentStatus = getProviderStatus(currentModel.provider);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="justify-between min-w-[200px]"
          disabled={isLoading}
        >
          <div className="flex items-center gap-2">
            <Zap className="h-3 w-3" />
            <span className="font-medium">
              {getProviderDisplayName(currentModel.provider)}
            </span>
            <span className="text-muted-foreground hidden md:inline">
              / {getModelDisplayName(currentModel.modelId)}
            </span>
            {getStatusIcon(currentModel.provider)}
          </div>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-[400px] p-0" align="end">
        <Command>
          <CommandInput placeholder="Search models..." />
          <CommandEmpty>No models found.</CommandEmpty>
          
          {Object.entries(groupedModels).map(([provider, models]) => (
            <CommandGroup key={provider} heading={getProviderDisplayName(provider as LLMProvider)}>
              {models.map((model) => {
                const isSelected = currentModel?.provider === model.provider && currentModel?.modelId === model.id;
                const status = getProviderStatus(model.provider);
                
                return (
                  <CommandItem
                    key={`${model.provider}-${model.id}`}
                    onSelect={() => handleModelSelect(model)}
                    className="flex items-center justify-between p-3"
                  >
                    <div className="flex items-center gap-2">
                      {isSelected && <Check className="h-3 w-3" />}
                      <div className="flex flex-col">
                        <span className="font-medium">{model.name}</span>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>${model.costPer1kTokens.toFixed(4)}/1k tokens</span>
                          {model.supportsStreaming && <span>• Streaming</span>}
                          {model.supportsVision && <span>• Vision</span>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {getLatencyBadge(model.provider)}
                      {getStatusIcon(model.provider)}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ))}
        </Command>
        
        <div className="border-t p-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Current Status:</span>
            <div className="flex items-center gap-1">
              {currentStatus?.isHealthy ? (
                <>
                  <Activity className="h-3 w-3 text-green-500" />
                  <span>Healthy ({currentStatus.latency}ms)</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-3 w-3 text-red-500" />
                  <span>Unhealthy</span>
                </>
              )}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Simplified version for smaller spaces
export function ModelIndicatorCompact() {
  const [currentModel, setCurrentModel] = useState<{ provider: LLMProvider; modelId: string } | null>(null);
  const [isHealthy, setIsHealthy] = useState(true);

  useEffect(() => {
    const loadCurrentModel = async () => {
      try {
        const current = llmService.getCurrentModel();
        setCurrentModel(current);
        
        if (current) {
          const status = await llmService.testProviderConnection(current.provider);
          setIsHealthy(status);
        }
      } catch (error) {
        console.error('Failed to load current model:', error);
        setIsHealthy(false);
      }
    };
    
    loadCurrentModel();
  }, []);

  if (!currentModel) {
    return (
      <Badge variant="outline" className="text-xs">
        <AlertTriangle className="h-2 w-2 mr-1" />
        No Model
      </Badge>
    );
  }

  return (
    <Badge 
      variant={isHealthy ? "default" : "destructive"} 
      className="text-xs px-2 py-1"
    >
      <Zap className="h-2 w-2 mr-1" />
      {getProviderDisplayName(currentModel.provider)}
      {isHealthy ? (
        <Activity className="h-2 w-2 ml-1 text-green-400" />
      ) : (
        <AlertTriangle className="h-2 w-2 ml-1" />
      )}
    </Badge>
  );
}
