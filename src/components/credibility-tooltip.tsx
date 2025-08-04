import { useState } from 'react';
import { Info, ExternalLink, Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import type { LabelType } from '@prisma/client';

interface CredibilityTooltipProps {
  type: LabelType;
  source: string;
  sourceUrl?: string;
  justification?: string;
  count?: number;
  children: React.ReactNode;
}

const credibilityConfig = {
  FAKE: {
    icon: AlertTriangle,
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-950/20',
    borderColor: 'border-red-200 dark:border-red-800/30',
    label: 'Fake Content',
    description: 'This content has been identified as containing false or misleading information.',
    severity: 'high'
  },
  NOT_CHECKED: {
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
    borderColor: 'border-yellow-200 dark:border-yellow-800/30',
    label: 'Not Yet Verified',
    description: 'This content has not been fact-checked or verified by our editorial team.',
    severity: 'medium'
  },
  IN_DEVELOPMENT: {
    icon: Clock,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    borderColor: 'border-blue-200 dark:border-blue-800/30',
    label: 'In Development',
    description: 'This is a developing story. Information may change as more details become available.',
    severity: 'medium'
  },
  OFFICIAL_PRESS_RELEASE: {
    icon: Shield,
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950/20',
    borderColor: 'border-green-200 dark:border-green-800/30',
    label: 'Official Press Release',
    description: 'This content is sourced from official communications or press releases.',
    severity: 'low'
  },
  ACCURATE: {
    icon: CheckCircle,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
    borderColor: 'border-emerald-200 dark:border-emerald-800/30',
    label: 'Verified Accurate',
    description: 'This content has been fact-checked and verified as accurate by multiple sources.',
    severity: 'low'
  },
  INACCURATE: {
    icon: AlertTriangle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-950/20',
    borderColor: 'border-orange-200 dark:border-orange-800/30',
    label: 'Contains Inaccuracies',
    description: 'This content contains some inaccurate information or misleading claims.',
    severity: 'high'
  }
};

export function CredibilityTooltip({ 
  type, 
  source, 
  sourceUrl, 
  justification, 
  count = 0,
  children 
}: CredibilityTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const config = credibilityConfig[type];
  const Icon = config.icon;

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children}
      </div>

      {isVisible && (
        <div className="absolute z-50 w-80 p-4 bg-card border border-border rounded-lg shadow-lg bottom-full left-1/2 transform -translate-x-1/2 mb-2">
          {/* Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-border"></div>
          
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <div className={`p-1 rounded-md ${config.bgColor}`}>
              <Icon className={`w-4 h-4 ${config.color}`} />
            </div>
            <div className="flex-1">
              <h4 className="font-ui font-semibold text-sm">{config.label}</h4>
              <p className="text-xs text-muted-foreground font-ui">{source}</p>
            </div>
            {count > 0 && (
              <div className="text-xs text-muted-foreground font-ui">
                {count} verification{count !== 1 ? 's' : ''}
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-foreground font-ui mb-3">
            {config.description}
          </p>

          {/* Justification */}
          {justification && (
            <div className="mb-3">
              <h5 className="text-xs font-ui font-medium text-muted-foreground mb-1">
                Reasoning:
              </h5>
              <p className="text-sm text-foreground font-ui">
                {justification}
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div className="flex items-center gap-1 text-xs text-muted-foreground font-ui">
              <Info className="w-3 h-3" />
              <span>Credibility Assessment</span>
            </div>
            
            {sourceUrl && (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-primary hover:underline font-ui"
              >
                View Source
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* Severity indicator */}
          <div className="mt-2 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-ui">
                Risk Level:
              </span>
              <div className="flex items-center gap-1">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      config.severity === 'high' && i < 3
                        ? 'bg-red-400'
                        : config.severity === 'medium' && i < 2
                          ? 'bg-yellow-400'
                          : config.severity === 'low' && i < 1
                            ? 'bg-green-400'
                            : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
