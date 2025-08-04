import { useState } from 'react';
import { 
  Eye, Edit3, History, Share2, ThumbsUp, ThumbsDown, 
  MoreHorizontal, Calendar, User, MapPin, Clock,
  ExternalLink, Shield, AlertTriangle, X
} from 'lucide-react';
import type { Post, Revision, PostLabel, Source, User as UserType } from '@prisma/client';
import { CredibilityTooltip } from './credibility-tooltip';
import { RevisionHistory } from './revision-history';

interface PostWithDetails extends Post {
  currentRevision: Revision & {
    author?: { name: string; image?: string };
  };
  revisions: (Revision & {
    author?: { name: string; image?: string };
  })[];
  labels: PostLabel[];
  sources: Source[];
  authors: Array<{
    user: UserType;
  }>;
  analytics?: {
    views: number;
    sourceClicks: number;
  };
}

interface EnhancedPostViewProps {
  post: PostWithDetails;
}

interface ContentBlock {
  id: string;
  type: 'paragraph' | 'heading' | 'quote' | 'list';
  content: string;
  sources?: string[];
  credibilityScore?: number;
}

export function EnhancedPostView({ post }: EnhancedPostViewProps) {
  const [showRevisionHistory, setShowRevisionHistory] = useState(false);
  const [selectedRevision, setSelectedRevision] = useState<number | null>(null);
  
  const currentRevision = selectedRevision 
    ? post.revisions.find(r => r.id === selectedRevision) ?? post.currentRevision
    : post.currentRevision;

  const contentBlocks = (currentRevision.contentBlocks as unknown as ContentBlock[]) || [];
  const location = currentRevision.location as { city?: string; state?: string; country?: string } | null;

  // Calculate overall credibility score
  const credibilityLabels = post.labels.filter(label => 
    ['ACCURATE', 'OFFICIAL_PRESS_RELEASE'].includes(label.label)
  );
  const totalLabels = post.labels.length;
  const credibilityScore = totalLabels > 0 ? (credibilityLabels.length / totalLabels) * 100 : 0;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const handleRevisionSelect = (revisionId: number) => {
    setSelectedRevision(revisionId);
    setShowRevisionHistory(false);
  };

  return (
    <article className="max-w-4xl mx-auto bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <header className="p-6 border-b border-border">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-article font-bold text-foreground mb-2 leading-tight">
              {currentRevision.title}
            </h1>
            
            {/* Metadata row */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground font-ui mb-4">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{post.authors[0]?.user.name || 'Anonymous'}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(currentRevision.createdAt)}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{currentRevision.minRead} min read</span>
              </div>
              
              {location?.city && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{location.city}, {location.state || location.country}</span>
                </div>
              )}

              {post.analytics && (
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{post.analytics.views} views</span>
                </div>
              )}
            </div>

            {/* Credibility indicators */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-sm font-ui font-medium">
                  Credibility Score: {Math.round(credibilityScore)}%
                </span>
              </div>
              
              <div className="flex gap-2">
                {post.labels.slice(0, 3).map((label, index) => (
                  <CredibilityTooltip
                    key={index}
                    type={label.label}
                    source="Editorial Team"
                    sourceUrl={label.sourceUrl || undefined}
                    justification={label.justification}
                    count={label.count}
                  >
                    <div className={`px-2 py-1 rounded-md text-xs font-medium cursor-help ${
                      label.label === 'ACCURATE' 
                        ? 'text-green-600 bg-green-50 dark:bg-green-950/20'
                        : label.label === 'OFFICIAL_PRESS_RELEASE'
                          ? 'text-blue-600 bg-blue-50 dark:bg-blue-950/20'
                          : label.label === 'FAKE' || label.label === 'INACCURATE'
                            ? 'text-red-600 bg-red-50 dark:bg-red-950/20'
                            : 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20'
                    }`}>
                      {label.label.replace(/_/g, ' ')}
                    </div>
                  </CredibilityTooltip>
                ))}
                
                {post.labels.length > 3 && (
                  <div className="px-2 py-1 bg-muted rounded-md text-xs font-medium font-ui">
                    +{post.labels.length - 3} more
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() => setShowRevisionHistory(!showRevisionHistory)}
              className={`p-2 rounded-lg border transition-colors font-ui ${
                showRevisionHistory 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'hover:bg-muted border-border'
              }`}
              title="View revision history"
            >
              <History className="w-4 h-4" />
            </button>
            
            <button className="p-2 hover:bg-muted rounded-lg border border-border transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
            
            <button className="p-2 hover:bg-muted rounded-lg border border-border transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Revision indicator */}
        {selectedRevision && (
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-ui font-medium text-blue-900 dark:text-blue-100">
                  Viewing revision v{currentRevision.version}
                </span>
                <span className="text-xs text-blue-700 dark:text-blue-300 font-ui">
                  from {formatDate(currentRevision.createdAt)}
                </span>
              </div>
              <button
                onClick={() => setSelectedRevision(null)}
                className="text-xs text-blue-600 hover:underline font-ui"
              >
                View Current
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Content */}
      <div className="p-6">
        <div className="prose prose-lg max-w-none font-article">
          {contentBlocks.map((block, index) => (
            <div key={block.id} className="mb-6">
              {block.type === 'heading' ? (
                <h2 className="text-2xl font-bold mb-4 text-foreground font-article">
                  {block.content}
                </h2>
              ) : block.type === 'quote' ? (
                <blockquote className="border-l-4 border-primary pl-6 py-2 italic text-lg text-muted-foreground bg-muted/30 rounded-r-lg">
                  {block.content}
                </blockquote>
              ) : (
                <p className="text-foreground leading-relaxed mb-4">
                  {block.content}
                </p>
              )}
              
              {/* Source citations */}
              {block.sources && block.sources.length > 0 && (
                <div className="mt-3 p-3 bg-muted/50 rounded-lg border-l-4 border-green-500">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-ui font-medium text-green-700 dark:text-green-300">
                      Sources
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground font-ui">
                    {block.sources.join(', ')}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Sources section */}
        {post.sources.length > 0 && (
          <div className="mt-8 pt-6 border-t border-border">
            <h3 className="text-lg font-component font-semibold mb-4 flex items-center gap-2">
              <ExternalLink className="w-5 h-5" />
              Sources & References
            </h3>
            <div className="grid gap-3">
              {post.sources.map((source, index) => (
                <div key={source.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className="text-sm font-mono text-muted-foreground">
                    [{index + 1}]
                  </div>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-sm font-ui text-primary hover:underline truncate"
                  >
                    {source.url}
                  </a>
                  <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <footer className="px-6 py-4 border-t border-border bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-3 py-2 hover:bg-muted rounded-lg transition-colors font-ui">
              <ThumbsUp className="w-4 h-4" />
              <span className="text-sm">{post.upVotes}</span>
            </button>
            
            <button className="flex items-center gap-2 px-3 py-2 hover:bg-muted rounded-lg transition-colors font-ui">
              <ThumbsDown className="w-4 h-4" />
              <span className="text-sm">{post.downVotes}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground font-ui">
            <span>Post ID: {post.id}</span>
            <span>•</span>
            <span>v{currentRevision.version}</span>
            <span>•</span>
            <span>{post.revisions.length} revision{post.revisions.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </footer>

      {/* Revision History Modal */}
      {showRevisionHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-3xl max-h-[80vh] bg-card rounded-xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="text-xl font-component font-bold">Revision History</h2>
              <button
                onClick={() => setShowRevisionHistory(false)}
                className="p-2 hover:bg-muted rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 max-h-96 overflow-y-auto">
              <RevisionHistory
                revisions={post.revisions}
                currentRevisionId={post.currentRevisionId || post.revisions[0]?.id || 0}
                onRevisionSelect={handleRevisionSelect}
              />
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
