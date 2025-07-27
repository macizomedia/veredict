import { DashboardContent } from "./_components/dashboard-content";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your posts, view analytics, and track your activity.
          </p>
        </div>
        <DashboardContent />
      </div>
    </div>
  );
}
