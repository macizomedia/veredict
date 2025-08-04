import { api } from "@/trpc/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VoteButtons } from "@/app/_components/vote-buttons";
import { ContentBlocks } from "@/app/_components/content-blocks";
import { PostViewTracker } from "@/app/_components/post-view-tracker";
import { Comments } from "@/app/_components/comments";
import { notFound } from "next/navigation";
import { auth } from "@/server/auth";
import { Sparkles, Zap } from "lucide-react";

interface PostPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const resolvedParams = await params;
  const postId = parseInt(resolvedParams.id);
  
  if (isNaN(postId)) {
    notFound();
  }

  try {
    const session = await auth();
    const post = await api.post.getById({ id: postId });

    if (!post) {
      notFound();
    }

    // Only show published posts to non-authors
    if (post.status !== 'PUBLISHED' && (!session || !post.isAuthor)) {
      notFound();
    }

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <PostViewTracker postId={postId} />
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-3xl font-bold">{post.title}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={post.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                    {post.status}
                  </Badge>
                  <span className="text-sm text-gray-500">Version {post.version}</span>
                  {post.category && (
                    <Badge variant="outline">{post.category.name}</Badge>
                  )}
                  {/* AI Generated Indicator */}
                  {post.contentBlocks && post.contentBlocks.blocks && (
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI Generated
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-right text-sm text-gray-500">
                <div>{post.minRead} min read</div>
                <div>{new Date(post.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* AI Prompt */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">AI Generation Details</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-700">Prompt:</span>
                  <p className="text-blue-800 mt-1">{post.prompt}</p>
                </div>
                {(post.tone || post.style) && (
                  <div className="flex gap-4 text-sm">
                    {post.tone && (
                      <div>
                        <span className="font-medium text-gray-700">Tone:</span>
                        <span className="ml-1 capitalize text-gray-600">{post.tone.toLowerCase()}</span>
                      </div>
                    )}
                    {post.style && (
                      <div>
                        <span className="font-medium text-gray-700">Style:</span>
                        <span className="ml-1 capitalize text-gray-600">{post.style.toLowerCase()}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="prose max-w-none">
              {post.contentBlocks && post.contentBlocks.blocks && Array.isArray(post.contentBlocks.blocks) ? (
                <ContentBlocks blocks={post.contentBlocks.blocks} />
              ) : post.contentBlocks && typeof post.contentBlocks === 'object' && 'content' in post.contentBlocks ? (
                <div className="text-gray-900 leading-relaxed">
                  {(post.contentBlocks as { content: string }).content.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4">
                      {paragraph}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 italic">
                  Content will be generated based on the prompt above. 
                  This is where the AI-generated article would appear.
                </p>
              )}
            </div>

            {/* Voting - Only show for published posts */}
            {post.status === 'PUBLISHED' && (
              <div className="flex items-center gap-4 py-4 border-y">
                <VoteButtons
                  postId={post.id}
                  upVotes={post.upVotes}
                  downVotes={post.downVotes}
                  userVote={post.userVote}
                  isAuthor={post.isAuthor}
                  status={post.status}
                />
                <div className="text-sm text-gray-500">
                  {post.isAuthor && "(You cannot vote on your own post)"}
                  {!session && "(Sign in to vote)"}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="border-t pt-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Votes</span>
                  <p className="text-sm">
                    <span className="text-green-600">↑ {post.upVotes}</span>{" "}
                    <span className="text-red-600">↓ {post.downVotes}</span>
                  </p>
                </div>
                {post.analytics && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Views</span>
                    <p className="text-sm">{post.analytics.views}</p>
                  </div>
                )}
                <div>
                  <span className="text-sm font-medium text-gray-500">Read Time</span>
                  <p className="text-sm">{post.minRead} min</p>
                </div>
              </div>
            </div>

            {/* Authors */}
            {post.authors && post.authors.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Authors</h3>
                <div className="flex flex-wrap gap-2">
                  {post.authors.map((author: any) => (
                    <div key={author.user.id} className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1">
                      {author.user.image && (
                        <img 
                          src={author.user.image} 
                          alt={author.user.name || 'Author'} 
                          className="w-6 h-6 rounded-full"
                        />
                      )}
                      <span className="text-sm font-medium">{author.user.name || 'Anonymous'}</span>
                      <Badge variant="secondary" className="text-xs">
                        {author.user.role || 'AUTHOR'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sources */}
            {post.sources && post.sources.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Sources</h3>
                <div className="space-y-2">
                  {post.sources.map((source: any) => (
                    <div key={source.id} className="border-l-4 border-blue-200 pl-4">
                      <a 
                        href={source.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {source.title || source.url}
                      </a>
                      {source.description && (
                        <p className="text-sm text-gray-600 mt-1">{source.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Labels */}
            {post.labels && post.labels.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Content Labels</h3>
                <div className="space-y-2">
                  {post.labels.map((label: any) => (
                    <div key={label.id} className="bg-yellow-50 p-3 rounded">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{label.label}</Badge>
                      </div>
                      <p className="text-sm text-gray-700">{label.justification}</p>
                      {label.sourceUrl && (
                        <a 
                          href={label.sourceUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Source
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comments Section - Only show for published posts */}
        {post.status === 'PUBLISHED' && (
          <Comments postId={postId} />
        )}
      </div>
    );
  } catch (error) {
    console.error('Error loading post:', error);
    notFound();
  }
}
