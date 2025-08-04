"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { ClientOnly } from "@/components/client-only";
import { Button } from "@/components/ui/button";

export default function ThemeTestPage() {
  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Fintech Slate Corporate Theme</h1>
          <p className="text-muted-foreground mt-2">Professional, clean, and trustworthy aesthetic for financial/political content</p>
        </div>
        <ClientOnly fallback={
          <div className="w-9 h-8 bg-muted rounded animate-pulse"></div>
        }>
          <ThemeToggle />
        </ClientOnly>
      </div>

      {/* Surface Hierarchy Test */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">🎨 Surface Hierarchy (8% → 18% → 28% → 38% → 48%)</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-background border-4 border-red-500 rounded-lg p-6 space-y-2">
            <h3 className="text-lg font-semibold">Background</h3>
            <div className="w-full h-12 bg-background rounded border-2 border-white/20"></div>
            <p className="text-xs text-red-400">8% lightness</p>
            <Button variant="container-ghost" size="sm">Test Button</Button>
          </div>
          
          <div className="bg-card border-4 border-blue-500 rounded-lg p-6 space-y-2">
            <h3 className="text-lg font-semibold">Card</h3>
            <div className="w-full h-12 bg-card rounded border-2 border-white/20"></div>
            <p className="text-xs text-blue-400">18% lightness</p>
            <Button variant="container-subtle" size="sm">Test Button</Button>
          </div>
          
          <div className="bg-secondary border-4 border-green-500 rounded-lg p-6 space-y-2">
            <h3 className="text-lg font-semibold text-secondary-foreground">Secondary</h3>
            <div className="w-full h-12 bg-secondary rounded border-2 border-white/20"></div>
            <p className="text-xs text-green-400">28% lightness</p>
            <Button variant="container-elevated" size="sm">Test Button</Button>
          </div>
          
          <div className="bg-muted border-4 border-yellow-500 rounded-lg p-6 space-y-2">
            <h3 className="text-lg font-semibold">Muted</h3>
            <div className="w-full h-12 bg-muted rounded border-2 border-white/20"></div>
            <p className="text-xs text-yellow-400">38% lightness</p>
            <Button variant="container-ghost" size="sm">Test Button</Button>
          </div>
          
          <div className="bg-accent border-4 border-purple-500 rounded-lg p-6 space-y-2">
            <h3 className="text-lg font-semibold text-accent-foreground">Accent</h3>
            <div className="w-full h-12 bg-accent rounded border-2 border-white/20"></div>
            <p className="text-xs text-purple-400">48% lightness</p>
            <Button variant="container-subtle" size="sm">Test Button</Button>
          </div>
        </div>
      </div>

      {/* Button Comparison */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">🎯 Button System Comparison</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-background border-4 border-red-500 rounded-lg p-6 space-y-3">
            <h4 className="font-semibold">Container: bg-background (8%)</h4>
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-red-400">Semantic Buttons:</h5>
              <div className="space-y-1">
                <Button size="sm">Primary</Button>
                <Button variant="secondary" size="sm">Secondary</Button>
                <Button variant="ghost" size="sm">Ghost</Button>
              </div>
              <h5 className="text-sm font-medium text-red-400 mt-3">Container-Aware:</h5>
              <div className="space-y-1">
                <Button variant="container-subtle" size="sm">Subtle</Button>
                <Button variant="container-elevated" size="sm">Elevated</Button>
                <Button variant="container-ghost" size="sm">Ghost</Button>
              </div>
            </div>
          </div>
          
          <div className="bg-secondary border-4 border-green-500 rounded-lg p-6 space-y-3">
            <h4 className="font-semibold">Container: bg-secondary (28%)</h4>
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-green-400">Semantic Buttons:</h5>
              <div className="space-y-1">
                <Button size="sm">Primary</Button>
                <Button variant="secondary" size="sm">Secondary</Button>
                <Button variant="ghost" size="sm">Ghost</Button>
              </div>
              <h5 className="text-sm font-medium text-green-400 mt-3">Container-Aware:</h5>
              <div className="space-y-1">
                <Button variant="container-subtle" size="sm">Subtle</Button>
                <Button variant="container-elevated" size="sm">Elevated</Button>
                <Button variant="container-ghost" size="sm">Ghost</Button>
              </div>
            </div>
          </div>

          <div className="bg-accent border-4 border-purple-500 rounded-lg p-6 space-y-3">
            <h4 className="font-semibold text-accent-foreground">Container: bg-accent (48%)</h4>
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-purple-400">Semantic Buttons:</h5>
              <div className="space-y-1">
                <Button size="sm">Primary</Button>
                <Button variant="secondary" size="sm">Secondary</Button>
                <Button variant="ghost" size="sm">Ghost</Button>
              </div>
              <h5 className="text-sm font-medium text-purple-400 mt-3">Container-Aware:</h5>
              <div className="space-y-1">
                <Button variant="container-subtle" size="sm">Subtle</Button>
                <Button variant="container-elevated" size="sm">Elevated</Button>
                <Button variant="container-ghost" size="sm">Ghost</Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Button Guide */}
      <div className="bg-card border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">📋 Button Usage Guide</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="font-medium text-primary mb-2">Semantic Buttons (Fixed Colors)</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li><code>default</code> - Primary brand actions</li>
              <li><code>secondary</code> - Secondary actions</li>
              <li><code>destructive</code> - Delete/dangerous actions</li>
              <li><code>outline</code> - Neutral actions</li>
              <li><code>ghost</code> - Minimal actions</li>
              <li><code>link</code> - Text links</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-primary mb-2">Container-Aware Buttons (Adaptive)</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li><code>container-subtle</code> - Light overlay on any background</li>
              <li><code>container-elevated</code> - Subtle elevation on any background</li>
              <li><code>container-ghost</code> - Transparent with hover reveal</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
