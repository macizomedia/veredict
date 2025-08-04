"use client";

import { useState } from "react";
import { CreatePostModal } from "@/components/create-post-modal";
import { EnhancedPostView } from "@/components/enhanced-post-view";
import { CredibilityTooltip } from "@/components/credibility-tooltip";
import { RevisionHistory } from "@/components/revision-history";
import { Plus, Newspaper, PenTool, Shield, History, Eye } from "lucide-react";
import type { LabelType } from "@prisma/client";

// Mock data for demonstration
const mockPost = {
  id: 1,
  slug: "local-development-impact-comprehensive-analysis",
  status: "PUBLISHED" as const,
  categoryId: 1,
  currentRevisionId: 1,
  upVotes: 24,
  downVotes: 3,
  createdAt: new Date("2025-07-29T10:00:00Z"),
  updatedAt: new Date("2025-07-29T14:30:00Z"),
  currentRevision: {
    id: 1,
    title: "Local Development Impact - A Comprehensive Analysis",
    contentBlocks: [
      {
        id: "intro",
        type: "paragraph",
        content: "Recent developments surrounding local infrastructure projects have garnered significant attention from both local communities and broader stakeholders. In this comprehensive analysis, we examine the multifaceted aspects of urban development, drawing from credible sources and expert insights to provide a balanced perspective on this evolving situation.",
        sources: ["Local News Network", "Urban Planning Institute"],
        credibilityScore: 0.85
      },
      {
        id: "heading-1",
        type: "heading",
        content: "Current State of Affairs"
      },
      {
        id: "current-state",
        type: "paragraph",
        content: "The current landscape of urban development reflects a complex interplay of factors that have shaped its trajectory over recent months. According to official sources, key developments have included policy changes, community responses, and technological adaptations that collectively influence the broader narrative.",
        sources: ["Government Portal", "Planning Commission"],
        credibilityScore: 0.90
      }
    ],
    prompt: "Local development impact and community response",
    tone: "neutral",
    style: "journalistic",
    minRead: 5,
    location: { city: "San Francisco", state: "CA", country: "USA" },
    summaryOfChanges: null,
    version: 1,
    postId: 1,
    parentId: null,
    createdAt: new Date("2025-07-29T10:00:00Z"),
    updatedAt: new Date("2025-07-29T10:00:00Z"),
    author: { name: "Editorial Team", image: null }
  },
  revisions: [
    {
      id: 1,
      title: "Local Development Impact - A Comprehensive Analysis",
      contentBlocks: [],
      prompt: "Local development impact and community response",
      tone: "neutral",
      style: "journalistic",
      minRead: 5,
      location: null,
      summaryOfChanges: "Initial publication",
      version: 1,
      postId: 1,
      parentId: null,
      createdAt: new Date("2025-07-29T10:00:00Z"),
      updatedAt: new Date("2025-07-29T10:00:00Z"),
      author: { name: "Editorial Team", image: null }
    }
  ],
  labels: [
    {
      id: 1,
      postId: 1,
      label: "ACCURATE" as LabelType,
      version: 1,
      justification: "Information verified through multiple credible sources",
      sourceUrl: "https://example.com/verification",
      count: 3
    },
    {
      id: 2,
      postId: 1,
      label: "OFFICIAL_PRESS_RELEASE" as LabelType,
      version: 1,
      justification: "Contains official statements from government sources",
      sourceUrl: "https://gov-official.com/statement",
      count: 1
    }
  ],
  sources: [
    {
      id: 1,
      url: "https://local-news.com/development-story",
      postId: 1
    },
    {
      id: 2,
      url: "https://city-planning.gov/public-statement",
      postId: 1
    }
  ],
  authors: [
    {
      user: {
        id: "1",
        name: "Editorial Team",
        email: "editorial@veridict.com",
        emailVerified: null,
        image: null,
        role: "EDITOR" as const,
        reputation: 100
      }
    }
  ],
  analytics: {
    views: 1247,
    sourceClicks: 89
  }
};

