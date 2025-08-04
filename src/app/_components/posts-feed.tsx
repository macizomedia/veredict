"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { CategoryFilter } from "./category-filter";
import { PostsFeedCard } from "./posts-feed-card";
import { LayoutGrid, List, ZoomIn, ZoomOut } from "lucide-react";

type ViewMode = 'full' | 'compact';
type FontSize = 'xs' | 'sm' | 'base' | 'lg';

const FONT_SIZES: FontSize[] = ['xs', 'sm', 'base', 'lg'];

// Skeleton Components
function FullViewSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-3">
                {/* Author and metadata */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
                {/* Title */}
                <div className="h-7 bg-gray-200 rounded w-3/4"></div>
                {/* Subtitle */}
                <div className="h-5 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="text-right space-y-1">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            {/* Content excerpt */}
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-4 bg-gray-200 rounded w-12"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-8 bg-gray-200 rounded w-16"></div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function CompactViewSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="animate-pulse p-3 border-subtle rounded-lg hover:bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex-1 space-y-2">
              {/* Title */}
              <div className="h-5 bg-gray-200 rounded w-3/4"></div>
              {/* Metadata */}
              <div className="flex items-center gap-4">
                <div className="h-3 bg-gray-200 rounded w-20"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
                <div className="h-3 bg-gray-200 rounded w-12"></div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-6 bg-gray-200 rounded w-12"></div>
              <div className="h-6 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function PostsFeed() {
  const { data: session } = useSession();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>();
  const [viewMode, setViewMode] = useState<ViewMode>('full');
  const [fontSize, setFontSize] = useState<FontSize>('base');
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Load preferences from localStorage on mount
  useEffect(() => {
    // Only access localStorage after hydration
    if (typeof window !== 'undefined') {
      const savedViewMode = localStorage.getItem('posts-feed-view-mode') as ViewMode;
      if (savedViewMode && (savedViewMode === 'full' || savedViewMode === 'compact')) {
        setViewMode(savedViewMode);
      }
      
      const savedFontSize = localStorage.getItem('posts-feed-font-size') as FontSize;
      if (savedFontSize && FONT_SIZES.includes(savedFontSize)) {
        setFontSize(savedFontSize);
      }
    }
    
    setIsHydrated(true);
  }, []);

  // Save view mode preference to localStorage
  const handleViewModeChange = (checked: boolean) => {
    const newMode: ViewMode = checked ? 'compact' : 'full';
    setViewMode(newMode);
    if (isHydrated && typeof window !== 'undefined') {
      localStorage.setItem('posts-feed-view-mode', newMode);
    }
  };

  // Font size controls
  const increaseFontSize = () => {
    const currentIndex = FONT_SIZES.indexOf(fontSize);
    const nextIndex = Math.min(currentIndex + 1, FONT_SIZES.length - 1);
    const newSize = FONT_SIZES[nextIndex]!;
    console.log('Increasing font size from', fontSize, 'to', newSize);
    setFontSize(newSize);
    if (isHydrated && typeof window !== 'undefined') {
      localStorage.setItem('posts-feed-font-size', newSize);
    }
  };

  const decreaseFontSize = () => {
    const currentIndex = FONT_SIZES.indexOf(fontSize);
    const prevIndex = Math.max(currentIndex - 1, 0);
    const newSize = FONT_SIZES[prevIndex]!;
    console.log('Decreasing font size from', fontSize, 'to', newSize);
    setFontSize(newSize);
    if (isHydrated && typeof window !== 'undefined') {
      localStorage.setItem('posts-feed-font-size', newSize);
    }
  };
  
  const { data: postsData, isLoading } = api.post.getFeed.useQuery({ 
    limit: 10,
    categoryId: selectedCategoryId,
  });

  // Adaptive skeleton loading based on view mode
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* View mode toggle and font controls (shown even during loading) */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Latest Posts</h2>
          {/* Only render controls after hydration to prevent SSR/CSR mismatch */}
          {isHydrated && (
            <div className="flex items-center gap-4" suppressHydrationWarning>
              {/* Font Size Controls */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={decreaseFontSize}
                  disabled={fontSize === 'xs'}
                  className="h-7 w-7 p-0"
                  aria-label="Decrease font size"
                >
                  <ZoomOut className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={increaseFontSize}
                  disabled={fontSize === 'lg'}
                  className="h-8 w-8 p-0"
                  aria-label="Increase font size"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
              
              {/* View Mode Toggle */}
              <div className="flex items-center gap-3">
                <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                <Switch
                  checked={viewMode === 'compact'}
                  onCheckedChange={handleViewModeChange}
                  aria-label="Toggle view mode"
                />
                <List className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          )}
        </div>
        
        <CategoryFilter 
          selectedCategoryId={selectedCategoryId}
          onCategorySelect={setSelectedCategoryId}
        />
        
        {/* Adaptive skeleton based on current view mode */}
        {viewMode === 'full' ? <FullViewSkeleton /> : <CompactViewSkeleton />}
      </div>
    );
  }

  if (!postsData || postsData.posts.length === 0) {
    return (
      <div className="space-y-6">
        {/* View mode toggle and font controls */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Latest Posts</h2>
          <div className="flex items-center gap-4">
            {/* Font Size Controls */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={decreaseFontSize}
                disabled={fontSize === 'xs'}
                className="h-7 w-7 p-0"
                aria-label="Decrease font size"
              >
                <ZoomOut className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={increaseFontSize}
                disabled={fontSize === 'lg'}
                className="h-8 w-8 p-0"
                aria-label="Increase font size"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Editorial</span>
              <LayoutGrid className="h-4 w-4 text-muted-foreground" />
              <Switch
                checked={viewMode === 'compact'}
                onCheckedChange={handleViewModeChange}
                aria-label="Toggle view mode"
              />
              <List className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Scan</span>
            </div>
          </div>
        </div>
        
        <CategoryFilter 
          selectedCategoryId={selectedCategoryId}
          onCategorySelect={setSelectedCategoryId}
        />
        
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-foreground">No posts found</h3>
          <p className="text-muted-foreground mt-2">
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with View Mode Toggle and Font Size Controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Latest Posts</h2>
        {/* Only render controls after hydration to prevent SSR/CSR mismatch */}
        {isHydrated && (
          <div className="flex items-center gap-4" suppressHydrationWarning>
            {/* Font Size Controls */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={decreaseFontSize}
                disabled={fontSize === 'xs'}
                className="h-7 w-7 p-0"
                aria-label="Decrease font size"
              >
                <ZoomOut className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={increaseFontSize}
                disabled={fontSize === 'lg'}
                className="h-8 w-8 p-0"
                aria-label="Increase font size"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Editorial</span>
              <LayoutGrid className="h-4 w-4 text-muted-foreground" />
              <Switch
                checked={viewMode === 'compact'}
                onCheckedChange={handleViewModeChange}
                aria-label="Toggle view mode"
              />
              <List className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Scan</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Category Filter */}
      <CategoryFilter 
        selectedCategoryId={selectedCategoryId}
        onCategorySelect={setSelectedCategoryId}
      />
      
      {/* Posts List - Conditional Rendering Based on View Mode */}
      {viewMode === 'full' ? (
          // Full View (Editorial Mode)
          <div className="space-y-6">
            {postsData.posts.map((post: any) => (
              <PostsFeedCard 
                key={post.id}
                post={post}
                size={fontSize}
                viewMode="full"
              />
            ))}
        </div>
      ) : (
        // Compact View (Scan Mode)
        <div className="space-y-1">
          {postsData.posts.map((post: any) => (
            <PostsFeedCard 
              key={post.id}
              post={post}
              size={fontSize}
              viewMode="compact"
            />
          ))}
        </div>
      )}
    </div>
  );
}
