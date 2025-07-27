"use client";

import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { History, Calendar, User, FileText } from "lucide-react";
import Link from "next/link";

interface PostVersionsProps {
  postId: number;
}

export function PostVersions({ postId }: PostVersionsProps) {
  const { data: versions, isLoading } = api.post.getVersions.useQuery({ postId });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Version History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!versions || versions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Version History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No version history available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Version History ({versions.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {versions.map((version: any) => (
            <div
              key={version.id}
              className={`p-4 border rounded-lg ${
                version.isLatest ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge variant={version.isLatest ? 'default' : 'secondary'}>
                    Version {version.version}
                  </Badge>
                  {version.isLatest && (
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      Current
                    </Badge>
                  )}
                  <Badge variant="outline">{version.status}</Badge>
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  {new Date(version.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="mb-3">
                <h4 className="font-medium text-gray-900 mb-1">{version.title}</h4>
                {version.summaryOfChanges && (
                  <p className="text-sm text-gray-600 italic">
                    "{version.summaryOfChanges}"
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <div className="flex -space-x-1">
                    {version.authors?.slice(0, 3).map((author: any, index: number) => (
                      <Avatar key={author.user.id} className="h-6 w-6 border-2 border-white">
                        <AvatarImage src={author.user.image || ""} />
                        <AvatarFallback className="text-xs">
                          {author.user.name?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {version.authors && version.authors.length > 3 && (
                      <div className="h-6 w-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                        <span className="text-xs text-gray-600">
                          +{version.authors.length - 3}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {version.authors?.length || 0} author(s)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {version.isLatest ? (
                    <Badge variant="outline" className="text-xs">
                      Current Version
                    </Badge>
                  ) : (
                    <Link href={`/posts/${version.id}`}>
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        View
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
