"use client";

import { api } from "@/trpc/react";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, FileText, Clock, Tag } from "lucide-react";

export function DashboardStats() {
  const { data: postsData } = api.post.getFeed.useQuery({ limit: 100 });
  const { data: categories } = api.category.getAll.useQuery();

  const totalPosts = postsData?.posts.length || 0;
  const aiGeneratedPosts = postsData?.posts.filter(
    (post: any) => post.contentBlocks && post.contentBlocks.blocks
  ).length || 0;
  const totalCategories = categories?.length || 0;
  const avgReadTime = postsData?.posts.length 
    ? Math.round(postsData.posts.reduce((acc: number, post: any) => acc + (post.minRead || 5), 0) / postsData.posts.length)
    : 5;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <Card>
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{totalPosts}</div>
          <div className="text-sm text-gray-600">Total Articles</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{aiGeneratedPosts}</div>
          <div className="text-sm text-gray-600">AI Generated</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Tag className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{totalCategories}</div>
          <div className="text-sm text-gray-600">Categories</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Clock className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{avgReadTime}m</div>
          <div className="text-sm text-gray-600">Avg Read Time</div>
        </CardContent>
      </Card>
    </div>
  );
}
