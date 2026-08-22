'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';

/**
 * Paints the phone's browser chrome to match the page, following the *toggle*
 * rather than the OS.
 *
 * A static pair of media-scoped `<meta name="theme-color">` tags in the
 * layout's `viewport` export would answer to `prefers-color-scheme` alone, so
 * a visitor on a light phone who switched the site to dark got an ink page
 * under a white address bar. `resolvedTheme` collapses `system` to the theme
 * actually on screen, which is what the chrome should match.
 *
 * This owns its tag outright — creates it, then only ever rewrites `content`.
 * An earlier version removed the tags Next had rendered and appended its own;
 * those nodes belong to React's tree, and pulling them out from under it threw
 * `Cannot read properties of null (reading 'removeChild')` on the next
 * reconciliation. Nothing here touches a node React rendered, which is also
 * why the `viewport` export deliberately declares no `themeColor` at all.
 *
 * The trade is that the chrome is unstyled until hydration — a frame or two,
 * and self-correcting — rather than wrong for as long as the page is open.
 */
const SURFACE = { light: '#fcfcfd', dark: '#1b191f' } as const;
const OWNED_ATTR = 'data-theme-color-sync';

export function ThemeColorSync() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (resolvedTheme !== 'light' && resolvedTheme !== 'dark') return;

    let meta = document.head.querySelector<HTMLMetaElement>(`meta[${OWNED_ATTR}]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.setAttribute(OWNED_ATTR, '');
      document.head.appendChild(meta);
    }
    meta.content = SURFACE[resolvedTheme];
  }, [resolvedTheme]);

  return null;
}
