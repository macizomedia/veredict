"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserProfile } from "./user-profile";
import { UserPosts } from "./user-posts";
import { UserStats } from "./user-stats";
import { redirect } from "next/navigation";

export function DashboardContent() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  if (!session) {
    redirect("/api/auth/signin");
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="posts">My Posts</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          {session.user.role === "ADMIN" && (
            <TabsTrigger value="admin">Admin</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <UserStats />
        </TabsContent>

        <TabsContent value="posts" className="space-y-6">
          <UserPosts />
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <UserProfile />
        </TabsContent>

        {session.user.role === "ADMIN" && (
          <TabsContent value="admin" className="space-y-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900">Admin Panel</h3>
              <p className="text-gray-500 mt-2">
                Admin features will be implemented here.
              </p>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
