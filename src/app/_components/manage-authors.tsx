"use client";

import { useState, useEffect, useMemo } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Plus, X, Mail, Search } from "lucide-react";
import { useSession } from "next-auth/react";

interface ManageAuthorsProps {
  postId: number;
  authors: any[];
  onUpdate: () => void;
}

// Custom hook for debounced search
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function ManageAuthors({ postId, authors, onUpdate }: ManageAuthorsProps) {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isAddingAuthor, setIsAddingAuthor] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Debounce search query to avoid excessive API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const addAuthor = api.post.addAuthor.useMutation({
    onSuccess: () => {
      setSearchQuery("");
      setSelectedUser(null);
      setIsAddingAuthor(false);
      setShowSuggestions(false);
      onUpdate();
    },
    onError: (error) => {
      alert(`Error adding author: ${error.message}`);
    },
  });

  const removeAuthor = api.post.removeAuthor.useMutation({
    onSuccess: () => {
      onUpdate();
    },
    onError: (error) => {
      alert(`Error removing author: ${error.message}`);
    },
  });

  // Search users with partial matching
  const { data: userSuggestions, isLoading: isSearchingUsers } = api.user.searchUsers.useQuery(
    { query: debouncedSearchQuery, limit: 5 },
    { 
      enabled: debouncedSearchQuery.trim().length >= 2,
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  // Filter out users who are already authors
  const filteredSuggestions = useMemo(() => {
    if (!userSuggestions) return [];
    const existingAuthorIds = new Set(authors.map(author => author.user.id));
    return userSuggestions.filter((user: any) => !existingAuthorIds.has(user.id));
  }, [userSuggestions, authors]);

  const handleAddAuthor = (user: any) => {
    addAuthor.mutate({
      postId,
      userId: user.id,
    });
  };

  const handleRemoveAuthor = (userId: string) => {
    if (authors.length <= 1) {
      alert("Cannot remove the last author from a post");
      return;
    }

    if (confirm("Are you sure you want to remove this author?")) {
      removeAuthor.mutate({
        postId,
        userId,
      });
    }
  };

  const canManageAuthors = session?.user && (
    authors.some(author => author.user.id === session.user.id) ||
    session.user.role === 'EDITOR' ||
    session.user.role === 'ADMIN'
  );

  if (!canManageAuthors) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Authors ({authors.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {authors.map((author: any) => (
              <div key={author.user.id} className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={author.user.image || ""} />
                  <AvatarFallback>
                    {author.user.name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{author.user.name || "Anonymous"}</p>
                  <p className="text-sm text-gray-500">{author.user.email}</p>
                </div>
                <Badge variant="secondary">{author.user.role}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Manage Authors ({authors.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Authors */}
        <div className="space-y-3">
          {authors.map((author: any) => (
            <div key={author.user.id} className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={author.user.image || ""} />
                <AvatarFallback>
                  {author.user.name?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">{author.user.name || "Anonymous"}</p>
                <p className="text-sm text-gray-500">{author.user.email}</p>
              </div>
              <Badge variant="secondary">{author.user.role}</Badge>
              {authors.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveAuthor(author.user.id)}
                  disabled={removeAuthor.isPending}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Add Author Section */}
        {!isAddingAuthor ? (
          <Button
            variant="outline"
            onClick={() => setIsAddingAuthor(true)}
            className="w-full flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Author
          </Button>
        ) : (
          <div className="space-y-3 p-3 border rounded-lg bg-gray-50 relative">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                className="flex-1"
              />
            </div>
            
            {isSearchingUsers && searchQuery.length >= 2 && (
              <p className="text-sm text-gray-500">Searching for users...</p>
            )}
            
            {/* User Suggestions Dropdown */}
            {showSuggestions && filteredSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-10 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {filteredSuggestions.map((user: any) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                    onClick={() => {
                      setSelectedUser(user);
                      setSearchQuery(user.email);
                      setShowSuggestions(false);
                    }}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.image || ""} />
                      <AvatarFallback>
                        {user.name?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">{user.role}</Badge>
                  </div>
                ))}
              </div>
            )}
            
            {/* No Results Message */}
            {searchQuery.length >= 2 && !isSearchingUsers && filteredSuggestions?.length === 0 && (
              <p className="text-sm text-red-600">No users found matching "{searchQuery}"</p>
            )}
            
            {/* Selected User Preview */}
            {selectedUser && (
              <div className="flex items-center gap-3 p-2 bg-white rounded border">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={selectedUser.image || ""} />
                  <AvatarFallback>
                    {selectedUser.name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">{selectedUser.name}</p>
                  <p className="text-xs text-gray-500">{selectedUser.email}</p>
                </div>
                <Badge variant="secondary" className="text-xs">{selectedUser.role}</Badge>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => selectedUser && handleAddAuthor(selectedUser)}
                disabled={!selectedUser || addAuthor.isPending}
                className="flex items-center gap-1"
              >
                {addAuthor.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-3 w-3" />
                    Add
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsAddingAuthor(false);
                  setSearchQuery("");
                  setSelectedUser(null);
                  setShowSuggestions(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
