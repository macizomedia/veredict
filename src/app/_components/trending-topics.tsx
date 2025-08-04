"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Hash } from "lucide-react";

const trendingData = [
  {
    category: "Technology",
    topic: "#ReactiveDesign",
    posts: "12.8K"
  },
  {
    category: "Politics",
    topic: "#WesternHemisphere",
    posts: "8.4K"
  },
  {
    category: "AI & Tech",
    topic: "#LangChain",
    posts: "6.2K"
  },
  {
    category: "Economics",
    topic: "#TradePolicy",
    posts: "4.7K"
  },
  {
    category: "Security",
    topic: "#BorderCooperation",
    posts: "3.1K"
  },
  {
    category: "Environment",
    topic: "#ClimateAction",
    posts: "2.9K"
  }
];

export function TrendingTopics() {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-orange-500" />
          Trending in Leipzig
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {trendingData.map((item, index) => (
            <div
              key={index}
              className="group p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {/* Category */}
                  <p className="text-xs text-muted-foreground font-medium mb-1">
                    {item.category} · Trending
                  </p>
                  
                  {/* Topic */}
                  <p className="font-semibold text-foreground group-hover:text-blue-600 transition-colors flex items-center gap-1 truncate">
                    <Hash className="h-3 w-3 flex-shrink-0" />
                    {item.topic.replace('#', '')}
                  </p>
                  
                  {/* Engagement metric */}
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.posts} Posts
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Show More Link */}
        <div className="mt-4 pt-3 border-t">
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
            Show more trends
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
