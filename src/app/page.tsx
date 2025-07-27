import { PostsFeed } from "@/app/_components/posts-feed";

export default function Home() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Welcome to Veridict
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Discover credible, transparent, and well-sourced content powered by AI
        </p>
      </div>
      
      <PostsFeed />
    </div>
  );
}
