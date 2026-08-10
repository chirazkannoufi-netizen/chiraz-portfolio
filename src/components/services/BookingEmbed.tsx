'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { CalendarDays } from 'lucide-react';

import { profile } from '@/content/profile';

/**
 * Cal.com booking.
 *
 * The embed script is loaded lazily on first intersection rather than on page
 * load: Cal's bundle is heavier than everything else on this page combined,
 * and most visitors never scroll this far. Until then the section is a button.
 *
 * Falls back to a plain external link if `NEXT_PUBLIC_CAL_LINK` is unset or
 * the script fails, so "book a call" always works.
 */
export function BookingEmbed() {
  const t = useTranslations('booking');
  const locale = useLocale();
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const calLink = process.env.NEXT_PUBLIC_CAL_LINK;

  useEffect(() => {
    if (!loaded || !calLink) return;

    // Cal's documented embed snippet, transcribed to TypeScript.
    const script = document.createElement('script');
    script.src = 'https://app.cal.com/embed/embed.js';
    script.async = true;
    script.onerror = () => setFailed(true);
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, [loaded, calLink]);

  if (!calLink || failed) {
    return (
      <div className="surface-card rounded-2xl p-8 text-center">
        <p className="text-sm text-[var(--text-muted)]">{t('fallback')}</p>
        <a
          href={`mailto:${profile.contact.email}`}
          className="mt-3 inline-block text-sm font-semibold text-[var(--accent)]"
        >
          {profile.contact.email}
        </a>
      </div>
    );
  }

  if (!loaded) {
    return (
      <div className="surface-card flex flex-col items-center gap-4 rounded-2xl p-10 text-center">
        <span className="grid size-12 place-items-center rounded-xl bg-[var(--surface-sunken)] text-[var(--accent)]">
          <CalendarDays className="size-6" aria-hidden="true" />
        </span>
        <p className="max-w-sm text-sm text-[var(--text-secondary)]">{t('subtitle')}</p>
        <button
          type="button"
          onClick={() => setLoaded(true)}
          className="inline-flex h-11 items-center rounded-xl bg-[var(--accent)] px-6 text-sm font-semibold text-[var(--accent-contrast)] transition-transform hover:scale-[1.03]"
        >
          {t('cta')}
        </button>
      </div>
    );
  }

  return (
    <div className="surface-card overflow-hidden rounded-2xl">
      <iframe
        // `loading="lazy"` matters even after the click: it keeps the iframe
        // out of the critical path if the user scrolls straight past.
        loading="lazy"
        title={t('title')}
        src={`https://cal.com/${calLink}?embed=true&theme=auto&layout=month_view&locale=${locale}`}
        className="h-[42rem] w-full border-0"
      />
    </div>
  );
}
