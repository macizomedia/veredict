"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Send } from "lucide-react";
import { CommentItem } from "./comment-item";
import Link from "next/link";

interface CommentsProps {
  postId: number;
}

export function Comments({ postId }: CommentsProps) {
  const { data: session } = useSession();
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { 
    data: comments, 
    isLoading, 
    refetch: refetchComments 
  } = api.comment.getByPostId.useQuery({ postId });

  const { data: commentCount } = api.comment.getCount.useQuery({ postId });

  const createComment = api.comment.create.useMutation({
    onSuccess: () => {
      setNewComment("");
      setIsSubmitting(false);
      refetchComments();
    },
    onError: (error) => {
      setIsSubmitting(false);
      alert(`Error posting comment: ${error.message}`);
    },
  });

  const handleSubmit = () => {
    if (newComment.trim().length === 0) {
      alert("Comment cannot be empty");
      return;
    }

    setIsSubmitting(true);
    createComment.mutate({
      postId,
      content: newComment.trim(),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Comments ({commentCount || 0})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Comment Form */}
        {session ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={session.user.image || ""} />
                <AvatarFallback>
                  {session.user.name?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts on this post..."
                  maxLength={1000}
                  rows={3}
                  onKeyDown={handleKeyDown}
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {newComment.length}/1000 characters • Press Ctrl+Enter to submit
                  </span>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || newComment.trim().length === 0}
                    size="sm"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                        Posting...
                      </>
                    ) : (
                      <>
                        <Send className="h-3 w-3 mr-2" />
                        Post Comment
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <MessageCircle className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600 mb-3">Sign in to join the conversation</p>
            <Link href="/api/auth/signin">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {!comments || comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No comments yet</p>
              <p className="text-sm text-gray-400">
                Be the first to share your thoughts!
              </p>
            </div>
          ) : (
            <>
              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-900 mb-4">
                  {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
                </h3>
                <div className="space-y-4">
                  {comments.map((comment: any) => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      onUpdate={refetchComments}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
