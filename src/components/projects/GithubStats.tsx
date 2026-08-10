import { getTranslations } from 'next-intl/server';
import { Github, Star, Users, FolderGit2 } from 'lucide-react';

import { getGithubStats } from '@/lib/github';
import { profile } from '@/content/profile';

/**
 * Live GitHub panel — an async Server Component.
 *
 * Rendering this on the server means the PAT stays server-side, the response
 * is cached once per hour for every visitor, and the browser downloads zero
 * additional JavaScript for it. Wrap it in <Suspense> at the call site so a
 * slow GitHub can't block the rest of the page.
 */
export async function GithubStats() {
  // `useTranslations` is sync-only; an async Server Component must await
  // `getTranslations` instead.
  const [t, stats] = await Promise.all([getTranslations('github'), getGithubStats()]);

  if (!stats) {
    return (
      <div className="surface-card rounded-2xl p-8 text-center">
        <p className="text-sm text-[var(--text-muted)]">{t('unavailable')}</p>
        <a
          href={profile.contact.github}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)]"
        >
          <Github className="size-4" aria-hidden="true" />
          {t('viewProfile')}
        </a>
      </div>
    );
  }

  const tiles = [
    { icon: FolderGit2, label: t('repos'), value: stats.publicRepos },
    { icon: Users, label: t('followers'), value: stats.followers },
    { icon: Star, label: t('stars'), value: stats.totalStars },
  ];

  return (
    <div className="surface-card overflow-hidden rounded-2xl">
      <dl className="grid grid-cols-3 divide-x divide-[var(--border-subtle)] rtl:divide-x-reverse">
        {tiles.map(({ icon: Icon, label, value }) => (
          <div key={label} className="p-5 text-center">
            <Icon className="mx-auto size-4 text-[var(--text-muted)]" aria-hidden="true" />
            <dd className="mt-2 text-2xl font-bold">
              <span className="numeric">{value}</span>
            </dd>
            <dt className="mt-1 text-xs text-[var(--text-muted)]">{label}</dt>
          </div>
        ))}
      </dl>

      {stats.topLanguages.length > 0 && (
        <div className="border-t border-[var(--border-subtle)] p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            {t('topLanguages')}
          </p>

          {/* Single stacked bar rather than one bar per language: it shows
              proportion at a glance and takes one row instead of five. */}
          <div
            className="flex h-2.5 overflow-hidden rounded-full bg-[var(--surface-sunken)]"
            role="img"
            aria-label={stats.topLanguages
              .map((l) => `${l.name} ${l.percentage}%`)
              .join(', ')}
          >
            {stats.topLanguages.map((language, index) => (
              <span
                key={language.name}
                style={{
                  width: `${language.percentage}%`,
                  opacity: 1 - index * 0.15,
                }}
                className="bg-[var(--accent)]"
              />
            ))}
          </div>

          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
            {stats.topLanguages.map((language, index) => (
              <li
                key={language.name}
                className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]"
              >
                <span
                  aria-hidden="true"
                  style={{ opacity: 1 - index * 0.15 }}
                  className="size-2 rounded-full bg-[var(--accent)]"
                />
                <span dir="ltr">{language.name}</span>
                <span className="numeric text-[var(--text-muted)]">{language.percentage}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
