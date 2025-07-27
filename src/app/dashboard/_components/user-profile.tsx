"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Shield, Calendar, Edit } from "lucide-react";

export function UserProfile() {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const { data: profile, isLoading } = api.user.getProfile.useQuery();

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-32"></div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-gray-200 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-48"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-gray-500">Failed to load profile data.</p>
        </CardContent>
      </Card>
    );
  }

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "destructive";
      case "EDITOR":
        return "default";
      default:
        return "secondary";
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Full platform access with user and content management capabilities";
      case "EDITOR":
        return "Enhanced content creation and review permissions";
      case "AUTHOR":
        return "Standard content creation and interaction permissions";
      default:
        return "Standard user permissions";
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            {isEditing ? "Cancel" : "Edit"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar and Basic Info */}
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.image || ""} alt={profile.name || "User"} />
              <AvatarFallback className="text-lg">
                {getInitials(profile.name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-gray-600">
                    Display Name
                  </Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      defaultValue={profile.name || ""}
                      className="mt-1"
                      placeholder="Enter your display name"
                    />
                  ) : (
                    <p className="text-lg mt-1">{profile.name || "Not set"}</p>
                  )}
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Email Address
                  </Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <p className="text-lg">{profile.email}</p>
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-2 pt-2">
                  <Button size="sm">Save Changes</Button>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Account Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-sm font-medium text-gray-600">Role</Label>
              <div className="mt-2">
                <Badge variant={getRoleBadgeVariant(profile.role)} className="mb-2">
                  {profile.role}
                </Badge>
                <p className="text-sm text-gray-500">
                  {getRoleDescription(profile.role)}
                </p>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-600">Reputation Score</Label>
              <div className="mt-2">
                <div className="text-2xl font-bold text-green-600">
                  {profile.reputation}
                </div>
                <p className="text-sm text-gray-500">
                  Earned through quality content and community engagement
                </p>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-600">Member Since</Label>
              <div className="flex items-center gap-2 mt-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <p className="text-lg">
                  {new Date(profile.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-600">Account Status</Label>
              <div className="mt-2">
                <Badge variant="default">Active</Badge>
                <p className="text-sm text-gray-500 mt-1">
                  Your account is in good standing
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {profile.stats.totalPosts}
              </div>
              <div className="text-sm text-blue-600 font-medium">Posts Created</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {profile.stats.totalVotes}
              </div>
              <div className="text-sm text-green-600 font-medium">Votes Cast</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {profile.stats.totalComments}
              </div>
              <div className="text-sm text-purple-600 font-medium">Comments Made</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
