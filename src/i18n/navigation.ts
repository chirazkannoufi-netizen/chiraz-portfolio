import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

/**
 * Locale-aware drop-in replacements for next/link and next/navigation.
 * Always import from here — using next/link directly drops the locale prefix.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
