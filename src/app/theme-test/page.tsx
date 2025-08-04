"use client";

import React from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { ClientOnly } from "@/components/client-only";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

export default function ThemeTestPage() {
  return (
    <div className="min-h-screen p-8 space-y-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-4">
            <h1 className="text-4xl font-bold">AbQuanta News Design System</h1>
            <ThemeToggle />
          </div>
          <p className="text-muted-foreground text-lg">Clean shadcn/ui components with Fintech Slate theme</p>
        </div>

        {/* Surface Hierarchy Test */}
        <Card>
          <CardHeader>
            <CardTitle>Surface Hierarchy Test</CardTitle>
            <CardDescription>Testing the 5-tier surface system with clean components</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-background p-4 rounded-lg border">
                <h3 className="font-semibold mb-2">Background Surface</h3>
                <p className="text-sm text-muted-foreground">Deepest level</p>
              </div>
              <div className="bg-card p-4 rounded-lg border">
                <h3 className="font-semibold mb-2">Card Surface</h3>
                <p className="text-sm text-muted-foreground">Primary content</p>
              </div>
              <div className="bg-secondary p-4 rounded-lg border">
                <h3 className="font-semibold mb-2">Secondary Surface</h3>
                <p className="text-sm text-muted-foreground">Secondary content</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Button Variants */}
        <Card>
          <CardHeader>
            <CardTitle>Button Components</CardTitle>
            <CardDescription>All button variants with clean shadcn/ui styling</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="default">Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
              <Button size="sm">Small</Button>
              <Button size="lg">Large</Button>
            </div>
          </CardContent>
        </Card>

        {/* Form Components */}
        <Card>
          <CardHeader>
            <CardTitle>Form Components</CardTitle>
            <CardDescription>Input fields, selects, and form controls</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter your email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="politics">Politics</SelectItem>
                    <SelectItem value="economy">Economy</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="notifications" />
              <Label htmlFor="notifications">Enable notifications</Label>
            </div>
          </CardContent>
        </Card>

        {/* Badges and Status */}
        <Card>
          <CardHeader>
            <CardTitle>Status Indicators</CardTitle>
            <CardDescription>Badges and status components</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Example */}
        <Card>
          <CardHeader>
            <CardTitle>Navigation Tabs</CardTitle>
            <CardDescription>Tab component for content organization</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="mt-4">
                <p className="text-muted-foreground">Overview content goes here...</p>
              </TabsContent>
              <TabsContent value="analytics" className="mt-4">
                <p className="text-muted-foreground">Analytics dashboard content...</p>
              </TabsContent>
              <TabsContent value="reports" className="mt-4">
                <p className="text-muted-foreground">Reports and insights...</p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Alert>
          <AlertDescription>
            🎉 Success! All shadcn/ui components are now cleanly installed and working with your Fintech Slate theme.
          </AlertDescription>
        </Alert>

        <Separator />

        {/* Usage Guide */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Guide</CardTitle>
            <CardDescription>How to use these clean shadcn/ui components</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose prose-sm max-w-none">
              <h4 className="font-semibold">Available Components:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <code>Button</code> - Multiple variants (default, secondary, destructive, outline, ghost, link)</li>
                <li>• <code>Card</code> - Container with header, title, description, content, footer</li>
                <li>• <code>Input</code> & <code>Label</code> - Form controls</li>
                <li>• <code>Switch</code> - Toggle switches for settings</li>
                <li>• <code>Select</code> - Dropdown selections</li>
                <li>• <code>Badge</code> - Status and category indicators</li>
                <li>• <code>Tabs</code> - Content organization</li>
                <li>• <code>Alert</code> - Notifications and messages</li>
                <li>• <code>Avatar</code>, <code>DropdownMenu</code>, <code>Popover</code>, <code>Command</code> - Interactive elements</li>
              </ul>
              
              <h4 className="font-semibold mt-4">Theme Variables:</h4>
              <p className="text-sm text-muted-foreground">
                All components automatically use your Fintech Slate theme variables: 
                <code>--background</code>, <code>--card</code>, <code>--primary</code>, <code>--secondary</code>, <code>--muted</code>, etc.
              </p>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
