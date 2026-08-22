import type { Project } from '@/types';

/**
 * Case-study registry.
 *
 * Only language-neutral data lives here (stack, metrics, links, taxonomy).
 * The narrative — problem / solution / outcome — lives in
 * `messages/{locale}.json → projects.items.{slug}` so all four languages stay
 * in lockstep with a single structural definition.
 *
 * ⚠️ Every project below is a real, published piece of work, and every field
 * traces to that project's own public README (or, for the reply assistant,
 * to the shipped n8n workflow JSON). No client is named. `metrics` holds only
 * numbers those sources state outright — which is why most are empty, and
 * why `year` is omitted wherever the project does not date itself.
 */
export const projects: readonly Project[] = [
  {
    slug: 'gotrek',
    category: 'web',
    stack: ['Flutter', 'Dart'],
    metrics: [],
    githubUrl: 'https://github.com/chirazkannoufi-netizen/GoTrek',
    // The app's real logo, taken from the repo's own assets/images/.
    logo: '/projects/gotrek-logo.png',
    featured: false,
    // The only project that dates itself: the README states 2025.
    year: 2025,
    accent: ['from-emerald-400', 'to-teal-300'],
  },
  {
    slug: 'multi-agent-monitor',
    category: 'ai-data',
    stack: ['Python', 'FastAPI', 'SQLite', 'pytest', 'Anthropic Claude API', 'n8n'],
    // Stated in the repo's own README and test badge.
    metrics: [{ labelKey: 'testsPassing', value: 57, unit: '', direction: 'up' }],
    githubUrl: 'https://github.com/chirazkannoufi-netizen/multi-agent-ecommerce-monitor',
    featured: false,
    accent: ['from-violet-400', 'to-fuchsia-300'],
  },
  {
    slug: 'ai-sales-assistant',
    category: 'ecommerce',
    stack: ['n8n', 'OpenAI API', 'Telegram Bot API', 'Google Sheets automation'],
    metrics: [],
    githubUrl: 'https://github.com/chirazkannoufi-netizen/ai-sales-assistant-demo',
    featured: false,
    accent: ['from-sky-400', 'to-cyan-300'],
  },
  {
    slug: 'ai-customer-reply-assistant',
    category: 'automation',
    stack: ['n8n', 'OpenAI API', 'Telegram Bot API', 'Google Sheets automation', 'SMTP automation'],
    metrics: [],
    // Sold as a template on her own store; the listing carries the price so
    // this page never hardcodes a figure that can change.
    liveUrl: 'https://payhip.com/FlowTechAutomation',
    featured: false,
    accent: ['from-amber-400', 'to-orange-300'],
  },
] as const;

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
