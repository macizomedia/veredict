"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/trpc/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Search, 
  Clock, 
  TrendingUp, 
  X, 
  Filter,
  Loader2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useSearchWithDebounce } from "@/hooks/use-search";

interface SearchBarProps {
  onResults?: (results: any[]) => void;
  placeholder?: string;
  showFilters?: boolean;
  className?: string;
}

export function SearchBar({ 
  onResults, 
  placeholder = "Search posts...", 
  showFilters = true,
  className = "",
}: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize search state from URL params if available
  const initialQuery = searchParams.get("q") || "";
  const initialCategoryId = searchParams.get("category") ? Number(searchParams.get("category")) : undefined;
  const initialSortBy = (searchParams.get("sort") || "relevance") as "relevance" | "date" | "views";

  const {
    searchState,
    hasValidQuery,
    isSearching,
    searchResults,
    suggestions,
    popularSearches,
    updateQuery,
    updateCategory,
    updateSortBy,
    clearSearch,
  } = useSearchWithDebounce({
    query: initialQuery,
    categoryId: initialCategoryId,
    sortBy: initialSortBy,
  });

  // Get categories for filter
  const { data: categories } = api.category.getAll.useQuery();

  // State for dropdown visibility
  const [isOpen, setIsOpen] = useState(false);

  // Update parent component with results
  useEffect(() => {
    if (searchResults.posts && onResults) {
      onResults(searchResults.posts);
    }
  }, [searchResults.posts, onResults]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Ctrl/Cmd + K to focus search
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      // Escape to close
      if (event.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      const params = new URLSearchParams();
      params.set('q', searchQuery.trim());
      if (searchState.categoryId) params.set('category', searchState.categoryId.toString());
      if (searchState.sortBy !== 'relevance') params.set('sort', searchState.sortBy);
      
      router.push(`/search?${params.toString()}`);
      setIsOpen(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    updateQuery(suggestion);
    handleSearch(suggestion);
  };

  const handleResultClick = (postId: number) => {
    router.push(`/posts/${postId}`);
    setIsOpen(false);
  };

  const showDropdown = isOpen && (hasValidQuery || searchState.query.length === 0);

  return (
    <div ref={searchRef} className={`relative w-full max-w-2xl ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={`${placeholder} (⌘K)`}
          value={searchState.query}
          onChange={(e) => updateQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch(searchState.query);
            }
          }}
          className="pl-10 pr-20"
        />
        
        {/* Action Buttons */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {/* Loading indicator */}
          {isSearching && (
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          )}
          
          {/* Clear button */}
          {searchState.query && !isSearching && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                clearSearch();
                inputRef.current?.focus();
              }}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          
          {/* Filter button */}
          {showFilters && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={`h-8 w-8 p-0 ${searchState.categoryId || searchState.sortBy !== 'relevance' ? 'text-blue-600' : ''}`}
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <Select
                      value={searchState.categoryId?.toString() || "all"}
                      onValueChange={(value) => 
                        updateCategory(value === "all" ? undefined : Number(value))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories?.map((category: any) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Sort By</label>
                    <Select value={searchState.sortBy} onValueChange={updateSortBy}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">Relevance</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="views">Views</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      {/* Search Dropdown */}
      {showDropdown && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-96 overflow-y-auto shadow-lg border">
          <CardContent className="p-0">
            {/* Search Results */}
            {searchResults.hasResults && (
              <div>
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50 border-b">
                  SEARCH RESULTS
                  {isSearching && (
                    <span className="ml-2 text-blue-500">
                      <Loader2 className="inline h-3 w-3 animate-spin" />
                    </span>
                  )}
                </div>
                {searchResults.posts.slice(0, 5).map((post: any) => (
                  <button
                    key={post.id}
                    onClick={() => handleResultClick(post.id)}
                    className="w-full text-left p-4 hover:bg-gray-50 border-b last:border-b-0 transition-colors group"
                  >
                    <div className="font-medium text-sm line-clamp-1 group-hover:text-blue-600">
                      {post.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                      {post.category && (
                        <Badge variant="secondary" className="text-xs">
                          {post.category.name}
                        </Badge>
                      )}
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {post.analytics?.views || 0} views
                      </span>
                      {searchState.sortBy === 'relevance' && post.rank && (
                        <span className="text-blue-600">
                          {Math.round(post.rank * 100)}% match
                        </span>
                      )}
                    </div>
                  </button>
                ))}
                {searchResults.posts.length > 5 && (
                  <button
                    onClick={() => handleSearch(searchState.query)}
                    className="w-full p-3 text-sm text-blue-600 hover:bg-blue-50 transition-colors font-medium"
                  >
                    View all {searchResults.total} results →
                  </button>
                )}
              </div>
            )}

            {/* Suggestions */}
            {suggestions.hasSuggestions && !searchResults.hasResults && hasValidQuery && (
              <div>
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50 border-b">
                  SUGGESTIONS
                </div>
                {suggestions.items.map((suggestion: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left p-3 hover:bg-gray-50 border-b last:border-b-0 transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-gray-400" />
                      <span className="text-sm group-hover:text-blue-600">{suggestion}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Popular Searches (when no query) */}
            {searchState.query.length === 0 && (
              <div>
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50 border-b">
                  POPULAR SEARCHES
                </div>
                {popularSearches.items.map((search: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(search)}
                    className="w-full text-left p-3 hover:bg-gray-50 border-b last:border-b-0 transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-gray-400" />
                      <span className="text-sm group-hover:text-blue-600">{search}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* No Results */}
            {hasValidQuery && !isSearching && !searchResults.hasResults && !suggestions.hasSuggestions && (
              <div className="p-8 text-center">
                <Search className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 mb-1">
                  No results found for "{searchState.query}"
                </p>
                <p className="text-xs text-gray-400">
                  Try different keywords or check your spelling
                </p>
              </div>
            )}

            {/* Loading State */}
            {hasValidQuery && isSearching && !searchResults.hasResults && (
              <div className="p-8 text-center">
                <Loader2 className="h-8 w-8 text-gray-400 mx-auto mb-3 animate-spin" />
                <p className="text-sm text-gray-500">
                  Searching...
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
