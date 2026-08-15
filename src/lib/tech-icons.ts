/**
 * Maps a skill label from `profile.skills` to its devicon slug. Skills with
 * no sensible devicon icon are left unmapped; the naive fallback below still
 * produces a URL, and the `onError` handler in About.tsx hides it silently
 * if devicon has no matching file — cheaper than maintaining an exhaustive list.
 */
const DEVICON_SLUGS: Record<string, string> = {
  Python: 'python',
  JavaScript: 'javascript',
  Dart: 'dart',
  'HTML5 / CSS3': 'html5',
  'Next.js': 'nextjs',
  'Tailwind CSS': 'tailwindcss',
  Flutter: 'flutter',
  FastAPI: 'fastapi',
  pytest: 'pytest',
  n8n: 'n8n',
  PostgreSQL: 'postgresql',
  Supabase: 'supabase',
  SQLite: 'sqlite',
  Figma: 'figma',
  Canva: 'canva',
  Shopify: 'shopify',
};

function naiveSlug(skill: string): string {
  return skill.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/** Devicon CDN URL for a skill's logo. May 404 for unmapped skills — expected. */
export function techIconUrl(skill: string): string {
  const slug = DEVICON_SLUGS[skill] ?? naiveSlug(skill);
  return `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${slug}/${slug}-original.svg`;
}
