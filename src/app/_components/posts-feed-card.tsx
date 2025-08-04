"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { VoteButtons } from "./vote-buttons";
import { ContentBlocksPreview } from "./content-blocks";
import { MessageCircle, Eye, Sparkles, Calendar, User } from "lucide-react";

type FontSize = 'xs' | 'sm' | 'base' | 'lg';
type ViewMode = 'full' | 'compact';

interface PostsFeedCardProps {
  post: any; // You might want to create a proper Post type
  size: FontSize;
  viewMode: ViewMode;
}

// Font size mapping for different text elements
const titleClassMap: Record<FontSize, string> = {
  xs: 'text-lg',
  sm: 'text-xl', 
  base: 'text-2xl',
  lg: 'text-3xl'
};

const subtitleClassMap: Record<FontSize, string> = {
  xs: 'text-sm',
  sm: 'text-base',
  base: 'text-lg',
  lg: 'text-xl'
};

const bodyClassMap: Record<FontSize, string> = {
  xs: 'text-sm',
  sm: 'text-base',
  base: 'text-base',
  lg: 'text-lg'
};

const metadataClassMap: Record<FontSize, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-sm',
  lg: 'text-base'
};

const badgeClassMap: Record<FontSize, string> = {
  xs: 'text-xs',
  sm: 'text-xs',
  base: 'text-xs',
  lg: 'text-sm'
};

export function PostsFeedCard({ post, size, viewMode }: PostsFeedCardProps) {
  if (viewMode === 'compact') {
    return (
      <Link href={`/posts/${post.id}`}>
        <div className="p-4 border-subtle rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors cursor-pointer group">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              {/* Post Title */}
              <h3 className={`font-semibold text-foreground group-hover:text-blue-600 transition-colors truncate ${titleClassMap[size]}`}>
                {post.title}
              </h3>
              
              {/* Essential Metadata */}
              <div className={`flex items-center gap-4 mt-2 ${metadataClassMap[size]} text-muted-foreground`}>
                {post.authors?.[0] && (
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {post.authors[0].user.name}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(post.createdAt).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
                {post.category && (
                  <Badge variant="outline" className={badgeClassMap[size]}>
                    {post.category.name}
                  </Badge>
                )}
                {post.contentBlocks && post.contentBlocks.blocks && (
                  <Badge variant="secondary" className={`bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 ${badgeClassMap[size]}`}>
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Core Stats */}
            <div className={`flex items-center gap-4 ${metadataClassMap[size]} text-muted-foreground ml-4`}>
              <span className="flex items-center gap-1 text-green-600">
                ↑ {post.upVotes}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                {post.commentCount || 0}
              </span>
              {post.analytics && (
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {post.analytics.views}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Full view mode
  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-subtle shadow-sm">
      <CardHeader className="pb-4">
        {/* Metadata Bar */}
        <div className="flex items-center gap-3 mb-4">
          {post.authors?.[0] && (
            <>
              <Avatar className="h-8 w-8">
                <AvatarImage src={post.authors[0].user.image} />
                <AvatarFallback>
                  {post.authors[0].user.name?.charAt(0) || 'A'}
                </AvatarFallback>
              </Avatar>
              <span className={`${metadataClassMap[size]} font-medium text-foreground`}>
                {post.authors[0].user.name}
              </span>
            </>
          )}
          <Separator orientation="vertical" className="h-4" />
          <div className={`flex items-center gap-1 ${metadataClassMap[size]} text-muted-foreground`}>
            <Calendar className="h-3 w-3" />
            {new Date(post.createdAt).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
          {post.category && (
            <>
              <Separator orientation="vertical" className="h-4" />
              <Badge variant="outline" className={`${badgeClassMap[size]} font-medium`}>
                {post.category.name}
              </Badge>
            </>
          )}
        </div>

        {/* Post Title */}
        <Link href={`/posts/${post.id}`}>
          <h3 className={`${titleClassMap[size]} font-bold text-foreground hover:text-blue-600 cursor-pointer transition-colors leading-tight`}>
            {post.title}
          </h3>
        </Link>

        {/* Post Subtitle/Meta */}
        <div className="flex items-center gap-3 mt-3">
          <Badge variant={post.status === 'PUBLISHED' ? 'default' : 'secondary'} className={badgeClassMap[size]}>
            {post.status}
          </Badge>
          <span className={`${metadataClassMap[size]} text-muted-foreground`}>Version {post.version}</span>
          <span className={`${metadataClassMap[size]} text-muted-foreground`}>{post.minRead} min read</span>
          {post.contentBlocks && post.contentBlocks.blocks && (
            <Badge variant="secondary" className={`bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 ${badgeClassMap[size]}`}>
              <Sparkles className="w-3 h-3 mr-1" />
              AI Generated
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Content Excerpt */}
        {post.contentBlocks && post.contentBlocks.blocks && (
          <div className="mb-6">
            <ContentBlocksPreview 
              blocks={post.contentBlocks.blocks} 
              maxBlocks={2} 
              className={`${bodyClassMap[size]} leading-relaxed text-gray-700 dark:text-gray-300`}
            />
          </div>
        )}
        
        {/* Action & Stats Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-6">
            <Link href={`/posts/${post.id}`}>
              <Button variant="default" size="sm" className="font-medium">
                Read More
              </Button>
            </Link>
            
            <div className={`flex items-center gap-4 ${metadataClassMap[size]} text-muted-foreground`}>
              {post.analytics && (
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {post.analytics.views} views
                </span>
              )}
              <span className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                {post.commentCount || 0} {(post.commentCount || 0) === 1 ? 'comment' : 'comments'}
              </span>
            </div>
          </div>
          
          <VoteButtons
            postId={post.id}
            upVotes={post.upVotes}
            downVotes={post.downVotes}
            userVote={post.userVote}
            isAuthor={post.isAuthor}
            status={post.status}
          />
        </div>
      </CardContent>
    </Card>
  );
}
