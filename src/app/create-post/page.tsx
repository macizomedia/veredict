"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { 
  CheckCircle, 
  Edit3, 
  Eye, 
  Send, 
  Sparkles, 
  ArrowLeft, 
  ArrowRight,
  Clock,
  AlertTriangle,
  FileText,
  Loader2
} from "lucide-react";

type PostStep = 'generate' | 'edit' | 'review' | 'publish';

interface GeneratedPost {
  title: string;
  content: string;
  contentBlocks: Array<{
    type: string;
    content: string;
  }>;
  tone: string;
  style: string;
  reviewRequired: boolean;
}

export default function CreatePostPage() {
  const [currentStep, setCurrentStep] = useState<PostStep>('generate');
  const [generatedPost, setGeneratedPost] = useState<GeneratedPost | null>(null);
  const [editedContent, setEditedContent] = useState<string>('');
  const [publishStatus, setPublishStatus] = useState<'draft' | 'published'>('draft');
  
  const [formData, setFormData] = useState({
    title: "",
    prompt: "",
    tone: "professional" as const,
    style: "journalistic" as const,
    length: "medium" as const,
    sources: "",
  });

  // Generate content mutation
  const generateContent = api.ai.generateContent.useMutation({
    onSuccess: (result) => {
      if (result.success && result.data) {
        const post: GeneratedPost = {
          title: formData.title,
          content: result.data.content || '',
          contentBlocks: result.data.contentBlocks || [],
          tone: formData.tone,
          style: formData.style,
          reviewRequired: result.data.reviewRequired || false,
        };
        setGeneratedPost(post);
        setEditedContent(post.content);
        setCurrentStep('edit');
        toast.success("Content generated successfully! Ready for editing.");
      } else {
        toast.error("Failed to generate content. Please try again.");
      }
    },
    onError: (error) => {
      toast.error(`Generation failed: ${error.message}`);
    },
  });

  // Create post mutation (for final publishing)
  const createPost = api.ai.createPostWithAI.useMutation({
    onSuccess: () => {
      setCurrentStep('publish');
      setPublishStatus('published');
      toast.success("Post published successfully!");
    },
    onError: (error) => {
      toast.error(`Publishing failed: ${error.message}`);
    },
  });

  const handleGenerate = () => {
    generateContent.mutate({
      prompt: formData.prompt,
      tone: formData.tone,
      style: formData.style,
      length: formData.length,
      sources: formData.sources ? [formData.sources] : undefined,
    });
  };

  const handleEdit = () => {
    if (generatedPost) {
      setGeneratedPost({
        ...generatedPost,
        content: editedContent,
      });
    }
    setCurrentStep('review');
  };

  const handlePublish = () => {
    if (generatedPost) {
      createPost.mutate({
        title: generatedPost.title,
        prompt: formData.prompt,
        tone: formData.tone,
        style: formData.style,
        length: formData.length,
        sources: formData.sources ? [formData.sources] : undefined,
      });
    }
  };

  const steps = [
    { id: 'generate', label: 'Generate', icon: Sparkles, description: 'AI Content Generation' },
    { id: 'edit', label: 'Edit', icon: Edit3, description: 'Content Editing' },
    { id: 'review', label: 'Review', icon: Eye, description: 'Final Review' },
    { id: 'publish', label: 'Publish', icon: Send, description: 'Publish Post' },
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          <FileText className="h-8 w-8 text-blue-500" />
          Create New Post
        </h1>
        <p className="text-gray-600">
          AI-powered editorial workflow: Generate, Edit, Review, and Publish
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center flex-1">
              <div className="flex items-center w-full">
                <div className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all
                  ${index <= currentStepIndex 
                    ? 'bg-blue-500 border-blue-500 text-white' 
                    : 'bg-gray-100 border-gray-300 text-gray-400'
                  }
                `}>
                  <step.icon className="h-5 w-5" />
                </div>
                {index < steps.length - 1 && (
                  <div className={`
                    flex-1 h-0.5 mx-2 transition-all
                    ${index < currentStepIndex ? 'bg-blue-500' : 'bg-gray-300'}
                  `} />
                )}
              </div>
              <div className="mt-2 text-center">
                <div className={`text-sm font-medium ${
                  index <= currentStepIndex ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {step.label}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {step.description}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Progress Bar */}
        <div className="w-full">
          <Progress 
            value={(currentStepIndex + 1) / steps.length * 100} 
            className="h-2"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Step {currentStepIndex + 1} of {steps.length}</span>
            <span>{Math.round((currentStepIndex + 1) / steps.length * 100)}% Complete</span>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="space-y-6">
        {/* Step 1: Generate */}
        {currentStep === 'generate' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-500" />
                AI Content Generation
              </CardTitle>
              <CardDescription>
                Configure your content parameters and generate an AI-powered article
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Article Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter your article title..."
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="prompt">Content Prompt</Label>
                    <Textarea
                      id="prompt"
                      placeholder="Describe what you want the AI to write about..."
                      rows={4}
                      value={formData.prompt}
                      onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="sources">Sources (Optional)</Label>
                    <Input
                      id="sources"
                      placeholder="Enter source URLs..."
                      value={formData.sources}
                      onChange={(e) => setFormData({ ...formData, sources: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="tone">Tone</Label>
                    <Select value={formData.tone} onValueChange={(value: any) => setFormData({ ...formData, tone: value })}>
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
                    <Label htmlFor="style">Writing Style</Label>
                    <Select value={formData.style} onValueChange={(value: any) => setFormData({ ...formData, style: value })}>
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
                    <Label htmlFor="length">Article Length</Label>
                    <Select value={formData.length} onValueChange={(value: any) => setFormData({ ...formData, length: value })}>
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
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button 
                  onClick={handleGenerate}
                  disabled={!formData.title || !formData.prompt || generateContent.isPending}
                  size="lg"
                >
                  {generateContent.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Content...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Content
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Edit */}
        {currentStep === 'edit' && generatedPost && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit3 className="h-5 w-5 text-green-500" />
                  Content Editor
                </CardTitle>
                <CardDescription>
                  Edit and refine the AI-generated content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-title">Title</Label>
                    <Input
                      id="edit-title"
                      value={generatedPost.title}
                      onChange={(e) => setGeneratedPost({ ...generatedPost, title: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-content">Content</Label>
                    <Textarea
                      id="edit-content"
                      rows={20}
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="font-mono text-sm"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Badge variant="secondary">{generatedPost.tone}</Badge>
                    <Badge variant="secondary">{generatedPost.style}</Badge>
                    {generatedPost.reviewRequired && (
                      <Badge variant="destructive">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Review Required
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-blue-500" />
                  Live Preview
                </CardTitle>
                <CardDescription>
                  See how your content will look when published
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <h1 className="text-2xl font-bold mb-4">{generatedPost.title}</h1>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {editedContent.split('\n').map((line, index) => {
                      if (line.startsWith('# ')) {
                        return <h1 key={index} className="text-2xl font-bold mt-6 mb-3">{line.slice(2)}</h1>;
                      } else if (line.startsWith('## ')) {
                        return <h2 key={index} className="text-xl font-bold mt-5 mb-2">{line.slice(3)}</h2>;
                      } else if (line.startsWith('### ')) {
                        return <h3 key={index} className="text-lg font-bold mt-4 mb-2">{line.slice(4)}</h3>;
                      } else if (line.startsWith('- **') && line.includes('**:')) {
                        const match = line.match(/- \*\*(.*?)\*\*: (.*)/);
                        if (match) {
                          return (
                            <div key={index} className="mb-2">
                              <strong>{match[1]}</strong>: {match[2]}
                            </div>
                          );
                        }
                      } else if (line.startsWith('---')) {
                        return <hr key={index} className="my-4 border-gray-300" />;
                      } else if (line.trim() === '') {
                        return <br key={index} />;
                      }
                      return <div key={index} className="mb-2">{line}</div>;
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Review */}
        {currentStep === 'review' && generatedPost && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-amber-500" />
                Final Review
              </CardTitle>
              <CardDescription>
                Review your content before publishing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="font-semibold text-gray-600">Word Count</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {editedContent.split(' ').length}
                  </div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="font-semibold text-gray-600">Tone</div>
                  <div className="text-2xl font-bold text-green-600 capitalize">
                    {generatedPost.tone}
                  </div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="font-semibold text-gray-600">Style</div>
                  <div className="text-2xl font-bold text-purple-600 capitalize">
                    {generatedPost.style}
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">Content Preview</h3>
                <div className="border rounded-lg p-6 bg-white">
                  <h1 className="text-3xl font-bold mb-6">{generatedPost.title}</h1>
                  <div className="prose max-w-none">
                    {editedContent.split('\n').map((line, index) => {
                      if (line.startsWith('# ')) {
                        return <h1 key={index} className="text-2xl font-bold mt-6 mb-3">{line.slice(2)}</h1>;
                      } else if (line.startsWith('## ')) {
                        return <h2 key={index} className="text-xl font-bold mt-5 mb-2">{line.slice(3)}</h2>;
                      } else if (line.startsWith('### ')) {
                        return <h3 key={index} className="text-lg font-bold mt-4 mb-2">{line.slice(4)}</h3>;
                      } else if (line.startsWith('- **') && line.includes('**:')) {
                        const match = line.match(/- \*\*(.*?)\*\*: (.*)/);
                        if (match) {
                          return (
                            <div key={index} className="mb-2">
                              <strong>{match[1]}</strong>: {match[2]}
                            </div>
                          );
                        }
                      } else if (line.startsWith('---')) {
                        return <hr key={index} className="my-4 border-gray-300" />;
                      } else if (line.trim() === '') {
                        return <br key={index} />;
                      }
                      return <div key={index} className="mb-2">{line}</div>;
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Publish */}
        {currentStep === 'publish' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-green-500" />
                Publish Post
              </CardTitle>
              <CardDescription>
                Your post has been successfully created!
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <div className="flex flex-col items-center space-y-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
                <h3 className="text-xl font-semibold">Post Published Successfully!</h3>
                <p className="text-gray-600 max-w-md">
                  Your AI-generated post has been created and is ready to be viewed by your audience.
                </p>
                <div className="flex gap-4 mt-6">
                  <Button variant="outline" onClick={() => {
                    setCurrentStep('generate');
                    setGeneratedPost(null);
                    setEditedContent('');
                    setFormData({
                      title: "",
                      prompt: "",
                      tone: "professional",
                      style: "journalistic",
                      length: "medium",
                      sources: "",
                    });
                  }}>
                    Create Another Post
                  </Button>
                  <Button onClick={() => window.location.href = '/'}>
                    View All Posts
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        {currentStep !== 'generate' && currentStep !== 'publish' && (
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                const prevIndex = Math.max(0, currentStepIndex - 1);
                setCurrentStep(steps[prevIndex]!.id as PostStep);
              }}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <Button
              onClick={() => {
                if (currentStep === 'edit') {
                  handleEdit();
                } else if (currentStep === 'review') {
                  handlePublish();
                }
              }}
              disabled={createPost.isPending}
            >
              {createPost.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  {currentStep === 'review' ? 'Publish Post' : 'Continue'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
      <Toaster />
    </div>
  );
}
