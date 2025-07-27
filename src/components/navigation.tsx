"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/app/_components/search-bar";

export function Navigation() {
  const { data: session } = useSession();

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Veridict
            </Link>
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                href="/"
                className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                Feed
              </Link>
              {session && (
                <>
                  <Link
                    href="/dashboard"
                    className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/posts/create"
                    className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                  >
                    Create Post
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-8">
            <SearchBar placeholder="Search posts..." showFilters={false} />
          </div>

          <div className="flex items-center space-x-4">
            {session ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">
                    {session.user?.name}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {session.user?.role || 'AUTHOR'}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {session.user?.reputation || 0} rep
                  </Badge>
                </div>
                <Link href="/api/auth/signout">
                  <Button variant="outline" size="sm">
                    Sign out
                  </Button>
                </Link>
              </div>
            ) : (
              <Link href="/api/auth/signin">
                <Button size="sm">Sign in</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
