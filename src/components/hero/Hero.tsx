import { useTranslations, useLocale } from 'next-intl';
import { ArrowRight, Sparkles } from 'lucide-react';

import { profile } from '@/content/profile';
import { RoleTyper } from './RoleTyper';
import { ResumeDownload } from './ResumeDownload';
import { OpenChatButton } from '@/components/chat/OpenChatButton';
import type { Locale } from '@/i18n/routing';

/**
 * Hero — a Server Component.
 *
 * Only the two genuinely interactive pieces (the typewriter and the chat
 * trigger) are Client Components. Everything else, including all four
 * languages of copy, is HTML by the time it reaches the browser: the largest
 * contentful paint is plain server-rendered text with no JS on the path.
 */
export function Hero() {
  const t = useTranslations('hero');
  const locale = useLocale() as Locale;

  // `t.raw` returns the untranslated JSON value — the only way to read an
  // array out of a message catalogue.
  const roles = t.raw('roles') as string[];

  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      {/* Local accent on top of the global CyberBackground (layout.tsx). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 start-1/2 -z-10 size-[38rem] -translate-x-1/2 rounded-full bg-[var(--glow)] blur-3xl rtl:translate-x-1/2"
      />

      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        {/* Availability pill */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-raised)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)]">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          {t('available')}
        </div>

        <p className="mb-3 text-lg text-[var(--text-secondary)]">{t('greeting')}</p>

        <h1 className="text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
          {t('name')}
        </h1>

        {/* Fixed min-height stops the typewriter from reflowing the page as
            each role changes length — a classic CLS source. */}
        <div className="mt-4 min-h-[2.5rem] text-xl sm:min-h-[3rem] sm:text-3xl">
          <RoleTyper roles={roles} />
        </div>

        <p className="mt-8 max-w-2xl text-pretty text-lg leading-relaxed text-[var(--text-secondary)]">
          {t('tagline')}
        </p>
        <p className="mt-4 max-w-2xl text-pretty leading-relaxed text-[var(--text-muted)]">
          {t('description')}
        </p>

        {/* Actions */}
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <a
            href="#work"
            className="group inline-flex h-11 items-center gap-2 rounded-xl bg-[var(--accent)] px-5 text-sm font-semibold text-[var(--accent-contrast)] transition-transform hover:scale-[1.03] active:scale-[0.98]"
          >
            {t('ctaPrimary')}
            {/* Logical margin + RTL flip so the arrow points "forward" in
                Arabic too. */}
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
              aria-hidden="true"
            />
          </a>

          <OpenChatButton
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] px-5 text-sm font-semibold transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            <Sparkles className="size-4" aria-hidden="true" />
            {t('ctaSecondary')}
          </OpenChatButton>

          <ResumeDownload locale={locale} label={t('downloadCv')} aria={t('downloadCvAria')} />
        </div>

        {/* Stat strip */}
        <dl className="mt-16 grid max-w-2xl grid-cols-2 gap-6 border-t border-[var(--border-subtle)] pt-8 sm:grid-cols-3">
          <div>
            <dt className="text-sm text-[var(--text-muted)]">{t('stats.errorsReduced')}</dt>
            <dd className="mt-1 text-3xl font-bold text-[var(--accent)]">
              <span className="numeric">90%</span>
            </dd>
          </div>
          <div>
            <dt className="text-sm text-[var(--text-muted)]">{t('stats.languages')}</dt>
            <dd className="mt-1 text-3xl font-bold text-[var(--accent)]">
              <span className="numeric">{profile.spokenLanguages.length}</span>
            </dd>
          </div>
          <div>
            <dt className="text-sm text-[var(--text-muted)]">{t('stats.yearsBuilding')}</dt>
            <dd className="mt-1 text-3xl font-bold text-[var(--accent)]">
              <span className="numeric">3+</span>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
