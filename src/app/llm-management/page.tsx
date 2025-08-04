import { LLMProviderManager } from "@/components/llm-provider-manager";
import { ModelIndicator } from "@/components/model-indicator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function LLMManagementPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">LLM Provider Management</h1>
        <p className="text-muted-foreground">
          Configure and manage your AI language model providers for content generation.
        </p>
      </div>

      {/* Model Indicator Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Current Model Indicator</CardTitle>
          <CardDescription>
            Shows the currently active AI model with health status and allows switching between configured models.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Current Model:</span>
            <ModelIndicator />
          </div>
          <Separator className="my-4" />
          <div className="text-sm text-muted-foreground">
            Click the indicator above to see available models and switch between them. 
            The indicator shows real-time health status and latency information.
          </div>
        </CardContent>
      </Card>

      {/* Main LLM Provider Manager */}
      <LLMProviderManager />

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            How to set up and use the LLM provider management system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">1. Add Provider Configuration</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Go to the "Configurations" tab</li>
                <li>• Select your preferred AI provider (OpenAI, Anthropic, Google AI)</li>
                <li>• Choose a model from the available options</li>
                <li>• Enter your API key securely</li>
                <li>• Click "Add Configuration"</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">2. Monitor Provider Health</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Check the "Overview" tab for real-time status</li>
                <li>• Green indicators show healthy connections</li>
                <li>• Latency information helps optimize performance</li>
                <li>• Use "Test All Providers" to verify connections</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">3. Switch Models</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use the model indicator in the top navigation</li>
                <li>• Click to see all available models</li>
                <li>• Switch between providers based on needs</li>
                <li>• System automatically falls back if primary fails</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">4. Track Usage</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Monitor token usage and costs</li>
                <li>• View analytics in the "Analytics" tab</li>
                <li>• Track performance across different models</li>
                <li>• Optimize usage based on insights</li>
              </ul>
            </div>
          </div>
          
          <Separator />
          
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">💡 Pro Tips</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Configure multiple providers for redundancy</li>
              <li>• Use faster models for drafts, premium models for final content</li>
              <li>• Monitor costs and set up usage alerts</li>
              <li>• Test different models to find the best fit for your content style</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
