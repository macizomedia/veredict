"use client";

import { PostsFeed } from "@/app/_components/posts-feed";
import { TrendingTopics } from "@/app/_components/trending-topics";
import { FooterInfo } from "@/app/_components/footer-info";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Two-column grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Main content area - PostsFeed */}
        <div className="md:col-span-3">
          <PostsFeed />
        </div>
        
        {/* Right sidebar */}
        <div className="md:col-span-1">
          <div className="sticky top-6 space-y-6">
            {/* Trending Topics */}
            <TrendingTopics />
            
            {/* Footer Information */}
            <FooterInfo />
          </div>
        </div>
      </div>
    </div>
  );
}
