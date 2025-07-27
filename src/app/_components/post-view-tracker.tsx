"use client";

import { useEffect, useState } from "react";
import { api } from "@/trpc/react";

interface PostViewTrackerProps {
  postId: number;
}

export function PostViewTracker({ postId }: PostViewTrackerProps) {
  const [hasTracked, setHasTracked] = useState(false);
  const incrementViews = api.post.incrementViews.useMutation();

  useEffect(() => {
    // Check if we've already tracked this post in this session
    const viewKey = `post_view_${postId}`;
    const hasViewedInSession = typeof window !== 'undefined' ? sessionStorage.getItem(viewKey) : null;
    
    // Only increment views once per session for this post
    if (!hasTracked && !hasViewedInSession && !incrementViews.isPending) {
      setHasTracked(true);
      
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(viewKey, 'true');
      }
      
      // Delay the API call to ensure component is stable
      const timer = setTimeout(() => {
        incrementViews.mutate({ id: postId }, {
          onError: (error) => {
            console.error("Failed to track view:", error);
            // Reset tracking on error
            setHasTracked(false);
            if (typeof window !== 'undefined') {
              sessionStorage.removeItem(viewKey);
            }
          }
        });
      }, 1000); // Increased delay

      return () => clearTimeout(timer);
    }
  }, [postId, hasTracked, incrementViews.isPending]);

  // This component doesn't render anything
  return null;
}
