import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist, Noticia_Text, IBM_Plex_Sans, Oswald } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";
import { AuthProvider } from "@/components/auth-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: "Veridict - AI-Powered Content Platform",
  description: "Create credible, transparent, and well-sourced content with AI assistance.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const noticiaText = Noticia_Text({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-noticia-text",
});

const ibmPlex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-ibm-plex",
});

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-oswald",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} ${noticiaText.variable} ${ibmPlex.variable} ${oswald.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground font-sans">
        <TRPCReactProvider>
          <ThemeProvider>
            <AuthProvider>
              <Header>
                {children}
              </Header>
            </AuthProvider>
          </ThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
