"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle, Sparkles } from "lucide-react";

export default function AIAgentTestPage() {
  const [testResult, setTestResult] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    title: "The Future of Renewable Energy in Latin America",
    prompt: "Write about the potential and challenges of renewable energy adoption in Latin American countries",
    tone: "optimistic" as const,
    style: "journalistic" as const,
    length: "medium" as const,
    sources: [""],
  });

  // Test connection mutation
  const testConnection = api.ai.testConnection.useQuery(undefined, {
    enabled: false,
  });

  // Generate content mutation
  const generateContent = api.ai.generateContent.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        setGeneratedContent(result.data);
        setTestResult("Content generated successfully!");
      } else {
        setTestResult(`Error: ${result.error}`);
      }
    },
    onError: (error) => {
      setTestResult(`Error: ${error.message}`);
    },
  });

  // Create post with AI mutation
  const createAIPost = api.ai.createPostWithAI.useMutation({
    onSuccess: (result) => {
      setTestResult(`Post created successfully!`);
    },
    onError: (error) => {
      setTestResult(`Error creating post: ${error.message}`);
    },
  });

  const handleTestConnection = () => {
    setTestResult(null);
    testConnection.refetch().then((result) => {
      if (result.data?.connected) {
        setTestResult("✅ AI Agent connection successful!");
      } else {
        setTestResult(`❌ AI Agent connection failed: ${result.data?.error || 'Unknown error'}`);
      }
    });
  };

  const handleGenerateContent = () => {
    setTestResult(null);
    setGeneratedContent(null);
    
    const sources = formData.sources.filter(s => s.trim() !== "");
    
    generateContent.mutate({
      prompt: formData.prompt,
      tone: formData.tone,
      style: formData.style,
      length: formData.length,
      sources: sources.length > 0 ? sources : undefined,
    });
  };

  const handleCreatePost = () => {
    setTestResult(null);
    
    const sources = formData.sources.filter(s => s.trim() !== "");
    
    createAIPost.mutate({
      title: formData.title,
      prompt: formData.prompt,
      tone: formData.tone,
      style: formData.style,
      length: formData.length,
      sources: sources.length > 0 ? sources : undefined,
      minRead: 5,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
            <Sparkles className="h-8 w-8 text-blue-500" />
            AI Agent Test Console
          </h1>
          <p className="text-gray-600">
            Test your AI Agent integration with LangChain and Supabase Edge Functions
          </p>
        </div>

        {/* Connection Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Connection Test
            </CardTitle>
            <CardDescription>
              Test the connection to your AI Agent endpoint
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleTestConnection}
              disabled={testConnection.isFetching}
              className="w-full"
            >
              {testConnection.isFetching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing Connection...
                </>
              ) : (
                "Test AI Agent Connection"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Content Generation Form */}
        <Card>
          <CardHeader>
            <CardTitle>Content Generation Test</CardTitle>
            <CardDescription>
              Test AI content generation with custom parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter article title"
              />
            </div>

            <div>
              <Label htmlFor="prompt">Prompt</Label>
              <Textarea
                id="prompt"
                value={formData.prompt}
                onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                placeholder="Describe what you want the AI to write about"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="tone">Tone</Label>
                <Select
                  value={formData.tone}
                  onValueChange={(value: any) => setFormData({ ...formData, tone: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="neutral">Neutral</SelectItem>
                    <SelectItem value="optimistic">Optimistic</SelectItem>
                    <SelectItem value="analytical">Analytical</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="conversational">Conversational</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="style">Style</Label>
                <Select
                  value={formData.style}
                  onValueChange={(value: any) => setFormData({ ...formData, style: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="journalistic">Journalistic</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="blog">Blog</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="length">Length</Label>
                <Select
                  value={formData.length}
                  onValueChange={(value: any) => setFormData({ ...formData, length: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="long">Long</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="sources">Sources (Optional)</Label>
              <Input
                id="sources"
                value={formData.sources[0]}
                onChange={(e) => setFormData({ ...formData, sources: [e.target.value] })}
                placeholder="Enter source URLs (optional)"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleGenerateContent}
                disabled={generateContent.isPending}
                className="flex-1"
              >
                {generateContent.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Content Only"
                )}
              </Button>

              <Button
                onClick={handleCreatePost}
                disabled={createAIPost.isPending}
                variant="outline"
                className="flex-1"
              >
                {createAIPost.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Post...
                  </>
                ) : (
                  "Generate & Create Post"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {testResult && (
          <Alert>
            <AlertDescription>{testResult}</AlertDescription>
          </Alert>
        )}

        {/* Generated Content Preview */}
        {generatedContent && (
          <Card>
            <CardHeader>
              <CardTitle>Generated Content</CardTitle>
              <CardDescription>
                AI-generated content blocks ready for publishing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {generatedContent.reviewRequired && (
                <Alert>
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    This content requires human review before publishing.
                  </AlertDescription>
                </Alert>
              )}

              <div>
                <Label>Raw Draft</Label>
                <Textarea
                  value={generatedContent.draft || "No draft generated"}
                  readOnly
                  rows={4}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Content Blocks (JSON)</Label>
                <Textarea
                  value={JSON.stringify(generatedContent.contentBlocks, null, 2)}
                  readOnly
                  rows={8}
                  className="mt-1 font-mono text-sm"
                />
              </div>

              {generatedContent.contentBlocks && (
                <div>
                  <Label>Rendered Preview</Label>
                  <div className="mt-2 p-4 border rounded-lg bg-gray-50">
                    {generatedContent.contentBlocks.map((block: any, index: number) => (
                      <div key={index} className="mb-4">
                        {block.type === 'heading' && (
                          <h3 className="text-xl font-bold">{block.content}</h3>
                        )}
                        {block.type === 'paragraph' && (
                          <p className="text-gray-700 leading-relaxed">{block.content}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
