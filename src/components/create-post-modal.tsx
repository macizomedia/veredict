import { useState } from 'react';
import { X, CheckCircle, AlertCircle, Clock, Shield, FileText, ExternalLink } from 'lucide-react';
import type { LabelType } from '@prisma/client';
import { api } from "@/trpc/react";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (postData: PostCreationData) => void;
}

interface PostCreationData {
  topic: string;
  tone: string;
  style: string;
  minRead: number;
  location?: {
    city: string;
    state: string;
    country: string;
  };
}

interface ResearchResult {
  title: string;
  url: string;
  snippet: string;
  credibility: LabelType;
  source: string;
}

interface ContentBlock {
  id: string;
  type: 'paragraph' | 'heading' | 'quote' | 'list';
  content: string;
  sources?: string[];
  credibilityScore?: number;
}

const steps = [
  { id: 1, name: 'Topic', icon: FileText },
  { id: 2, name: 'Research', icon: Shield },
  { id: 3, name: 'Generate', icon: Clock },
  { id: 4, name: 'Review', icon: CheckCircle },
  { id: 5, name: 'Publish', icon: ExternalLink },
];

const credibilityColors = {
  FAKE: 'text-red-600 bg-red-50 dark:bg-red-950/20',
  NOT_CHECKED: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20',
  IN_DEVELOPMENT: 'text-blue-600 bg-blue-50 dark:bg-blue-950/20',
  OFFICIAL_PRESS_RELEASE: 'text-green-600 bg-green-50 dark:bg-green-950/20',
  ACCURATE: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20',
  INACCURATE: 'text-orange-600 bg-orange-50 dark:bg-orange-950/20',
};

const credibilityLabels = {
  FAKE: 'Fake',
  NOT_CHECKED: 'Not Checked',
  IN_DEVELOPMENT: 'In Development',
  OFFICIAL_PRESS_RELEASE: 'Official Press Release',
  ACCURATE: 'Accurate',
  INACCURATE: 'Inaccurate',
};

