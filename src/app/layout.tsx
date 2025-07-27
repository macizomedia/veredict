import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";
import { AuthProvider } from "@/components/auth-provider";
import { Navigation } from "@/components/navigation";

export const metadata: Metadata = {
  title: "Veridict - AI-Powered Content Platform",
  description: "Create credible, transparent, and well-sourced content with AI assistance.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body className="min-h-screen bg-gray-50">
        <TRPCReactProvider>
          <AuthProvider>
            <Navigation />
            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </main>
          </AuthProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
