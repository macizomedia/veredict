"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, MousePointer, Calendar, Hash, Upload, Edit } from "lucide-react";

export function UserPosts() {
  const [statusFilter, setStatusFilter] = useState<"DRAFT" | "PUBLISHED" | "ARCHIVED" | "DISPUTED" | undefined>();
  const utils = api.useUtils();
  
  const { data: postsData, isLoading, fetchNextPage, hasNextPage } = api.user.getUserPosts.useInfiniteQuery(
    { 
      limit: 10,
      status: statusFilter,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const publishPost = api.post.publish.useMutation({
    onSuccess: async () => {
      // Invalidate and refetch posts
      await utils.user.getUserPosts.invalidate();
      await utils.post.getFeed.invalidate();
    },
    onError: (error) => {
      console.error("Error publishing post:", error);
      alert("Failed to publish post: " + error.message);
    },
  });

  const posts = postsData?.pages.flatMap(page => page.posts) ?? [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="flex gap-2">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-12"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button and Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">My Posts</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage and track all your posts
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={statusFilter || "all"} onValueChange={(value) => 
            setStatusFilter(value === "all" ? undefined : value as typeof statusFilter)
          }>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
              <SelectItem value="DISPUTED">Disputed</SelectItem>
            </SelectContent>
          </Select>
          <Link href="/posts/create">
            <Button>Create New Post</Button>
          </Link>
        </div>
      </div>

      {/* Posts List */}
      {posts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">No posts found</h3>
            <p className="text-gray-500 mt-2">
              {statusFilter 
                ? `You don't have any ${statusFilter.toLowerCase()} posts yet.`
                : "You haven't created any posts yet."
              }
            </p>
            <Link href="/posts/create">
              <Button className="mt-4">Create Your First Post</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post: any) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link href={`/posts/${post.id}`}>
                      <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                        {post.title}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={
                        post.status === "PUBLISHED" ? "default" :
                        post.status === "DRAFT" ? "secondary" :
                        post.status === "DISPUTED" ? "destructive" : "outline"
                      }>
                        {post.status}
                      </Badge>
                      {post.status === "DRAFT" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => publishPost.mutate({ postId: post.id })}
                          disabled={publishPost.isPending}
                          className="h-6 px-2 text-xs"
                        >
                          <Upload className="h-3 w-3 mr-1" />
                          {publishPost.isPending ? "Publishing..." : "Publish"}
                        </Button>
                      )}
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Hash className="h-3 w-3" />
                        <span>v{post.version}</span>
                        {!post.isLatest && (
                          <span className="text-orange-500">(older version)</span>
                        )}
                      </div>
                    </div>
                    {post.summaryOfChanges && (
                      <p className="text-sm text-gray-600 mt-1 italic">
                        Changes: {post.summaryOfChanges}
                      </p>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 text-right">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(post.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Category */}
                    {post.category && (
                      <Badge variant="outline" className="text-xs">
                        {post.category.name}
                      </Badge>
                    )}
                    
                    {/* Analytics */}
                    {post.analytics && (
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{post.analytics.views} views</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MousePointer className="h-3 w-3" />
                          <span>{post.analytics.sourceClicks} clicks</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Vote counts and Actions */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-green-600">↑ {post.upVotes}</span>
                      <span className="text-red-600">↓ {post.downVotes}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/posts/${post.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                      <Link href={`/posts/${post.id}/manage`}>
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          <Edit className="h-3 w-3" />
                          Manage
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Load More Button */}
          {hasNextPage && (
            <div className="text-center pt-4">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Load More Posts"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
