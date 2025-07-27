import { CreatePostForm } from "@/app/_components/post";

export default function CreatePostPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Post</h1>
        <p className="text-gray-600 mt-2">
          Create a new content piece for the Veridict platform
        </p>
      </div>
      
      <CreatePostForm />
    </div>
  );
}
