import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { routing, getDirection, locales, type Locale } from '@/i18n/routing';
import { profile } from '@/content/profile';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ChatWidget } from '@/components/chat/ChatWidget';
import { CyberBackground } from '@/components/ui/CyberBackground';

import '../globals.css';

/**
 * This is the ROOT layout — every route lives under `/[locale]`, so this file
 * owns <html> and <body>. There is deliberately no `app/layout.tsx`.
 */

/** Pre-render all four locales at build time. */
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};

  const t = await getTranslations({ locale, namespace: 'meta' });
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://chiraz.dev';

  return {
    metadataBase: new URL(base),
    title: { default: t('title'), template: `%s — ${profile.shortName}` },
    description: t('description'),
    // hreflang: tells Google these four URLs are the same page in different
    // languages, so they consolidate authority instead of competing.
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries([
        ...locales.map((l) => [l, `/${l}`]),
        ['x-default', `/${routing.defaultLocale}`],
      ]),
    },
    openGraph: {
      type: 'website',
      locale,
      url: `${base}/${locale}`,
      title: t('title'),
      description: t('description'),
      siteName: profile.name,
      images: [{ url: '/og.png', width: 1200, height: 630, alt: t('ogAlt') }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
    },
    robots: { index: true, follow: true },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Guard first: an unknown locale must 404, not render an empty shell.
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Opts this route into static rendering — without it, every page that reads
  // a translation is forced into dynamic rendering.
  setRequestLocale(locale);

  const typedLocale = locale as Locale;
  const dir = getDirection(typedLocale);

  const t = await getTranslations({ locale, namespace: 'common' });

  return (
    <html
      lang={locale}
      dir={dir}
      // next-themes writes `class="dark"` before paint; React would otherwise
      // flag the server/client mismatch.
      suppressHydrationWarning
    >
      <body className="min-h-dvh antialiased">
        <CyberBackground />
        <ThemeProvider>
          <NextIntlClientProvider>
            {/* Keyboard users land here first. */}
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-100 focus:rounded-lg focus:bg-[var(--accent)] focus:px-4 focus:py-2 focus:text-[var(--accent-contrast)]"
            >
              {t('skipToContent')}
            </a>

            <Navbar />

            <main id="main" className="relative">
              {children}
            </main>

            <Footer />

            {/* Floating AI agent — mounted once, above every section. */}
            <ChatWidget locale={typedLocale} />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
