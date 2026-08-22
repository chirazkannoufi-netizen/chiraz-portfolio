'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';

/**
 * Dark/light toggle.
 *
 * The `mounted` gate is not optional: on the server we cannot know the
 * resolved theme, so rendering the real icon would guarantee a hydration
 * mismatch. We render a same-sized placeholder instead, which also prevents
 * layout shift when the real button appears.
 */
export function ThemeToggle() {
  const t = useTranslations('theme');
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // The single post-hydration render is the entire point here: the server
  // cannot know the resolved theme, so the real icon must not be rendered
  // until after mount.
  // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration gate
  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === 'dark';

  if (!mounted) {
    return <div className="size-9 rounded-lg" aria-hidden="true" />;
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={t('toggle')}
      // Communicates state to screen readers, which a bare icon cannot.
      aria-pressed={isDark}
      title={isDark ? t('light') : t('dark')}
      className="group relative grid size-9 place-items-center rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-raised)] text-[var(--text-secondary)] transition-colors hover:text-[var(--accent)]"
    >
      <Sun
        className="size-4 rotate-0 scale-100 transition-transform duration-500 dark:-rotate-90 dark:scale-0"
        aria-hidden="true"
      />
      <Moon
        className="absolute size-4 rotate-90 scale-0 transition-transform duration-500 dark:rotate-0 dark:scale-100"
        aria-hidden="true"
      />
    </button>
  );
}
