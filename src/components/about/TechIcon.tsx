'use client';

import { techIconUrl } from '@/lib/tech-icons';

/**
 * A skill's devicon logo. Client Component because the `onError` fallback
 * needs a real event handler — `About.tsx` itself stays server-rendered.
 */
export function TechIcon({ skill }: { skill: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={techIconUrl(skill)}
      alt=""
      aria-hidden="true"
      loading="lazy"
      className="tech-icon size-3.5 shrink-0 rounded-sm"
      onError={(e) => {
        e.currentTarget.style.display = 'none';
      }}
    />
  );
}
