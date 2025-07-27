"use client";

import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CategoryFilterProps {
  selectedCategoryId?: number;
  onCategorySelect: (categoryId?: number) => void;
}

export function CategoryFilter({ selectedCategoryId, onCategorySelect }: CategoryFilterProps) {
  const { data: categories, isLoading } = api.category.getAll.useQuery();

  if (isLoading) {
    return <div className="text-sm text-gray-500">Loading categories...</div>;
  }

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Button
        variant={selectedCategoryId === undefined ? "default" : "outline"}
        size="sm"
        onClick={() => onCategorySelect(undefined)}
      >
        All Posts
      </Button>
      
      {categories?.map((category: any) => (
        <Button
          key={category.id}
          variant={selectedCategoryId === category.id ? "default" : "outline"}
          size="sm"
          onClick={() => onCategorySelect(category.id)}
          className="flex items-center gap-2"
        >
          {category.name}
          <Badge variant="secondary" className="text-xs">
            {category._count.posts}
          </Badge>
        </Button>
      ))}
    </div>
  );
}