export default function DemoPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeDemo, setActiveDemo] = useState<'create' | 'view' | 'components'>('create');

  const handleCreatePost = (postData: any) => {
    console.log('Creating post:', postData);
  };

  const demoComponents = [
    {
      id: 'credibility',
      title: 'Credibility Tooltips',
      description: 'Interactive tooltips showing source verification and credibility ratings',
      component: (
        <div className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            <CredibilityTooltip 
              type="ACCURATE" 
              source="Editorial Team"
              justification="Information verified through multiple credible sources"
              count={3}
            >
              <div className="px-3 py-2 bg-green-50 text-green-700 rounded-lg cursor-help border border-green-200">
                Accurate Content
              </div>
            </CredibilityTooltip>
            
            <CredibilityTooltip 
              type="NOT_CHECKED" 
              source="Community Reporter"
              justification="Content awaiting editorial review"
              count={1}
            >
              <div className="px-3 py-2 bg-yellow-50 text-yellow-700 rounded-lg cursor-help border border-yellow-200">
                Not Yet Verified
              </div>
            </CredibilityTooltip>
            
            <CredibilityTooltip 
              type="FAKE" 
              source="Fact Check Team"
              justification="Contains misleading claims contradicted by verified sources"
              count={5}
            >
              <div className="px-3 py-2 bg-red-50 text-red-700 rounded-lg cursor-help border border-red-200">
                Fake Content
              </div>
            </CredibilityTooltip>
          </div>
          <p className="text-sm text-muted-foreground font-ui">
            Hover over the badges above to see detailed credibility information
          </p>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-component font-bold text-foreground mb-4">
            Veridict - Enhanced Editorial Workflow Demo
          </h1>
          <p className="text-lg text-muted-foreground font-ui max-w-3xl mx-auto">
            Experience our comprehensive AI-powered content creation system with advanced credibility tracking, 
            revision history, and transparent sourcing for local journalism and community news.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-muted rounded-lg p-1">
            <button
              onClick={() => setActiveDemo('create')}
              className={`px-4 py-2 rounded-md font-ui font-medium transition-colors flex items-center gap-2 ${
                activeDemo === 'create' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <PenTool className="w-4 h-4" />
              Post Creation
            </button>
            <button
              onClick={() => setActiveDemo('view')}
              className={`px-4 py-2 rounded-md font-ui font-medium transition-colors flex items-center gap-2 ${
                activeDemo === 'view' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Eye className="w-4 h-4" />
              Enhanced Post View
            </button>
            <button
              onClick={() => setActiveDemo('components')}
              className={`px-4 py-2 rounded-md font-ui font-medium transition-colors flex items-center gap-2 ${
                activeDemo === 'components' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Shield className="w-4 h-4" />
              Components
            </button>
          </div>
        </div>

        {/* Content */}
        {activeDemo === 'create' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-component font-semibold mb-4">AI-Powered Post Creation</h2>
              <p className="text-muted-foreground font-ui mb-6 max-w-2xl mx-auto">
                Our 5-step modal workflow guides you through topic research, content generation, 
                and publication with built-in credibility checking and source verification.
              </p>
              
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-ui font-medium text-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Try Post Creation Workflow
              </button>
            </div>

            {/* Features showcase */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950/20 rounded-lg flex items-center justify-center mb-4">
                  <Newspaper className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-component font-semibold mb-2">Research Phase</h3>
                <p className="text-muted-foreground font-ui text-sm">
                  AI-powered source discovery and credibility assessment with real-time verification
                </p>
              </div>
              
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-950/20 rounded-lg flex items-center justify-center mb-4">
                  <PenTool className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-component font-semibold mb-2">Content Generation</h3>
                <p className="text-muted-foreground font-ui text-sm">
                  Intelligent article creation with proper sourcing and block-based editing
                </p>
              </div>
              
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-950/20 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-component font-semibold mb-2">Credibility Tracking</h3>
                <p className="text-muted-foreground font-ui text-sm">
                  Transparent sourcing with colored credibility indicators and detailed tooltips
                </p>
              </div>
            </div>
          </div>
        )}

        {activeDemo === 'view' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-component font-semibold mb-4">Enhanced Post Display</h2>
              <p className="text-muted-foreground font-ui mb-6 max-w-2xl mx-auto">
                Sophisticated article presentation with credibility indicators, revision history, 
                and transparent source attribution optimized for local journalism.
              </p>
            </div>
            
            <EnhancedPostView post={mockPost as any} />
          </div>
        )}

        {activeDemo === 'components' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-component font-semibold mb-4">UI Components Showcase</h2>
              <p className="text-muted-foreground font-ui mb-6 max-w-2xl mx-auto">
                Interactive components that make up our enhanced editorial workflow system.
              </p>
            </div>

            <div className="space-y-8">
              {demoComponents.map((demo) => (
                <div key={demo.id} className="bg-card border border-border rounded-lg p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-component font-semibold mb-2">{demo.title}</h3>
                    <p className="text-muted-foreground font-ui">{demo.description}</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4">
                    {demo.component}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create Post Modal */}
        <CreatePostModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreatePost}
        />
      </div>
    </div>
  );
}
