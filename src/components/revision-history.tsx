import { useState } from 'react';
import { Clock, User, GitBranch, Eye, Edit3, ChevronDown, ChevronRight } from 'lucide-react';
import type { Revision } from '@prisma/client';

interface RevisionHistoryProps {
  revisions: (Revision & {
    author?: { name: string; image?: string };
  })[];
  currentRevisionId: number;
  onRevisionSelect?: (revisionId: number) => void;
  onCompareRevisions?: (revisionA: number, revisionB: number) => void;
}

interface RevisionWithAuthor extends Revision {
  author?: { name: string; image?: string };
}

export function RevisionHistory({ 
  revisions, 
  currentRevisionId, 
  onRevisionSelect,
  onCompareRevisions 
}: RevisionHistoryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState<number[]>([]);
  const [showDiff, setShowDiff] = useState(false);

  const handleComparisonSelect = (revisionId: number) => {
    if (selectedForComparison.includes(revisionId)) {
      setSelectedForComparison(selectedForComparison.filter(id => id !== revisionId));
    } else if (selectedForComparison.length < 2) {
      setSelectedForComparison([...selectedForComparison, revisionId]);
    } else {
      const secondItem = selectedForComparison[1];
      if (secondItem !== undefined) {
        setSelectedForComparison([secondItem, revisionId]);
      }
    }
  };

  const handleCompare = () => {
    if (selectedForComparison.length === 2 && onCompareRevisions) {
      const [first, second] = selectedForComparison;
      if (first !== undefined && second !== undefined) {
        onCompareRevisions(first, second);
        setShowDiff(true);
      }
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const getRevisionBranch = (revision: RevisionWithAuthor) => {
    if (revision.id === currentRevisionId) return 'main';
    if (revision.parentId) return 'feature';
    return 'draft';
  };

  const getBranchColor = (branch: string) => {
    switch (branch) {
      case 'main': return 'text-green-600 bg-green-50 dark:bg-green-950/20';
      case 'feature': return 'text-blue-600 bg-blue-50 dark:bg-blue-950/20';
      case 'draft': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-950/20';
    }
  };

  const sortedRevisions = [...revisions].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const visibleRevisions = isExpanded ? sortedRevisions : sortedRevisions.slice(0, 5);

  return (
    <div className="border border-border rounded-lg bg-card">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-component font-semibold">Revision History</h3>
            <span className="text-sm text-muted-foreground font-ui">
              ({revisions.length} revision{revisions.length !== 1 ? 's' : ''})
            </span>
          </div>
          
          {selectedForComparison.length === 2 && (
            <button
              onClick={handleCompare}
              className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm font-ui hover:opacity-90"
            >
              Compare Selected
            </button>
          )}
        </div>
        
        {selectedForComparison.length > 0 && (
          <div className="mt-2 text-xs text-muted-foreground font-ui">
            {selectedForComparison.length === 1 
              ? 'Select another revision to compare' 
              : `Comparing revisions ${selectedForComparison.join(' and ')}`
            }
          </div>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {visibleRevisions.map((revision, index) => {
          const branch = getRevisionBranch(revision);
          const isSelected = selectedForComparison.includes(revision.id);
          const isCurrent = revision.id === currentRevisionId;
          
          return (
            <div
              key={revision.id}
              className={`p-4 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors
                ${isSelected ? 'bg-primary/5 border-primary/20' : ''}
                ${isCurrent ? 'bg-green-50 dark:bg-green-950/10' : ''}
              `}
            >
              <div className="flex items-start gap-3">
                {/* Git-like commit indicator */}
                <div className="flex flex-col items-center mt-1">
                  <div className={`w-3 h-3 rounded-full border-2 ${
                    isCurrent 
                      ? 'bg-green-500 border-green-500' 
                      : isSelected 
                        ? 'bg-primary border-primary' 
                        : 'bg-background border-muted-foreground'
                  }`} />
                  {index < visibleRevisions.length - 1 && (
                    <div className="w-px h-8 bg-border mt-1" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`px-2 py-1 rounded-md text-xs font-medium ${getBranchColor(branch)}`}>
                      {branch}
                    </div>
                    <span className="text-xs text-muted-foreground font-ui">
                      v{revision.version}
                    </span>
                    {isCurrent && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-950/20 dark:text-green-300 rounded-md text-xs font-medium">
                        Current
                      </span>
                    )}
                  </div>

                  <h4 className="font-ui font-medium text-sm mb-1">
                    {revision.title}
                  </h4>
                  
                  {revision.summaryOfChanges && (
                    <p className="text-sm text-muted-foreground font-ui mb-2 line-clamp-2">
                      {revision.summaryOfChanges}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-muted-foreground font-ui">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{revision.author?.name || 'System'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimeAgo(new Date(revision.createdAt))}</span>
                    </div>
                    <div className="text-muted-foreground">
                      {revision.minRead} min read
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => onRevisionSelect?.(revision.id)}
                      className="flex items-center gap-1 px-2 py-1 hover:bg-muted rounded-md text-xs font-ui"
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </button>
                    
                    <button
                      onClick={() => handleComparisonSelect(revision.id)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-ui transition-colors
                        ${isSelected 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-muted'
                        }`}
                    >
                      <Edit3 className="w-3 h-3" />
                      {isSelected ? 'Selected' : 'Compare'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {revisions.length > 5 && (
        <div className="p-3 border-t border-border">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-ui w-full justify-center"
          >
            {isExpanded ? (
              <>
                <ChevronDown className="w-4 h-4" />
                Show Less
              </>
            ) : (
              <>
                <ChevronRight className="w-4 h-4" />
                Show {revisions.length - 5} More Revisions
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
