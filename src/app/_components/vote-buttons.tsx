"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoteButtonsProps {
  postId: number;
  upVotes: number;
  downVotes: number;
  userVote?: "UPVOTE" | "DOWNVOTE" | null;
  isAuthor?: boolean;
  status: string;
  className?: string;
}

export function VoteButtons({ 
  postId, 
  upVotes, 
  downVotes, 
  userVote, 
  isAuthor,
  status,
  className 
}: VoteButtonsProps) {
  const { data: session } = useSession();
  const utils = api.useUtils();
  const [optimisticVotes, setOptimisticVotes] = useState({ upVotes, downVotes, userVote });

  const voteMutation = api.post.vote.useMutation({
    onMutate: async ({ voteType }) => {
      // Cancel outgoing refetches
      await utils.post.getFeed.cancel();

      // Optimistically update vote counts
      let newUpVotes = optimisticVotes.upVotes;
      let newDownVotes = optimisticVotes.downVotes;
      let newUserVote = optimisticVotes.userVote;

      if (optimisticVotes.userVote === voteType) {
        // Remove vote
        if (voteType === "UPVOTE") {
          newUpVotes -= 1;
        } else {
          newDownVotes -= 1;
        }
        newUserVote = null;
      } else if (optimisticVotes.userVote && optimisticVotes.userVote !== voteType) {
        // Switch vote
        if (voteType === "UPVOTE") {
          newUpVotes += 1;
          newDownVotes -= 1;
        } else {
          newDownVotes += 1;
          newUpVotes -= 1;
        }
        newUserVote = voteType;
      } else {
        // Add new vote
        if (voteType === "UPVOTE") {
          newUpVotes += 1;
        } else {
          newDownVotes += 1;
        }
        newUserVote = voteType;
      }

      setOptimisticVotes({
        upVotes: newUpVotes,
        downVotes: newDownVotes,
        userVote: newUserVote,
      });

      return { previousVotes: optimisticVotes };
    },
    onError: (err, newVote, context) => {
      // Revert optimistic update on error
      if (context?.previousVotes) {
        setOptimisticVotes(context.previousVotes);
      }
    },
    onSuccess: (data) => {
      // Update with actual server data
      setOptimisticVotes({
        upVotes: data.upVotes,
        downVotes: data.downVotes,
        userVote: data.userVote,
      });
      // Invalidate and refetch posts
      utils.post.getFeed.invalidate();
    },
  });

  const handleVote = (voteType: "UPVOTE" | "DOWNVOTE") => {
    if (!session) {
      // Redirect to sign in
      window.location.href = "/api/auth/signin";
      return;
    }

    if (status !== "PUBLISHED") {
      return; // Don't allow voting on unpublished posts
    }

    voteMutation.mutate({ postId, voteType });
  };

  const canVote = status === "PUBLISHED";
  const isUpvoted = optimisticVotes.userVote === "UPVOTE";
  const isDownvoted = optimisticVotes.userVote === "DOWNVOTE";

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote("UPVOTE")}
        disabled={voteMutation.isPending || !canVote}
        className={cn(
          "h-8 px-2 text-sm",
          isUpvoted ? "text-green-600 bg-green-50" : "text-gray-500 hover:text-green-600"
        )}
      >
        <ChevronUp className="h-4 w-4" />
        <span className="ml-1">{optimisticVotes.upVotes}</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote("DOWNVOTE")}
        disabled={voteMutation.isPending || !canVote}
        className={cn(
          "h-8 px-2 text-sm",
          isDownvoted ? "text-red-600 bg-red-50" : "text-gray-500 hover:text-red-600"
        )}
      >
        <ChevronDown className="h-4 w-4" />
        <span className="ml-1">{optimisticVotes.downVotes}</span>
      </Button>

      {!canVote && (
        <span className="text-xs text-gray-400 ml-2">
          Only published posts can be voted on
        </span>
      )}

      {isAuthor && (
        <span className="text-xs text-blue-500 ml-2">
          Author
        </span>
      )}
    </div>
  );
}
