import { PostManagement } from "@/app/_components/post-management";
import { notFound } from "next/navigation";
import { auth } from "@/server/auth";
import { api } from "@/trpc/server";

interface PostManagePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PostManagePage({ params }: PostManagePageProps) {
  const resolvedParams = await params;
  const postId = parseInt(resolvedParams.id);
  
  if (isNaN(postId)) {
    notFound();
  }

  try {
    const session = await auth();
    
    if (!session?.user) {
      // Redirect to sign in or show error
      return (
        <div className="max-w-4xl mx-auto py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
            <p className="text-gray-600">You need to sign in to manage posts.</p>
          </div>
        </div>
      );
    }

    // Check if post exists and user has permission
    const post = await api.post.getById({ id: postId });
    
    if (!post) {
      notFound();
    }

    const userRole = session.user.role;
    const isAuthor = post.authors?.some((author: any) => author.user.id === session.user.id);
    const canManage = isAuthor || userRole === 'EDITOR' || userRole === 'ADMIN';

    if (!canManage) {
      return (
        <div className="max-w-4xl mx-auto py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">You don&apos;t have permission to manage this post.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="mb-6">
          <nav className="text-sm breadcrumbs">
            <ol className="list-none p-0 inline-flex">
              <li className="flex items-center">
                <a href="/dashboard" className="text-blue-600 hover:text-blue-700">Dashboard</a>
                <span className="mx-2 text-gray-400">/</span>
              </li>
              <li className="flex items-center">
                <a href={`/posts/${postId}`} className="text-blue-600 hover:text-blue-700">Post</a>
                <span className="mx-2 text-gray-400">/</span>
              </li>
              <li className="text-gray-500">Manage</li>
            </ol>
          </nav>
        </div>
        
        <PostManagement postId={postId} />
      </div>
    );
  } catch (error) {
    console.error('Error loading post management:', error);
    notFound();
  }
}