export function CreatePostModal({ isOpen, onClose, onSubmit }: CreatePostModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  
  // Form data
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('neutral');
  const [style, setStyle] = useState('journalistic');
  const [minRead, setMinRead] = useState(3);
  const [location, setLocation] = useState({ city: '', state: '', country: '' });
  
  // Generated data
  const [researchResults, setResearchResults] = useState<ResearchResult[]>([]);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [generatedTitle, setGeneratedTitle] = useState('');

  // tRPC mutations
  const researchMutation = api.content.research.useMutation();
  const generateMutation = api.content.generateContent.useMutation();
  const createPostMutation = api.content.create.useMutation();

  if (!isOpen) return null;

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleResearch = async () => {
    try {
      const result = await researchMutation.mutateAsync({ 
        topic, 
        location: location.city ? location : undefined 
      });
      setResearchResults(result.sources);
      nextStep();
    } catch (error) {
      console.error('Research failed:', error);
    }
  };

  const handleGenerate = async () => {
    try {
      const result = await generateMutation.mutateAsync({
        topic,
        tone,
        style,
        minRead,
        sources: researchResults,
        location: location.city ? location : undefined,
      });
      
      setGeneratedTitle(result.title);
      setContentBlocks(result.blocks);
      nextStep();
    } catch (error) {
      console.error('Generation failed:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      await createPostMutation.mutateAsync({
        topic,
        tone,
        style,
        minRead,
        location: location.city ? location : undefined,
        title: generatedTitle,
        contentBlocks,
        sources: researchResults,
      });
      onSubmit({
        topic,
        tone,
        style,
        minRead,
        location: location.city ? location : undefined,
      });
      onClose();
    } catch (error) {
      console.error('Post creation failed:', error);
    }
  };

  const CredibilityBadge = ({ type, source }: { type: LabelType; source: string }) => (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${credibilityColors[type]}`}>
      <span>{credibilityLabels[type]}</span>
      <span className="opacity-70">• {source}</span>
    </div>
  );

  const StepIndicator = () => (
    <div className="flex justify-between items-center mb-8">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;
        
        return (
          <div key={step.id} className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-lg border-2 font-component font-medium
                ${isActive 
                  ? 'border-primary bg-primary text-primary-foreground' 
                  : isCompleted 
                    ? 'border-green-500 bg-green-500 text-white' 
                    : 'border-muted bg-background text-muted-foreground'
                }`}
            >
              {isCompleted ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <Icon className="w-5 h-5" />
              )}
            </div>
            <span className={`ml-2 text-sm font-component font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
              {step.name}
            </span>
            {index < steps.length - 1 && (
              <div className={`mx-4 h-px w-8 ${isCompleted ? 'bg-green-500' : 'bg-border'}`} />
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-dark-sand text-dark-sand-foreground">
          <h2 className="text-2xl font-component font-bold">Create New Post</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-background/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <StepIndicator />

          {/* Step 1: Topic Configuration */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-ui font-medium mb-2">
                  Article Topic
                </label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Describe what you want to write about..."
                  className="w-full p-3 border border-input rounded-lg bg-background text-foreground font-ui resize-none"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-ui font-medium mb-2">Tone</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full p-3 border border-input rounded-lg bg-background text-foreground font-ui"
                  >
                    <option value="neutral">Neutral</option>
                    <option value="formal">Formal</option>
                    <option value="conversational">Conversational</option>
                    <option value="investigative">Investigative</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-ui font-medium mb-2">Style</label>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="w-full p-3 border border-input rounded-lg bg-background text-foreground font-ui"
                  >
                    <option value="journalistic">Journalistic</option>
                    <option value="analytical">Analytical</option>
                    <option value="opinion">Opinion</option>
                    <option value="feature">Feature Story</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-ui font-medium mb-2">Min Read (minutes)</label>
                  <input
                    type="number"
                    value={minRead}
                    onChange={(e) => setMinRead(parseInt(e.target.value) || 3)}
                    min="1"
                    max="30"
                    className="w-full p-3 border border-input rounded-lg bg-background text-foreground font-ui"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-ui font-medium mb-2">
                  Location (Optional)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="City"
                    value={location.city}
                    onChange={(e) => setLocation({ ...location, city: e.target.value })}
                    className="p-3 border border-input rounded-lg bg-background text-foreground font-ui"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={location.state}
                    onChange={(e) => setLocation({ ...location, state: e.target.value })}
                    className="p-3 border border-input rounded-lg bg-background text-foreground font-ui"
                  />
                  <input
                    type="text"
                    placeholder="Country"
                    value={location.country}
                    onChange={(e) => setLocation({ ...location, country: e.target.value })}
                    className="p-3 border border-input rounded-lg bg-background text-foreground font-ui"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Research */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-component font-semibold mb-2">Research Phase</h3>
                <p className="text-muted-foreground font-ui mb-6">
                  We'll gather credible sources and verify information about your topic.
                </p>
                
                {researchResults.length === 0 ? (
                  <button
                    onClick={handleResearch}
                    disabled={researchMutation.isPending || !topic.trim()}
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-ui font-medium hover:opacity-90 disabled:opacity-50"
                  >
                    {researchMutation.isPending ? 'Researching...' : 'Start Research'}
                  </button>
                ) : (
                  <div className="space-y-4">
                    <h4 className="font-component font-medium">Found {researchResults.length} Sources</h4>
                    {researchResults.map((result, index) => (
                      <div key={index} className="border border-border rounded-lg p-4 text-left">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-ui font-medium text-sm">{result.title}</h5>
                          <CredibilityBadge type={result.credibility} source={result.source} />
                        </div>
                        <p className="text-muted-foreground text-sm mb-2 font-ui">{result.snippet}</p>
                        <a 
                          href={result.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary text-sm font-ui hover:underline inline-flex items-center gap-1"
                        >
                          View Source <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Generation */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-component font-semibold mb-2">Content Generation</h3>
                <p className="text-muted-foreground font-ui mb-6">
                  Creating your article based on the research and your preferences.
                </p>
                
                {contentBlocks.length === 0 ? (
                  <button
                    onClick={handleGenerate}
                    disabled={generateMutation.isPending || researchResults.length === 0}
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-ui font-medium hover:opacity-90 disabled:opacity-50"
                  >
                    {generateMutation.isPending ? 'Generating Content...' : 'Generate Article'}
                  </button>
                ) : (
                  <div className="text-left space-y-4">
                    <h4 className="font-component font-medium text-center">Generated Content</h4>
                    {generatedTitle && (
                      <h1 className="text-2xl font-article font-bold text-center mb-6">
                        {generatedTitle}
                      </h1>
                    )}
                    {contentBlocks.map((block, index) => (
                      <div key={block.id} className="border border-border rounded-lg p-4">
                        <div className="font-article text-base leading-relaxed">
                          {block.type === 'heading' ? (
                            <h3 className="text-xl font-bold mb-2">{block.content}</h3>
                          ) : block.type === 'quote' ? (
                            <blockquote className="border-l-4 border-primary pl-4 italic">
                              {block.content}
                            </blockquote>
                          ) : (
                            <p>{block.content}</p>
                          )}
                        </div>
                        {block.sources && block.sources.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-border">
                            <p className="text-xs font-ui text-muted-foreground">
                              Sources: {block.sources.join(', ')}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-component font-semibold text-center mb-6">Review & Edit</h3>
              <div className="space-y-4">
                {generatedTitle && (
                  <div>
                    <label className="block text-sm font-ui font-medium mb-2">Title</label>
                    <input
                      type="text"
                      value={generatedTitle}
                      onChange={(e) => setGeneratedTitle(e.target.value)}
                      className="w-full p-3 border border-input rounded-lg bg-background text-foreground font-article text-lg"
                    />
                  </div>
                )}
                
                <div className="space-y-4">
                  {contentBlocks.map((block, index) => (
                    <div key={block.id} className="border border-border rounded-lg p-4">
                      <textarea
                        value={block.content}
                        onChange={(e) => {
                          const updatedBlocks = [...contentBlocks];
                          updatedBlocks[index] = { ...block, content: e.target.value };
                          setContentBlocks(updatedBlocks);
                        }}
                        className="w-full p-3 border border-input rounded-lg bg-background text-foreground font-article resize-none"
                        rows={Math.max(3, Math.ceil(block.content.length / 80))}
                      />
                      {block.sources && (
                        <div className="mt-2 text-xs font-ui text-muted-foreground">
                          Sources: {block.sources.join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Publish */}
          {currentStep === 5 && (
            <div className="space-y-6 text-center">
              <div className="space-y-4">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                <h3 className="text-lg font-component font-semibold">Ready to Publish</h3>
                <p className="text-muted-foreground font-ui">
                  Your article has been created and is ready to be published.
                </p>
              </div>
              
              <div className="bg-muted rounded-lg p-4 text-left">
                <h4 className="font-ui font-medium mb-2">Article Summary</h4>
                <ul className="space-y-1 text-sm font-ui text-muted-foreground">
                  <li>Topic: {topic}</li>
                  <li>Style: {style}</li>
                  <li>Estimated read time: {minRead} minutes</li>
                  <li>Sources researched: {researchResults.length}</li>
                  <li>Content blocks: {contentBlocks.length}</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border bg-card">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-4 py-2 text-muted-foreground hover:text-foreground disabled:opacity-50 font-ui"
          >
            Previous
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-border rounded-lg hover:bg-muted font-ui"
            >
              Cancel
            </button>
            
            {currentStep < 5 ? (
              <button
                onClick={nextStep}
                disabled={
                  (currentStep === 1 && !topic.trim()) ||
                  (currentStep === 2 && researchResults.length === 0) ||
                  (currentStep === 3 && contentBlocks.length === 0) ||
                  researchMutation.isPending ||
                  generateMutation.isPending
                }
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 font-ui"
              >
                {researchMutation.isPending || generateMutation.isPending ? 'Loading...' : 'Next'}
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={createPostMutation.isPending}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-ui"
              >
                {createPostMutation.isPending ? 'Publishing...' : 'Publish Article'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
