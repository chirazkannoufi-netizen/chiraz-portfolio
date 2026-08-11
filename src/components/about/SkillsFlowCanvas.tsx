'use client';

import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';

import { profile } from '@/content/profile';
import { TechIcon } from '@/components/about/TechIcon';
import { cn } from '@/lib/utils';

const LANES = Object.entries(profile.skills).map(([group, skills]) => ({
  group,
  skills: skills as readonly string[],
}));

type Point = { x: number; y: number };
type Edge = { key: string; from: Point; to: Point };

/**
 * Technical skills as one continuous "automation flow": every skill is a
 * node, sequential nodes are joined by a dashed connector, so the whole
 * canvas reads as a single pipeline winding through every category.
 *
 * Lines are measured from real DOM positions (`getBoundingClientRect`)
 * rather than hand-placed, so the graph stays correct through responsive
 * reflow and RTL mirroring for free — no per-breakpoint or per-locale math.
 */
export function SkillsFlowCanvas() {
  const t = useTranslations('about');
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef(new Map<string, HTMLDivElement>());
  const [edges, setEdges] = useState<Edge[]>([]);

  const measure = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const containerBox = container.getBoundingClientRect();

    const centerOf = (el: HTMLDivElement): Point => {
      const box = el.getBoundingClientRect();
      return {
        x: box.left - containerBox.left + box.width / 2,
        y: box.top - containerBox.top + box.height / 2,
      };
    };

    const order = LANES.flatMap((lane) => lane.skills.map((skill) => `${lane.group}:${skill}`));

    const next: Edge[] = [];
    for (let i = 0; i < order.length - 1; i++) {
      const fromKey = order[i];
      const toKey = order[i + 1];
      if (!fromKey || !toKey) continue;
      const a = nodeRefs.current.get(fromKey);
      const b = nodeRefs.current.get(toKey);
      if (!a || !b) continue;
      next.push({ key: fromKey, from: centerOf(a), to: centerOf(b) });
    }
    setEdges(next);
  }, []);

  useLayoutEffect(() => {
    measure();
    const container = containerRef.current;
    if (!container) return;

    // Re-measure on wrap/breakpoint changes — the whole point of measuring
    // real positions instead of hand-placing coordinates.
    const ro = new ResizeObserver(() => measure());
    ro.observe(container);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [measure]);

  return (
    <div ref={containerRef} className="relative">
      <svg className="pointer-events-none absolute inset-0 size-full overflow-visible" aria-hidden="true">
        {edges.map((edge) => (
          <line
            key={edge.key}
            className="flow-line"
            x1={edge.from.x}
            y1={edge.from.y}
            x2={edge.to.x}
            y2={edge.to.y}
          />
        ))}
      </svg>

      <div className="relative space-y-8">
        {LANES.map((lane) => (
          <div key={lane.group}>
            <p className="mb-3 text-xs font-medium text-[var(--text-secondary)]">
              {t(`skillGroups.${lane.group}`)}
            </p>
            <div className="flex flex-wrap gap-4">
              {/* Staggered by position within its own lane — each lane
                  triggers its own cascade as it scrolls into view, rather
                  than a single delay budget spent by the time later lanes
                  are reached. */}
              {lane.skills.map((skill, i) => (
                <motion.div
                  key={skill}
                  ref={(el) => {
                    const key = `${lane.group}:${skill}`;
                    if (el) nodeRefs.current.set(key, el);
                    else nodeRefs.current.delete(key);
                  }}
                  initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                  whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.4, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                  className={cn(
                    'flow-node group flex w-[6.5rem] flex-col items-center gap-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-4 text-center transition-transform duration-300 ease-out hover:-translate-y-1 hover:scale-105',
                    lane.group === 'automation' && 'flow-node--featured',
                  )}
                >
                  <TechIcon skill={skill} className="size-8" />
                  <span
                    dir="ltr"
                    className="text-[11px] leading-tight font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]"
                  >
                    {skill}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
