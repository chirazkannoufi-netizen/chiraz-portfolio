import type { MetadataRoute } from 'next';
import { locales, routing } from '@/i18n/routing';

/**
 * Emits one entry per locale with reciprocal hreflang alternates, so Google
 * treats the four URLs as translations of one page rather than duplicates.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://chiraz.dev';

  return locales.map((locale) => ({
    url: `${base}/${locale}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: locale === routing.defaultLocale ? 1 : 0.8,
    alternates: {
      languages: Object.fromEntries(locales.map((l) => [l, `${base}/${l}`])),
    },
  }));
}
