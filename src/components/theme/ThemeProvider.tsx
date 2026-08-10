'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

/**
 * Thin wrapper so the theme configuration lives in one place.
 *
 * `attribute="class"` matches the `@custom-variant dark` rule in globals.css.
 * `defaultTheme="system"` honours the OS preference until the visitor
 * explicitly chooses — an explicit choice then persists in localStorage.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      // Kills the CSS transition flash when the class flips on <html>.
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
