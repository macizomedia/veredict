import { useState, useEffect, useMemo } from 'react';
import { api } from '@/trpc/react';

interface UseSearchOptions {
  debounceMs?: number;
  minQueryLength?: number;
  enabled?: boolean;
}

interface SearchState {
  query: string;
  categoryId?: number;
  sortBy: 'relevance' | 'date' | 'views';
}

export function useSearchWithDebounce(
  initialState: SearchState,
  options: UseSearchOptions = {}
) {
  const {
    debounceMs = 300,
    minQueryLength = 2,
    enabled = true,
  } = options;

  const [searchState, setSearchState] = useState<SearchState>(initialState);
  const [debouncedState, setDebouncedState] = useState<SearchState>(initialState);
  const [isDebouncing, setIsDebouncing] = useState(false);

  // Debounce logic
  useEffect(() => {
    if (!enabled) return;

    // Don't debounce if query is empty - clear immediately
    if (!searchState.query.trim()) {
      setDebouncedState(searchState);
      setIsDebouncing(false);
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedState(searchState);
      setIsDebouncing(false);
    }, debounceMs);

    setIsDebouncing(true);

    return () => {
      clearTimeout(timer);
    };
  }, [searchState, debounceMs, enabled]);

  // Search API call
  const searchQuery = api.search.searchPosts.useQuery(
    {
      query: debouncedState.query,
      categoryId: debouncedState.categoryId,
      sortBy: debouncedState.sortBy,
      limit: 50,
    },
    {
      enabled: enabled && 
               debouncedState.query.length >= minQueryLength && 
               debouncedState.query.trim().length > 0, // Ensure non-empty trimmed query
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    }
  );

  // Suggestions API call
  const suggestionsQuery = api.search.searchSuggestions.useQuery(
    {
      query: debouncedState.query,
      limit: 5,
    },
    {
      enabled: enabled && 
               debouncedState.query.length >= minQueryLength && 
               debouncedState.query.length < 15 && // Don't show suggestions for long queries
               debouncedState.query.trim().length > 0, // Ensure non-empty trimmed query
      staleTime: 1000 * 60 * 10, // 10 minutes
      refetchOnWindowFocus: false,
    }
  );

  // Popular searches for empty state
  const popularSearchesQuery = api.search.getPopularSearches.useQuery(
    undefined,
    {
      enabled: enabled,
      staleTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: false,
    }
  );

  // Computed states
  const isSearching = useMemo(() => 
    isDebouncing || searchQuery.isFetching,
    [isDebouncing, searchQuery.isFetching]
  );

  const hasValidQuery = useMemo(() => 
    searchState.query.length >= minQueryLength,
    [searchState.query.length, minQueryLength]
  );

  const searchResults = useMemo(() => ({
    posts: searchQuery.data?.posts || [],
    total: searchQuery.data?.total || 0,
    isLoading: isSearching,
    error: searchQuery.error,
    hasResults: (searchQuery.data?.posts?.length || 0) > 0,
  }), [searchQuery.data, searchQuery.error, isSearching]);

  const suggestions = useMemo(() => ({
    items: suggestionsQuery.data || [],
    isLoading: suggestionsQuery.isFetching,
    hasSuggestions: (suggestionsQuery.data?.length || 0) > 0,
  }), [suggestionsQuery.data, suggestionsQuery.isFetching]);

  const popularSearches = useMemo(() => ({
    items: popularSearchesQuery.data || [],
    isLoading: popularSearchesQuery.isFetching,
  }), [popularSearchesQuery.data, popularSearchesQuery.isFetching]);

  // Actions
  const updateQuery = (query: string) => {
    setSearchState(prev => ({ ...prev, query }));
  };

  const updateCategory = (categoryId?: number) => {
    setSearchState(prev => ({ ...prev, categoryId }));
  };

  const updateSortBy = (sortBy: 'relevance' | 'date' | 'views') => {
    setSearchState(prev => ({ ...prev, sortBy }));
  };

  const updateSearchState = (newState: Partial<SearchState>) => {
    setSearchState(prev => ({ ...prev, ...newState }));
  };

  const clearSearch = () => {
    setSearchState({ query: '', categoryId: undefined, sortBy: 'relevance' });
  };

  return {
    // State
    searchState,
    debouncedState,
    
    // Computed
    hasValidQuery,
    isSearching,
    searchResults,
    suggestions,
    popularSearches,
    
    // Actions
    updateQuery,
    updateCategory,
    updateSortBy,
    updateSearchState,
    clearSearch,
  };
}
