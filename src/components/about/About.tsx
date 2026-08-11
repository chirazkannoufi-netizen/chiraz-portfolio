import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { GraduationCap, Award, Briefcase } from 'lucide-react';

import { profile } from '@/content/profile';
import { Reveal } from '@/components/ui/Reveal';
import { SkillsFlowCanvas } from '@/components/about/SkillsFlowCanvas';

/**
 * About — a single vertical sequence: Experience, Technical Skills,
 * Education, Certificates.
 *
 * Structure comes from `content/profile.ts`; prose comes from the message
 * catalogue. Adding a job means one entry in the profile plus one block per
 * locale, and the layout follows automatically.
 */
export function About() {
  const t = useTranslations('about');

  return (
    <div className="space-y-16">
      <Reveal>
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          {/* Portrait frame: a soft gradient glow behind a hard neon-bordered
              square reads as "stylised" without fighting the header's plain
              circular logo for the same visual language. */}
          <div className="relative shrink-0">
            <div
              aria-hidden="true"
              className="absolute -inset-2 rounded-[1.75rem] bg-gradient-to-br from-[var(--circuit-strong)] via-[var(--accent)] to-[var(--circuit-strong)] opacity-70 blur-lg"
            />
            <Image
              src="/ME.png"
              alt={profile.name}
              width={128}
              height={128}
              className="relative size-32 rounded-2xl border-2 border-[var(--circuit-strong)] object-cover shadow-[0_0_24px_var(--circuit)]"
            />
          </div>

          <div>
            <p className="max-w-3xl text-xl font-medium leading-snug text-balance">
              {t('lead')}
            </p>
            <p className="mt-4 max-w-3xl leading-relaxed text-[var(--text-secondary)]">
              {t('bio')}
            </p>
          </div>
        </div>
      </Reveal>

      {/* ── Experience ───────────────────────────────────────────── */}
      <Reveal delay={60}>
        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          <Briefcase className="size-4" aria-hidden="true" />
          {t('experienceTitle')}
        </h3>

        <ol className="mt-5 max-w-3xl space-y-6 border-s border-[var(--border-subtle)] ps-6">
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

                {/* Company/location intentionally omitted — this timeline
                    speaks to role and impact, not employer branding. */}
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

      {/* ── Technical skills: interactive automation-flow canvas ───── */}
      <Reveal delay={90}>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          {t('skillsTitle')}
        </h3>
        <div className="mt-6">
          <SkillsFlowCanvas />
        </div>
      </Reveal>

      {/* ── Education ────────────────────────────────────────────── */}
      <Reveal delay={120}>
        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          <GraduationCap className="size-4" aria-hidden="true" />
          {t('educationTitle')}
        </h3>

        <ul className="mt-4 max-w-3xl space-y-4">
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

      {/* ── Certificates ─────────────────────────────────────────── */}
      <Reveal delay={150}>
        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          <Award className="size-4" aria-hidden="true" />
          {t('certificatesTitle')}
        </h3>

        <ul className="mt-4 grid max-w-3xl gap-4 sm:grid-cols-2">
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
    </div>
  );
}
