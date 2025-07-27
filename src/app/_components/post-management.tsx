"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EditPostForm } from "./edit-post-form";
import { ManageAuthors } from "./manage-authors";
import { PostVersions } from "./post-versions";
import { 
  Edit, 
  Users, 
  History, 
  FileText, 
  Shield, 
  Crown,
  CheckCircle,
  Clock,
  Archive,
  AlertTriangle 
} from "lucide-react";

interface PostManagementProps {
  postId: number;
}

export function PostManagement({ postId }: PostManagementProps) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);

  const { data: post, isLoading, refetch } = api.post.getById.useQuery({ id: postId });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">Post not found</p>
        </CardContent>
      </Card>
    );
  }

  const userRole = session?.user?.role;
  const isAuthor = post.authors?.some((author: any) => author.user.id === session?.user?.id);
  const canEdit = isAuthor || userRole === 'EDITOR' || userRole === 'ADMIN';
  const canManageAuthors = canEdit;
  const canViewVersions = canEdit;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'DRAFT':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'ARCHIVED':
        return <Archive className="h-4 w-4 text-gray-600" />;
      case 'DISPUTED':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Crown className="h-3 w-3 text-yellow-600" />;
      case 'EDITOR':
        return <Shield className="h-3 w-3 text-blue-600" />;
      default:
        return <Edit className="h-3 w-3 text-gray-600" />;
    }
  };

  if (isEditing) {
    return (
      <EditPostForm
        post={post}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Post Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{post.title}</h1>
                {getStatusIcon(post.status)}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline">{post.status}</Badge>
                <Badge variant="secondary">v{post.version}</Badge>
                {post.category && (
                  <Badge variant="outline">{post.category.name}</Badge>
                )}
                <span className="text-sm text-gray-500">{post.minRead} min read</span>
              </div>
            </div>
            {canEdit && (
              <Button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Post
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {/* AI Prompt */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">AI Prompt</h3>
              <p className="text-blue-800">{post.prompt}</p>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-500">Tone</span>
                <p className="capitalize">{post.tone.toLowerCase()}</p>
              </div>
              <div>
                <span className="font-medium text-gray-500">Style</span>
                <p className="capitalize">{post.style.toLowerCase()}</p>
              </div>
              <div>
                <span className="font-medium text-gray-500">Created</span>
                <p>{new Date(post.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="font-medium text-gray-500">Updated</span>
                <p>{new Date(post.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Authors Summary */}
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-500">Authors:</span>
              <div className="flex items-center gap-1">
                {post.authors?.map((author: any, index: number) => (
                  <span key={author.user.id} className="flex items-center gap-1">
                    {index > 0 && <span className="text-gray-400">,</span>}
                    <span className="text-sm font-medium">{author.user.name}</span>
                    {getRoleBadge(author.user.role)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {canManageAuthors && (
            <TabsTrigger value="authors">Authors</TabsTrigger>
          )}
          {canViewVersions && (
            <TabsTrigger value="versions">Versions</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent>
              {post.contentBlocks && typeof post.contentBlocks === 'object' && 'content' in post.contentBlocks ? (
                <div className="prose max-w-none">
                  {(post.contentBlocks as { content: string }).content.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 text-gray-700">
                      {paragraph}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">
                  Content will be generated based on the prompt above.
                </p>
              )}
            </CardContent>
          </Card>

          {post.analytics && (
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{post.analytics.views}</p>
                    <p className="text-sm text-gray-500">Views</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{post.upVotes}</p>
                    <p className="text-sm text-gray-500">Upvotes</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{post.downVotes}</p>
                    <p className="text-sm text-gray-500">Downvotes</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{post.analytics.sourceClicks}</p>
                    <p className="text-sm text-gray-500">Source Clicks</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {canManageAuthors && (
          <TabsContent value="authors">
            <ManageAuthors
              postId={postId}
              authors={post.authors || []}
              onUpdate={() => refetch()}
            />
          </TabsContent>
        )}

        {canViewVersions && (
          <TabsContent value="versions">
            <PostVersions postId={postId} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
