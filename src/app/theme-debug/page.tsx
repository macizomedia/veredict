"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { ClientOnly } from "@/components/client-only";

export default function ThemeDebugPage() {
  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">CSS Variables Debug</h1>
          <p className="text-muted-foreground mt-2">Testing CSS variable mapping from globals.css → Tailwind</p>
        </div>
        <ClientOnly fallback={
          <div className="w-9 h-8 bg-muted rounded animate-pulse"></div>
        }>
          <ThemeToggle />
        </ClientOnly>
      </div>

      {/* Direct CSS Style Test */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Direct CSS Style Test</h2>
        <div className="grid grid-cols-5 gap-4">
          <div 
            style={{ backgroundColor: `hsl(var(--background))` }} 
            className="h-20 border-4 border-red-500 rounded flex items-center justify-center text-white text-xs p-2"
          >
            Direct CSS: --background
          </div>
          <div 
            style={{ backgroundColor: `hsl(var(--card))` }} 
            className="h-20 border-4 border-blue-500 rounded flex items-center justify-center text-white text-xs p-2"
          >
            Direct CSS: --card
          </div>
          <div 
            style={{ backgroundColor: `hsl(var(--secondary))` }} 
            className="h-20 border-4 border-green-500 rounded flex items-center justify-center text-white text-xs p-2"
          >
            Direct CSS: --secondary
          </div>
          <div 
            style={{ backgroundColor: `hsl(var(--muted))` }} 
            className="h-20 border-4 border-yellow-500 rounded flex items-center justify-center text-white text-xs p-2"
          >
            Direct CSS: --muted
          </div>
          <div 
            style={{ backgroundColor: `hsl(var(--accent))` }} 
            className="h-20 border-4 border-purple-500 rounded flex items-center justify-center text-white text-xs p-2"
          >
            Direct CSS: --accent
          </div>
        </div>
      </div>

      {/* Tailwind Classes Test */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Tailwind Classes Test</h2>
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-background h-20 border-4 border-red-500 rounded flex items-center justify-center text-white text-xs p-2">
            Tailwind: bg-background
          </div>
          <div className="bg-card h-20 border-4 border-blue-500 rounded flex items-center justify-center text-white text-xs p-2">
            Tailwind: bg-card
          </div>
          <div className="bg-secondary h-20 border-4 border-green-500 rounded flex items-center justify-center text-white text-xs p-2">
            Tailwind: bg-secondary
          </div>
          <div className="bg-muted h-20 border-4 border-yellow-500 rounded flex items-center justify-center text-white text-xs p-2">
            Tailwind: bg-muted
          </div>
          <div className="bg-accent h-20 border-4 border-purple-500 rounded flex items-center justify-center text-white text-xs p-2">
            Tailwind: bg-accent
          </div>
        </div>
      </div>

      {/* Expected vs Actual */}
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Expected Values (Dark Mode)</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm font-mono">
          <div>
            <p className="font-semibold">--background</p>
            <p>220 15% 8%</p>
            <p className="text-xs text-muted-foreground">Should be darkest</p>
          </div>
          <div>
            <p className="font-semibold">--card</p>
            <p>220 10% 18%</p>
            <p className="text-xs text-muted-foreground">Lighter than bg</p>
          </div>
          <div>
            <p className="font-semibold">--secondary</p>
            <p>220 8% 28%</p>
            <p className="text-xs text-muted-foreground">Even lighter</p>
          </div>
          <div>
            <p className="font-semibold">--muted</p>
            <p>220 6% 38%</p>
            <p className="text-xs text-muted-foreground">More visible</p>
          </div>
          <div>
            <p className="font-semibold">--accent</p>
            <p>220 4% 48%</p>
            <p className="text-xs text-muted-foreground">Lightest surface</p>
          </div>
        </div>
      </div>
    </div>
  );
}
