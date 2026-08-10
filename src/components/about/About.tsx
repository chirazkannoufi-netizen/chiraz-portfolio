import { useTranslations } from 'next-intl';
import { GraduationCap, Award, Briefcase } from 'lucide-react';

import { profile } from '@/content/profile';
import { localeMeta, type Locale } from '@/i18n/routing';
import { Reveal } from '@/components/ui/Reveal';
import { TechIcon } from '@/components/about/TechIcon';

/**
 * About — education, experience timeline, skills matrix, spoken languages.
 *
 * Structure comes from `content/profile.ts`; prose comes from the message
 * catalogue. Adding a job means one entry in the profile plus one block per
 * locale, and the layout follows automatically.
 */
export function About() {
  const t = useTranslations('about');

  return (
    <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr]">
      {/* ── Narrative + timeline ─────────────────────────────────── */}
      <div>
        <Reveal>
          <p className="text-xl font-medium leading-snug text-balance">{t('lead')}</p>
          <p className="mt-4 leading-relaxed text-[var(--text-secondary)]">{t('bio')}</p>
        </Reveal>

        <Reveal delay={80}>
          <h3 className="mt-12 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            <Briefcase className="size-4" aria-hidden="true" />
            {t('experienceTitle')}
          </h3>

          <ol className="mt-5 space-y-6 border-s border-[var(--border-subtle)] ps-6">
            {profile.experience.map((role) => {
              const item = `experienceItems.${role.id}` as const;
              const highlights = t.raw(`${item}.highlights`) as string[];

              return (
                <li key={role.id} className="relative">
                  {/* Timeline node. `-start-[1.6rem]` is logical, so the rail
                      flips to the right edge in Arabic without extra CSS. */}
                  <span
                    aria-hidden="true"
                    className="absolute -start-[1.6rem] top-1.5 size-2.5 rounded-full border-2 border-[var(--surface)] bg-[var(--accent)]"
                  />

                  <div className="flex flex-wrap items-baseline gap-x-3">
                    <h4 className="font-semibold">{t(`${item}.role`)}</h4>
                    <span className="numeric text-xs font-medium text-[var(--accent)]">
                      {role.start} — {role.end ?? t('present')}
                    </span>
                  </div>

                  <p className="mt-0.5 text-sm text-[var(--text-muted)]">
                    {role.company} · {role.location}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                    {t(`${item}.summary`)}
                  </p>

                  <ul className="mt-2.5 space-y-1.5">
                    {highlights.map((highlight) => (
                      <li
                        key={highlight}
                        className="text-sm leading-relaxed text-[var(--text-secondary)]"
                      >
                        {highlight}
                      </li>
                    ))}
                  </ul>

                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {role.stack.map((tech) => (
                      <li
                        key={tech}
                        dir="ltr"
                        className="rounded-md border border-[var(--border-subtle)] px-2 py-0.5 font-mono text-[11px] text-[var(--text-muted)]"
                      >
                        {tech}
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ol>
        </Reveal>
      </div>

      {/* ── Sidebar: education, skills, languages ────────────────── */}
      <div className="space-y-10">
        <Reveal delay={60}>
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            <GraduationCap className="size-4" aria-hidden="true" />
            {t('educationTitle')}
          </h3>

          <ul className="mt-4 space-y-4">
            {profile.education.map((entry) => (
              <li key={entry.id} className="surface-card rounded-xl p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h4 className="text-sm font-semibold">{entry.degree}</h4>
                  <span className="numeric shrink-0 text-xs text-[var(--accent)]">
                    {entry.start === entry.end ? entry.start : `${entry.start}–${entry.end}`}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[var(--text-muted)]">{entry.institution}</p>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={90}>
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            <Award className="size-4" aria-hidden="true" />
            {t('certificatesTitle')}
          </h3>

          <ul className="mt-4 space-y-4">
            {profile.certificates.map((entry) => (
              <li key={entry.id} className="surface-card rounded-xl p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h4 className="text-sm font-semibold">{entry.degree}</h4>
                  <span className="numeric shrink-0 text-xs text-[var(--accent)]">
                    {entry.start === entry.end ? entry.start : `${entry.start}–${entry.end}`}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[var(--text-muted)]">{entry.institution}</p>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={120}>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            {t('skillsTitle')}
          </h3>

          <div className="mt-4 space-y-4">
            {Object.entries(profile.skills).map(([group, items]) => (
              <div
                key={group}
                className={group === 'automation' ? 'featured-automation' : undefined}
              >
                <p className="mb-1.5 text-xs font-medium text-[var(--text-secondary)]">
                  {t(`skillGroups.${group}`)}
                </p>
                <ul className="flex flex-wrap gap-1.5">
                  {(items as readonly string[]).map((skill) => (
                    <li
                      key={skill}
                      dir="ltr"
                      className="flex items-center gap-1.5 rounded-md bg-[var(--surface-sunken)] px-2 py-1 font-mono text-[11px] text-[var(--text-secondary)]"
                    >
                      <TechIcon skill={skill} />
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={180}>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            {t('languagesTitle')}
          </h3>

          <ul className="mt-4 space-y-2">
            {profile.spokenLanguages.map((language) => (
              <li key={language.code} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span aria-hidden="true">{localeMeta[language.code as Locale].flag}</span>
                  {localeMeta[language.code as Locale].label}
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  {t(`proficiency.${language.level}`)}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </div>
  );
}
