'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, LayoutGroup } from 'framer-motion';
import { useTranslations } from 'next-intl';

import { projects } from '@/content/projects';
import { projectCategories, type ProjectCategory } from '@/types';
import { ProjectCard } from './ProjectCard';
import { cn } from '@/lib/utils';

type Filter = ProjectCategory | 'all';

/**
 * Filterable case-study grid.
 *
 * Filtering is client-side because the whole dataset is six items — a server
 * round-trip per chip click would be slower and worse. `LayoutGroup` +
 * `layout` on the cards means filtering animates positions instead of
 * snapping, which is what makes it read as a product rather than a list.
 *
 * The chip row is a `tablist` so screen-reader users get arrow-key semantics
 * they already know, rather than a row of anonymous buttons.
 */
export function ProjectShowcase() {
  const t = useTranslations('projects');
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = useMemo(
    () => (filter === 'all' ? projects : projects.filter((p) => p.category === filter)),
    [filter],
  );

  const filters: Filter[] = ['all', ...projectCategories];

  return (
    <div>
      <div
        role="tablist"
        aria-label={t('title')}
        className="no-scrollbar -mx-5 mb-8 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
      >
        {filters.map((value) => {
          const selected = filter === value;
          return (
            <button
              key={value}
              role="tab"
              type="button"
              aria-selected={selected}
              onClick={() => setFilter(value)}
              className={cn(
                'shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-all',
                selected
                  ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-contrast)]'
                  : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)]',
              )}
            >
              {t(`filters.${value}`)}
            </button>
          );
        })}
      </div>

      {/* Announced on change so filtering is perceivable without sight. */}
      <p aria-live="polite" className="sr-only">
        {t('showing', { count: filtered.length })}
      </p>

      <LayoutGroup>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((project, index) => (
              <ProjectCard key={project.slug} project={project} index={index} />
            ))}
          </AnimatePresence>
        </div>
      </LayoutGroup>

      {filtered.length === 0 && (
        <p className="py-16 text-center text-sm text-[var(--text-muted)]">{t('empty')}</p>
      )}
    </div>
  );
}
