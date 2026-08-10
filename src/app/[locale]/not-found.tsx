import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

/** Locale-aware 404 — keeps the visitor inside their language. */
export default function LocaleNotFound() {
  const t = useTranslations('notFound');

  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-xl flex-col items-center justify-center px-5 text-center">
      <p className="numeric text-7xl font-bold text-[var(--accent)]">404</p>
      <h1 className="mt-4 text-2xl font-bold tracking-tight">{t('title')}</h1>
      <p className="mt-2 text-[var(--text-secondary)]">{t('description')}</p>
      <Link
        href="/"
        className="mt-8 inline-flex h-11 items-center rounded-xl bg-[var(--accent)] px-6 text-sm font-semibold text-[var(--accent-contrast)]"
      >
        {t('cta')}
      </Link>
    </div>
  );
}
