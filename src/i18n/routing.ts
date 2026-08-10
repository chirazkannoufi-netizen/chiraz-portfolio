import { defineRouting } from 'next-intl/routing';

/**
 * Single source of truth for every locale in the app.
 *
 * `as const` is load-bearing: it gives us a literal union (`'en' | 'fr' | ...`)
 * instead of `string[]`, so `hasLocale()` narrows correctly and an unknown
 * locale is a compile-time error rather than a runtime 404.
 */
export const locales = ['en', 'fr', 'ar', 'de'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

/** Locales that render right-to-left. Drives <html dir> and the RTL utilities. */
export const rtlLocales: readonly Locale[] = ['ar'];

export function getDirection(locale: Locale): 'rtl' | 'ltr' {
  return rtlLocales.includes(locale) ? 'rtl' : 'ltr';
}

/** Display metadata for the language switcher. */
export const localeMeta: Record<Locale, { label: string; english: string; flag: string }> = {
  en: { label: 'English', english: 'English', flag: '🇬🇧' },
  fr: { label: 'Français', english: 'French', flag: '🇫🇷' },
  ar: { label: 'العربية', english: 'Arabic', flag: '🇩🇿' },
  de: { label: 'Deutsch', english: 'German', flag: '🇩🇪' },
};

export const routing = defineRouting({
  locales,
  defaultLocale,
  // 'as-needed' would hide /en. We keep 'always' so every language has a
  // stable, indexable URL and hreflang tags stay symmetric for SEO.
  localePrefix: 'always',
});
