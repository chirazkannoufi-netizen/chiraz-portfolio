'use client';

import { cn } from '@/lib/utils';
import { techIconUrl } from '@/lib/tech-icons';

/**
 * A skill's devicon logo. Client Component because the `onError` fallback
 * needs a real event handler — server-rendered callers can't own it directly.
 */
export function TechIcon({ skill, className }: { skill: string; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={techIconUrl(skill)}
      alt=""
      aria-hidden="true"
      loading="lazy"
      className={cn('tech-icon size-3.5 shrink-0 rounded-sm', className)}
      onError={(e) => {
        e.currentTarget.style.display = 'none';
      }}
    />
  );
}
