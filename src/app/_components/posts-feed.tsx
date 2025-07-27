"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CategoryFilter } from "./category-filter";
import { VoteButtons } from "./vote-buttons";
import { MessageCircle, Eye } from "lucide-react";

export function PostsFeed() {
  const { data: session } = useSession();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>();
  
  const { data: postsData, isLoading } = api.post.getFeed.useQuery({ 
    limit: 10,
    categoryId: selectedCategoryId,
  });

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading posts...</p>
      </div>
    );
  }

  if (!postsData || postsData.posts.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">No posts found</h3>
        <p className="text-gray-500 mt-2">
          {session ? "Be the first to create a post!" : "Posts will appear here once users start creating content."}
        </p>
        {session ? (
          <Link href="/posts/create">
            <Button className="mt-4">Create Post</Button>
          </Link>
        ) : (
          <Link href="/api/auth/signin">
            <Button className="mt-4">Sign in to Create Posts</Button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Latest Posts</h2>
      </div>
      
      {/* Category Filter */}
      <CategoryFilter 
        selectedCategoryId={selectedCategoryId}
        onCategorySelect={setSelectedCategoryId}
      />
      
      {/* Posts List */}
      <div className="space-y-4">
        {postsData.posts.map((post: any) => (
          <Card key={post.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Link href={`/posts/${post.id}`}>
                    <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                      {post.title}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="default">
                      {post.status}
                    </Badge>
                    <span className="text-sm text-gray-500">v{post.version}</span>
                  </div>
                </div>
                <div className="text-sm text-gray-500 text-right">
                  <div>{post.minRead} min read</div>
                  <div className="mt-1">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  {post.category && (
                    <Badge variant="outline" className="text-xs">
                      {post.category.name}
                    </Badge>
                  )}
                  {post.analytics && (
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {post.analytics.views} views
                    </span>
                  )}
                  {/* Comment Count */}
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    {post.commentCount || 0} {(post.commentCount || 0) === 1 ? 'comment' : 'comments'}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  {/* Voting Buttons */}
                  <VoteButtons
                    postId={post.id}
                    upVotes={post.upVotes}
                    downVotes={post.downVotes}
                    userVote={post.userVote}
                    isAuthor={post.isAuthor}
                    status={post.status}
                  />
                  {/* Authors */}
                  {post.authors.length > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-400">by</span>
                      {post.authors.slice(0, 2).map((author: any, index: number) => (
                        <span key={author.user.id} className="text-xs text-gray-600">
                          {author.user.name}
                          {index < post.authors.length - 1 && post.authors.length > 1 ? ', ' : ''}
                        </span>
                      ))}
                      {post.authors.length > 2 && (
                        <span className="text-xs text-gray-400">
                          +{post.authors.length - 2} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
