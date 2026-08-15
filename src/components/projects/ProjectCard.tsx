'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ArrowUpRight, Github, Play } from 'lucide-react';

import type { Project } from '@/types';
import { cn } from '@/lib/utils';
import { ProjectMotif } from './ProjectMotif';

/**
 * ============================================================================
 *  PROJECT CARD
 * ============================================================================
 *
 *  A case study, not a screenshot with a caption. Problem → Solution → Outcome
 *  is the shape a hiring manager is actually scanning for.
 *
 *  Accessibility contract:
 *   • The whole card is a <button> that expands the case study, so there is
 *     exactly one tab stop per card in the collapsed state. Nested interactive
 *     elements (GitHub, live demo) only enter the tab order once expanded.
 *   • `aria-expanded` + `aria-controls` describe the disclosure relationship.
 *   • The pointer-tracking glow is decorative and never gates information.
 *
 *  Motion contract:
 *   • `useReducedMotion` disables the spotlight and lift entirely for anyone
 *     who asked their OS not to animate — not merely shortened, removed.
 */
export function ProjectCard({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const t = useTranslations('projects');
  const reduceMotion = useReducedMotion();

  const [expanded, setExpanded] = useState(false);
  const [spotlight, setSpotlight] = useState<{ x: number; y: number } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const item = `items.${project.slug}` as const;
  const panelId = `project-panel-${project.slug}`;

  /**
   * Collapsed cards show a capped stack so a six-chip project doesn't stand
   * a row taller than a two-chip one. The rest appear on expand — this is a
   * presentation cap, never a claim that the stack is shorter than it is.
   */
  const COLLAPSED_STACK = 4;
  const visibleStack = expanded ? project.stack : project.stack.slice(0, COLLAPSED_STACK);
  const hiddenStackCount = project.stack.length - visibleStack.length;

  /** Cursor-following glow. Cheap: one style write, no layout read per frame. */
  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (reduceMotion) return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    setSpotlight({ x: event.clientX - rect.left, y: event.clientY - rect.top });
  }

  return (
    <motion.article
      layout
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.06, 0.3), ease: [0.16, 1, 0.3, 1] }}
      className="group relative"
    >
      <div
        ref={cardRef}
        onPointerMove={onPointerMove}
        onPointerLeave={() => setSpotlight(null)}
        className={cn(
          // `min-h` — NOT `align-items: stretch` — is what lines the collapsed
          // cards up. Stretch caused the Round 2 bug: it tied every card in a
          // row to the tallest, so expanding one grew its neighbours. A floor on
          // the card itself gives the same tidy grid while leaving each card's
          // height its own, so expansion still affects nobody else.
          'surface-card relative flex min-h-[27.5rem] flex-col overflow-hidden rounded-2xl transition-all duration-300',
          'hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-xl hover:shadow-[var(--glow)]',
          expanded && 'border-[var(--accent)]',
        )}
      >
        {/* Decorative spotlight */}
        {spotlight && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background: `radial-gradient(320px circle at ${spotlight.x}px ${spotlight.y}px, var(--glow), transparent 70%)`,
            }}
          />
        )}

        {/* Generated cover art — the project's own motif over its gradient.
            No image request, no layout shift, and it can never 404. */}
        <div
          className={cn(
            'relative flex h-32 items-end justify-between overflow-hidden bg-gradient-to-br p-4',
            project.accent[0],
            project.accent[1],
          )}
        >
          {project.logo ? (
            <span className="pointer-events-none absolute inset-0 grid place-items-center p-6">
              <Image
                src={project.logo}
                alt=""
                width={260}
                height={150}
                className="max-h-16 w-auto object-contain"
              />
            </span>
          ) : (
            <ProjectMotif slug={project.slug} />
          )}
          {/* Only projects that state their own year carry a date badge —
              `ms-auto` keeps the status badges right-aligned without it. */}
          {project.year && (
            <span className="rounded-lg bg-black/20 px-2 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              <span className="numeric">{project.year}</span>
            </span>
          )}
          <div className="flex gap-1.5 ms-auto">
            {project.hasLiveDemo && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-black/20 px-2 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                <Play className="size-3" aria-hidden="true" />
                {t('liveDemoBadge')}
              </span>
            )}
            {project.featured && (
              <span className="rounded-lg bg-white/90 px-2 py-1 text-xs font-semibold text-slate-900">
                {t('featured')}
              </span>
            )}
          </div>
        </div>

        <div className="relative flex flex-1 flex-col p-5">
          {/* Disclosure trigger. The ::after pseudo-element makes the entire
              card clickable while keeping the accessible name on the heading
              text alone. */}
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            aria-controls={panelId}
            className="text-start after:absolute after:inset-0 after:content-['']"
          >
            <h3 className="text-lg font-semibold tracking-tight transition-colors group-hover:text-[var(--accent)]">
              {t(`${item}.title`)}
            </h3>
          </button>

          <p
            className={cn(
              'mt-2 text-sm leading-relaxed text-[var(--text-secondary)]',
              !expanded && 'line-clamp-2',
            )}
          >
            {t(`${item}.problem`)}
          </p>

          {/* Metrics */}
          {project.metrics.length > 0 && (
            <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
              {project.metrics.map((metric) => (
                <div key={metric.labelKey}>
                  <dd
                    className={cn(
                      'text-xl font-bold leading-none',
                      metric.direction === 'down' ? 'text-emerald-500' : 'text-[var(--accent)]',
                    )}
                  >
                    <span className="numeric">
                      {metric.direction === 'down' ? '−' : ''}
                      {metric.value}
                      {metric.unit}
                    </span>
                  </dd>
                  <dt className="mt-1 text-xs text-[var(--text-muted)]">
                    {t(`metrics.${metric.labelKey}`)}
                  </dt>
                </div>
              ))}
            </dl>
          )}

          {/* Expanded case study */}
          <div
            id={panelId}
            hidden={!expanded}
            className="mt-5 space-y-4 border-t border-[var(--border-subtle)] pt-4"
          >
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
                {t('solution')}
              </h4>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-secondary)]">
                {t(`${item}.solution`)}
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
                {t('outcome')}
              </h4>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-secondary)]">
                {t(`${item}.outcome`)}
              </p>
            </div>
          </div>

          {/* Stack chips */}
          <ul className="mt-5 flex flex-wrap gap-1.5">
            {visibleStack.map((tech) => (
              <li
                key={tech}
                // Stack names are proper nouns — force LTR so "Next.js" and
                // "n8n" read correctly inside Arabic layout.
                dir="ltr"
                className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-sunken)] px-2 py-0.5 font-mono text-[11px] text-[var(--text-secondary)]"
              >
                {tech}
              </li>
            ))}
            {hiddenStackCount > 0 && (
              <li
                dir="ltr"
                className="rounded-md border border-dashed border-[var(--border-subtle)] px-2 py-0.5 font-mono text-[11px] text-[var(--text-muted)]"
              >
                +{hiddenStackCount}
              </li>
            )}
          </ul>

          {/* Links sit above the card-wide click target via z-index.
              They are no longer gated on `expanded`: the whole point of a code
              link is that it's findable, and hiding it behind a disclosure made
              it the least visible thing on a card about shipped code. Costs one
              extra tab stop per card, which is a fair trade. */}
          {(project.githubUrl || project.liveUrl) && (
            <div className="relative z-10 mt-auto flex flex-wrap gap-2 pt-5">
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-[var(--accent)] bg-[var(--surface-sunken)] px-4 text-sm font-semibold text-[var(--accent)] transition-all hover:bg-[var(--accent)] hover:text-[var(--accent-contrast)] hover:shadow-[0_0_14px_var(--glow)] active:scale-[0.97]"
                >
                  <Github className="size-4" aria-hidden="true" />
                  {t('viewCode')}
                </a>
              )}
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-contrast)] transition-all hover:shadow-[0_0_14px_var(--glow)] active:scale-[0.97]"
                >
                  {t('viewLive')}
                  <ArrowUpRight className="size-4 rtl:-scale-x-100" aria-hidden="true" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}
