import Link from 'next/link';

import './globals.css';

/**
 * Global 404 for paths that never matched a locale segment (e.g. /foo.php).
 *
 * Because the root layout lives at `app/[locale]/layout.tsx`, this file is
 * outside any layout and must render its own <html>/<body>. Deliberately
 * English-only: at this point we have no locale to trust.
 */
export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body className="grid min-h-dvh place-items-center bg-slate-950 px-6 text-center text-slate-100">
        <div>
          <p className="text-7xl font-bold text-sky-400">404</p>
          <h1 className="mt-4 text-2xl font-bold">Page not found</h1>
          <p className="mt-2 text-slate-400">That page doesn&apos;t exist.</p>
          <Link
            href="/en"
            className="mt-8 inline-flex h-11 items-center rounded-xl bg-sky-500 px-6 text-sm font-semibold text-slate-950"
          >
            Back to home
          </Link>
        </div>
      </body>
    </html>
  );
}
