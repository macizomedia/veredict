"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/app/_components/search-bar";
import { useSearchWithDebounce } from "@/hooks/use-search";
import { 
  Calendar, 
  TrendingUp, 
  User, 
  Clock,
  Filter,
  Search,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const categoryId = searchParams.get("category") ? Number(searchParams.get("category")) : undefined;
  const sortBy = (searchParams.get("sort") || "relevance") as "relevance" | "date" | "views";

  const {
    searchResults,
  } = useSearchWithDebounce({
    query,
    categoryId,
    sortBy,
  }, {
    enabled: query.length >= 2,
    debounceMs: 100, // Faster for direct page loads
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatReadTime = (minutes: number) => {
    return `${minutes} min read`;
  };

  if (query.length < 2) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Search for posts
          </h2>
          <p className="text-gray-500">
            Enter at least 2 characters to start searching
          </p>
        </div>
      </div>
    );
  }

  if (searchResults.isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <SearchBar placeholder="Search posts..." />
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="flex gap-2">
                    <div className="h-5 bg-gray-200 rounded w-16"></div>
                    <div className="h-5 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (searchResults.error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <SearchBar placeholder="Search posts..." />
        </div>
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Search Error
          </h2>
          <p className="text-gray-500">
            {searchResults.error.message || "Something went wrong with your search"}
          </p>
        </div>
      </div>
    );
  }

  const posts = searchResults.posts || [];
  const total = searchResults.total || 0;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Search Bar */}
      <div className="mb-6">
        <SearchBar placeholder="Search posts..." />
      </div>

      {/* Search Info */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Search Results
          </h1>
          <p className="text-gray-500 mt-1">
            {total > 0 ? (
              <>
                Found {total} result{total !== 1 ? 's' : ''} for &quot;
                <span className="font-medium">{query}</span>&quot;
              </>
            ) : (
              <>
                No results found for &quot;
                <span className="font-medium">{query}</span>&quot;
              </>
            )}
          </p>
        </div>

        {/* Sort indicator */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Filter className="h-4 w-4" />
          <span>
            Sorted by {sortBy === 'relevance' ? 'Relevance' : 
                      sortBy === 'date' ? 'Date' : 'Views'}
          </span>
        </div>
      </div>

      {/* Results */}
      {posts.length > 0 ? (
        <div className="space-y-6">
          {posts.map((post: any) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Title and Category */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <Link href={`/posts/${post.id}`}>
                        <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                      </Link>
                      {post.category && (
                        <Badge variant="secondary">
                          {post.category.name}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Excerpt from prompt */}
                  <p className="text-gray-600 line-clamp-3">
                    {post.prompt}
                  </p>

                  {/* Meta Information */}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {/* Authors */}
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>
                        {post.authors?.length > 0 
                          ? post.authors.map((author: any) => author.user.name).join(", ")
                          : "Anonymous"
                        }
                      </span>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(post.createdAt)}</span>
                    </div>

                    {/* Read time */}
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatReadTime(post.minRead)}</span>
                    </div>

                    {/* Views */}
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      <span>{post.analytics?.views || 0} views</span>
                    </div>

                    {/* Comments */}
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      <span>{post.commentCount || 0} {(post.commentCount || 0) === 1 ? 'comment' : 'comments'}</span>
                    </div>

                    {/* Relevance score (only show for relevance sort) */}
                    {sortBy === 'relevance' && post.rank && (
                      <div className="ml-auto">
                        <Badge variant="outline" className="text-xs">
                          {Math.round(post.rank * 100)}% match
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No posts found
          </h2>
          <p className="text-gray-500 mb-6">
            Try adjusting your search terms or filters
          </p>
          <div className="space-y-2">
            <p className="text-sm text-gray-400">Suggestions:</p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>• Check your spelling</li>
              <li>• Try different keywords</li>
              <li>• Use more general terms</li>
              <li>• Remove category filters</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}
