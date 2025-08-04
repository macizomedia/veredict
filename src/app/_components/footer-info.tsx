"use client";

import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export function FooterInfo() {
  const currentYear = new Date().getFullYear();
  
  return (
    <div className="mt-6 p-4 text-xs text-muted-foreground space-y-3">
      {/* Copyright and Version */}
      <div className="text-center space-y-1">
        <p>© {currentYear} Veridict</p>
        <p className="text-[10px] opacity-75">Version 1.0.0</p>
      </div>
      
      <Separator />
      
      {/* Links */}
      <div className="flex flex-col space-y-2 text-center">
        <Link 
          href="/terms" 
          className="hover:text-foreground transition-colors"
        >
          Terms of Service
        </Link>
        <Link 
          href="/privacy" 
          className="hover:text-foreground transition-colors"
        >
          Privacy Policy
        </Link>
        <Link 
          href="/about" 
          className="hover:text-foreground transition-colors"
        >
          About
        </Link>
      </div>
      
      <Separator />
      
      {/* Additional Info */}
      <div className="text-center text-[10px] opacity-60">
        <p>AI-powered editorial platform</p>
        <p>Built with transparency & integrity</p>
      </div>
    </div>
  );
}
