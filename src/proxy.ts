import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

/**
 * Next.js 16 renamed `middleware.ts` → `proxy.ts`.
 * On Next.js 15 or earlier, rename this file to `src/middleware.ts` — the
 * contents are identical.
 *
 * Responsibilities:
 *  1. Negotiate the locale (cookie → Accept-Language → defaultLocale).
 *  2. Redirect `/` to `/{locale}` and rewrite locale-prefixed paths.
 */
export default createMiddleware(routing);

export const config = {
  // Skip API routes, Next internals, and anything with a file extension.
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
