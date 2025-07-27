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

export function CreatePostForm() {
  const router = useRouter();
  const utils = api.useUtils();
  const [formData, setFormData] = useState({
    title: "",
    prompt: "",
    minRead: 1,
    categoryId: undefined as number | undefined,
  });

  // Fetch categories for selection
  const { data: categories } = api.category.getAll.useQuery();

  // Debug logging to see what categories data looks like
  console.log('Categories data:', categories);

  const createPost = api.post.create.useMutation({
    onSuccess: async () => {
      await utils.post.invalidate();
      router.push("/dashboard"); // Redirect to dashboard page after creation
    },
    onError: (error) => {
      console.error("Error creating post:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPost.mutate(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Post Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              type="text"
              placeholder="Enter post title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt">AI Prompt</Label>
            <Textarea
              id="prompt"
              placeholder="Describe what you want the AI to write about"
              value={formData.prompt}
              onChange={(e) => setFormData(prev => ({ ...prev, prompt: e.target.value }))}
              className="min-h-[100px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select onValueChange={(value) => {
              if (value === "no-category") {
                setFormData(prev => ({ ...prev, categoryId: undefined }));
              } else if (value.startsWith("cat-")) {
                const categoryId = parseInt(value.replace("cat-", ""));
                setFormData(prev => ({ ...prev, categoryId: categoryId }));
              } else {
                setFormData(prev => ({ ...prev, categoryId: undefined }));
              }
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-category">No Category</SelectItem>
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

          <div className="space-y-2">
            <Label htmlFor="minRead">Estimated Read Time (minutes)</Label>
            <Input
              id="minRead"
              type="number"
              min="1"
              value={formData.minRead}
              onChange={(e) => setFormData(prev => ({ ...prev, minRead: parseInt(e.target.value) || 1 }))}
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={createPost.isPending}
          >
            {createPost.isPending ? "Creating..." : "Create Post"}
          </Button>

          {createPost.error && (
            <div className="text-red-600 text-sm">
              Error: {createPost.error.message}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
