"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Edit, Save, X, Users, History } from "lucide-react";

interface EditPostFormProps {
  post: any;
  onCancel: () => void;
}

export function EditPostForm({ post, onCancel }: EditPostFormProps) {
  const router = useRouter();
  const utils = api.useUtils();
  const [formData, setFormData] = useState({
    title: post.title || "",
    prompt: post.prompt || "",
    tone: post.tone || "",
    style: post.style || "",
    minRead: post.minRead || 1,
    categoryId: post.categoryId || undefined as number | undefined,
    summaryOfChanges: "",
  });

  // Fetch categories for selection
  const { data: categories } = api.category.getAll.useQuery();

  const updatePost = api.post.update.useMutation({
    onSuccess: async () => {
      await utils.post.invalidate();
      await utils.user.getUserPosts.invalidate();
      router.refresh();
      onCancel();
    },
    onError: (error) => {
      alert(`Error updating post: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.prompt.trim()) {
      alert("Title and prompt are required");
      return;
    }

    updatePost.mutate({
      postId: post.id,
      ...formData,
      categoryId: formData.categoryId || undefined,
    });
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Post
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">v{post.version}</Badge>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Enter post title"
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.categoryId ? `cat-${formData.categoryId}` : "no-category"}
              onValueChange={(value) => {
                if (value === "no-category") {
                  setFormData(prev => ({ ...prev, categoryId: undefined }));
                } else if (value.startsWith("cat-")) {
                  const categoryId = parseInt(value.replace("cat-", ""));
                  setFormData(prev => ({ ...prev, categoryId: categoryId }));
                } else {
                  setFormData(prev => ({ ...prev, categoryId: undefined }));
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-category">No category</SelectItem>
                {categories && categories.length > 0 ? (
                  categories.filter((category: any) => {
                    // More robust validation
                    const hasValidId = category?.id && typeof category.id === 'number' && category.id > 0;
                    const hasValidName = category?.name && typeof category.name === 'string' && category.name.trim().length > 0;
                    
                    return hasValidId && hasValidName;
                  }).map((category: any) => {
                    const categoryValue = `cat-${category.id}`; // Prefix to ensure it's never empty
                    
                    return (
                      <SelectItem key={category.id} value={categoryValue}>
                        {category.name}
                      </SelectItem>
                    );
                  })
                ) : null}
              </SelectContent>
            </Select>
          </div>

          {/* Prompt */}
          <div className="space-y-2">
            <Label htmlFor="prompt">AI Prompt</Label>
            <Textarea
              id="prompt"
              value={formData.prompt}
              onChange={(e) => handleInputChange("prompt", e.target.value)}
              placeholder="Describe what you want to write about..."
              rows={4}
              required
            />
          </div>

          {/* Tone and Style */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Select
                value={formData.tone}
                onValueChange={(value) => handleInputChange("tone", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INFORMATIVE">Informative</SelectItem>
                  <SelectItem value="ANALYTICAL">Analytical</SelectItem>
                  <SelectItem value="OPTIMISTIC">Optimistic</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                  <SelectItem value="NEUTRAL">Neutral</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="style">Writing Style</Label>
              <Select
                value={formData.style}
                onValueChange={(value) => handleInputChange("style", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FORMAL">Formal</SelectItem>
                  <SelectItem value="ACCESSIBLE">Accessible</SelectItem>
                  <SelectItem value="TECHNICAL">Technical</SelectItem>
                  <SelectItem value="CONVERSATIONAL">Conversational</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Min Read */}
          <div className="space-y-2">
            <Label htmlFor="minRead">Estimated Read Time (minutes)</Label>
            <Input
              id="minRead"
              type="number"
              min="1"
              max="60"
              value={formData.minRead}
              onChange={(e) => handleInputChange("minRead", parseInt(e.target.value) || 1)}
              required
            />
          </div>

          {/* Summary of Changes */}
          <div className="space-y-2">
            <Label htmlFor="summaryOfChanges">Summary of Changes (Optional)</Label>
            <Textarea
              id="summaryOfChanges"
              value={formData.summaryOfChanges}
              onChange={(e) => handleInputChange("summaryOfChanges", e.target.value)}
              placeholder="Describe what changes you made..."
              rows={2}
            />
            <p className="text-sm text-gray-500">
              If provided, this will create a new version of the post
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Users className="h-4 w-4" />
              <span>{post.authors?.length || 0} author(s)</span>
              <History className="h-4 w-4 ml-2" />
              <span>Version {post.version}</span>
            </div>
            
            <Button
              type="submit"
              disabled={updatePost.isPending}
              className="flex items-center gap-2"
            >
              {updatePost.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
