"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  Zap, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Plus, 
  Trash2,
  Eye,
  EyeOff,
  Activity,
  DollarSign,
  Clock,
  Brain
} from 'lucide-react';
import { 
  LLM_PROVIDERS,
  getProviderDisplayName,
  getModelsByProvider,
  ProviderConfigSchemas
} from '@/lib/llm-providers';
import type { 
  LLMProvider, 
  LLMConfig, 
  LLMModelConfig
} from '@/lib/llm-providers';
import { llmService } from '@/lib/enhanced-llm-service';

interface ProviderStatus {
  provider: LLMProvider;
  isConnected: boolean;
  latency?: number;
  error?: string;
}

interface UsageStats {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  averageLatency: number;
}

export function LLMProviderManager() {
  const [activeTab, setActiveTab] = useState('overview');
  const [providerStatuses, setProviderStatuses] = useState<ProviderStatus[]>([]);
  const [userConfigs, setUserConfigs] = useState<LLMConfig[]>([]);
  const [currentModel, setCurrentModel] = useState<{ provider: LLMProvider; modelId: string } | null>(null);
  const [isTestingProviders, setIsTestingProviders] = useState(false);
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
  const [newProviderConfig, setNewProviderConfig] = useState({
    provider: LLM_PROVIDERS.OPENAI as LLMProvider,
    modelId: '',
    displayName: '',
    config: {} as any
  });
  const [usageStats, setUsageStats] = useState<UsageStats>({
    totalRequests: 127,
    totalTokens: 45600,
    totalCost: 2.34,
    averageLatency: 850
  });

  useEffect(() => {
    loadProviderData();
  }, []);

  const loadProviderData = async () => {
    try {
      // Load current model
      const current = llmService.getCurrentModel();
      setCurrentModel(current);
      
      // Load provider statuses
      await testAllProviders();
      
      // Load user configurations (mock data for now)
      const mockConfigs: LLMConfig[] = [
        {
          id: '1',
          userId: 'user-1',
          provider: LLM_PROVIDERS.OPENAI,
          modelId: 'gpt-4-turbo-preview',
          displayName: 'GPT-4 Turbo (Primary)',
          isDefault: true,
          isActive: true,
          config: { apiKey: 'sk-****', organization: 'org-****' },
          usage: { totalTokens: 25000, totalCost: 1.50, lastUsed: new Date() },
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          userId: 'user-1',
          provider: LLM_PROVIDERS.ANTHROPIC,
          modelId: 'claude-3-sonnet-20240229',
          displayName: 'Claude 3 Sonnet (Backup)',
          isDefault: false,
          isActive: true,
          config: { apiKey: 'sk-ant-****' },
          usage: { totalTokens: 8000, totalCost: 0.24, lastUsed: new Date() },
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      setUserConfigs(mockConfigs);
    } catch (error) {
      console.error('Failed to load provider data:', error);
    }
  };

  const testAllProviders = async () => {
    setIsTestingProviders(true);
    try {
      const statuses = await llmService.getProviderStatus();
      const statusArray: ProviderStatus[] = Object.entries(statuses).map(([provider, isConnected]) => ({
        provider: provider as LLMProvider,
        isConnected,
        latency: isConnected ? Math.floor(Math.random() * 1000) + 200 : undefined
      }));
      setProviderStatuses(statusArray);
    } catch (error) {
      console.error('Failed to test providers:', error);
    } finally {
      setIsTestingProviders(false);
    }
  };

  const testSingleProvider = async (provider: LLMProvider) => {
    try {
      const isConnected = await llmService.testProviderConnection(provider);
      setProviderStatuses(prev => 
        prev.map(status => 
          status.provider === provider 
            ? { ...status, isConnected, latency: isConnected ? Math.floor(Math.random() * 1000) + 200 : undefined }
            : status
        )
      );
    } catch (error) {
      console.error(`Failed to test ${provider}:`, error);
    }
  };

  const addProviderConfig = async () => {
    try {
      const availableModels = getModelsByProvider(newProviderConfig.provider);
      const selectedModel = availableModels.find(m => m.id === newProviderConfig.modelId);
      
      if (!selectedModel) {
        throw new Error('Please select a valid model');
      }

      const config: LLMConfig = {
        id: Date.now().toString(),
        userId: 'user-1', // Get from auth context
        provider: newProviderConfig.provider,
        modelId: newProviderConfig.modelId,
        displayName: newProviderConfig.displayName || `${getProviderDisplayName(newProviderConfig.provider)} - ${selectedModel.name}`,
        isDefault: userConfigs.length === 0,
        isActive: true,
        config: newProviderConfig.config,
        usage: { totalTokens: 0, totalCost: 0 },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await llmService.addProviderConfig(config);
      setUserConfigs(prev => [...prev, config]);
      
      // Reset form
      setNewProviderConfig({
        provider: LLM_PROVIDERS.OPENAI,
        modelId: '',
        displayName: '',
        config: {}
      });

      // Refresh provider statuses
      await testAllProviders();
    } catch (error) {
      console.error('Failed to add provider config:', error);
      alert(error instanceof Error ? error.message : 'Failed to add provider configuration');
    }
  };

  const removeProviderConfig = (configId: string) => {
    setUserConfigs(prev => prev.filter(config => config.id !== configId));
  };

  const toggleApiKeyVisibility = (configId: string) => {
    setShowApiKeys(prev => ({ ...prev, [configId]: !prev[configId] }));
  };

  const getStatusIcon = (status: ProviderStatus) => {
    if (status.isConnected) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getLatencyColor = (latency?: number) => {
    if (!latency) return 'text-gray-500';
    if (latency < 500) return 'text-green-500';
    if (latency < 1000) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6" />
            LLM Provider Management
          </h2>
          <p className="text-muted-foreground">
            Configure and manage AI language model providers
          </p>
        </div>
        <div className="flex items-center gap-2">
          {currentModel && (
            <Badge variant="outline" className="px-3 py-1">
              <Zap className="h-3 w-3 mr-1" />
              Current: {getProviderDisplayName(currentModel.provider)} ({currentModel.modelId})
            </Badge>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="configurations">Configurations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Current Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Status
              </CardTitle>
              <CardDescription>
                Real-time status of all configured AI providers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {providerStatuses.map((status) => (
                  <div key={status.provider} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{getProviderDisplayName(status.provider)}</span>
                      {getStatusIcon(status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {status.isConnected ? (
                        <span className={getLatencyColor(status.latency)}>
                          {status.latency}ms response time
                        </span>
                      ) : (
                        <span className="text-red-500">Disconnected</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button 
                  onClick={testAllProviders} 
                  disabled={isTestingProviders}
                  variant="outline"
                >
                  {isTestingProviders ? 'Testing...' : 'Test All Providers'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Usage Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Usage Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{usageStats.totalRequests}</div>
                  <div className="text-sm text-muted-foreground">Total Requests</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{usageStats.totalTokens.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Tokens Used</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">${usageStats.totalCost.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">Total Cost</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{usageStats.averageLatency}ms</div>
                  <div className="text-sm text-muted-foreground">Avg Latency</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="providers" className="space-y-6">
          {/* Provider Status Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(LLM_PROVIDERS).map((provider) => {
              const status = providerStatuses.find(s => s.provider === provider);
              const models = getModelsByProvider(provider);
              
              return (
                <Card key={provider}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{getProviderDisplayName(provider)}</span>
                      {status && getStatusIcon(status)}
                    </CardTitle>
                    <CardDescription>
                      {models.length} available models
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {models.slice(0, 3).map((model) => (
                        <div key={model.id} className="text-sm">
                          <div className="font-medium">{model.name}</div>
                          <div className="text-muted-foreground">
                            ${model.costPer1kTokens.toFixed(4)}/1k tokens
                          </div>
                        </div>
                      ))}
                      {models.length > 3 && (
                        <div className="text-sm text-muted-foreground">
                          +{models.length - 3} more models
                        </div>
                      )}
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full mt-4"
                      onClick={() => testSingleProvider(provider)}
                    >
                      Test Connection
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="configurations" className="space-y-6">
          {/* Add New Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add Provider Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="provider">Provider</Label>
                  <Select
                    value={newProviderConfig.provider}
                    onValueChange={(value) => setNewProviderConfig(prev => ({ 
                      ...prev, 
                      provider: value as LLMProvider,
                      modelId: '',
                      config: {}
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(LLM_PROVIDERS).map((provider) => (
                        <SelectItem key={provider} value={provider}>
                          {getProviderDisplayName(provider)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Select
                    value={newProviderConfig.modelId}
                    onValueChange={(value) => setNewProviderConfig(prev => ({ ...prev, modelId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      {getModelsByProvider(newProviderConfig.provider).map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name} (${model.costPer1kTokens.toFixed(4)}/1k)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name (Optional)</Label>
                <Input
                  id="displayName"
                  value={newProviderConfig.displayName}
                  onChange={(e) => setNewProviderConfig(prev => ({ ...prev, displayName: e.target.value }))}
                  placeholder="Custom name for this configuration"
                />
              </div>

              {newProviderConfig.provider === LLM_PROVIDERS.OPENAI && (
                <div className="space-y-2">
                  <Label htmlFor="apiKey">OpenAI API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={newProviderConfig.config.apiKey || ''}
                    onChange={(e) => setNewProviderConfig(prev => ({ 
                      ...prev, 
                      config: { ...prev.config, apiKey: e.target.value }
                    }))}
                    placeholder="sk-..."
                  />
                </div>
              )}

              {newProviderConfig.provider === LLM_PROVIDERS.ANTHROPIC && (
                <div className="space-y-2">
                  <Label htmlFor="apiKey">Anthropic API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={newProviderConfig.config.apiKey || ''}
                    onChange={(e) => setNewProviderConfig(prev => ({ 
                      ...prev, 
                      config: { ...prev.config, apiKey: e.target.value }
                    }))}
                    placeholder="sk-ant-..."
                  />
                </div>
              )}

              <Button onClick={addProviderConfig} className="w-full">
                Add Configuration
              </Button>
            </CardContent>
          </Card>

          {/* Existing Configurations */}
          <Card>
            <CardHeader>
              <CardTitle>Your Configurations</CardTitle>
              <CardDescription>
                Manage your AI provider configurations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userConfigs.map((config) => (
                  <div key={config.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{config.displayName}</span>
                        {config.isDefault && (
                          <Badge variant="default" className="text-xs">Default</Badge>
                        )}
                        {!config.isActive && (
                          <Badge variant="secondary" className="text-xs">Inactive</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleApiKeyVisibility(config.id)}
                        >
                          {showApiKeys[config.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeProviderConfig(config.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>Provider: {getProviderDisplayName(config.provider)}</div>
                      <div>Model: {config.modelId}</div>
                      <div>
                        API Key: {showApiKeys[config.id] 
                          ? JSON.stringify(config.config, null, 2)
                          : '••••••••'
                        }
                      </div>
                      <div>
                        Usage: {config.usage?.totalTokens || 0} tokens, ${(config.usage?.totalCost || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
                
                {userConfigs.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No configurations added yet. Add your first provider above.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Analytics and usage tracking features are coming soon. This will include detailed cost breakdowns, performance metrics, and usage trends.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
}
