"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/app/_components/search-bar";
import { ThemeToggle } from "@/components/theme-toggle";
import { ModelIndicatorCompact } from "@/components/model-indicator";

export function Navigation() {
  const { data: session } = useSession();

  return (
    <nav className="border-b bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-foreground">
              Veridict
            </Link>
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                href="/"
                className="text-muted-foreground hover:text-foreground px-3 py-2 text-sm font-medium"
              >
                Feed
              </Link>
              <Link
                href="/create-post"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all"
              >
                <span>✨</span>
                AI Create
              </Link>
              <Link
                href="/test-ai"
                className="text-muted-foreground hover:text-foreground px-3 py-2 text-sm font-medium"
              >
                Test AI
              </Link>
              {session && (
                <>
                  <Link
                    href="/dashboard"
                    className="text-muted-foreground hover:text-foreground px-3 py-2 text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/llm-management"
                    className="text-muted-foreground hover:text-foreground px-3 py-2 text-sm font-medium"
                  >
                    AI Models
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-8">
            <Suspense fallback={<div className="h-10 bg-muted rounded-md animate-pulse" />}>
              <SearchBar placeholder="Search posts..." showFilters={false} />
            </Suspense>
          </div>

          <div className="flex items-center space-x-4">
            <ModelIndicatorCompact />
            <ThemeToggle />
            {session ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-foreground">
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
