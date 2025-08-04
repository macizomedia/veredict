"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="dark"
      themes={["light", "dark"]}
      enableSystem={false}
      disableTransitionOnChange={false}
      storageKey="abquanta-theme"
      enableColorScheme={false}
    >
      {children}
    </NextThemeProvider>
  );
}
