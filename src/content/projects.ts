import type { Project } from '@/types';

/**
 * Case-study registry.
 *
 * Only language-neutral data lives here (stack, metrics, links, taxonomy).
 * The narrative — problem / solution / outcome — lives in
 * `messages/{locale}.json → projects.items.{slug}` so all four languages stay
 * in lockstep with a single structural definition.
 *
 * Every project below maps to real work described in the CV. `githubUrl` and
 * `liveUrl` are placeholders to be filled in with the real repositories.
 */
export const projects: readonly Project[] = [
  {
    slug: 'etl-shopify-sync',
    category: 'automation',
    stack: ['Google Apps Script', 'JavaScript', 'Shopify API', 'Ecomanager', 'Sheets API'],
    metrics: [
      { labelKey: 'manualErrors', value: 90, unit: '%', direction: 'down' },
      { labelKey: 'hoursSaved', value: 15, unit: 'h', direction: 'up' },
      { labelKey: 'ordersSynced', value: 12, unit: 'k+', direction: 'up' },
    ],
    hasLiveDemo: true,
    featured: true,
    year: 2026,
    accent: ['from-sky-400', 'to-cyan-300'],
  },
  {
    slug: 'gotrek',
    category: 'web',
    stack: ['React Native', 'Node.js', 'REST APIs', 'PostgreSQL', 'Figma'],
    metrics: [
      { labelKey: 'routes', value: 40, unit: '+', direction: 'up' },
      { labelKey: 'coldStart', value: 1.2, unit: 's', direction: 'down' },
    ],
    featured: true,
    year: 2025,
    accent: ['from-emerald-400', 'to-teal-300'],
  },
  {
    slug: 'data-integrity-audit',
    category: 'ai-data',
    stack: ['JavaScript', 'Google Sheets API', 'Data Validation', 'Automated Reporting'],
    metrics: [
      { labelKey: 'recordsAudited', value: 30, unit: 'k+', direction: 'up' },
      { labelKey: 'reportLatency', value: 95, unit: '%', direction: 'down' },
    ],
    featured: true,
    year: 2025,
    accent: ['from-violet-400', 'to-fuchsia-300'],
  },
  {
    slug: 'n8n-lead-router',
    category: 'automation',
    stack: ['n8n', 'Webhooks', 'Telegram API', 'Supabase', 'Zod'],
    metrics: [
      { labelKey: 'responseTime', value: 30, unit: 's', direction: 'down' },
      { labelKey: 'uptime', value: 99.9, unit: '%', direction: 'up' },
    ],
    hasLiveDemo: true,
    featured: false,
    year: 2026,
    accent: ['from-amber-400', 'to-orange-300'],
  },
  {
    slug: 'cv-ai-agent',
    category: 'ai-data',
    stack: ['Next.js', 'TypeScript', 'AI SDK', 'OpenAI', 'Edge Runtime'],
    metrics: [
      { labelKey: 'languages', value: 4, unit: '', direction: 'up' },
      { labelKey: 'ttfb', value: 400, unit: 'ms', direction: 'down' },
    ],
    hasLiveDemo: true,
    featured: true,
    year: 2026,
    accent: ['from-indigo-400', 'to-sky-300'],
  },
  {
    slug: 'campaign-analytics',
    category: 'ecommerce',
    stack: ['Snapchat Marketing API', 'CRM Automation', 'Analytics', 'Meta Business Suite'],
    metrics: [
      { labelKey: 'markets', value: 3, unit: '', direction: 'up' },
      { labelKey: 'cpaReduction', value: 35, unit: '%', direction: 'down' },
    ],
    featured: false,
    year: 2024,
    accent: ['from-rose-400', 'to-pink-300'],
  },
] as const;

export const featuredProjects = projects.filter((p) => p.featured);

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
