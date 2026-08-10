import type { Locale } from '@/i18n/routing';

export type { Locale };

/** Project taxonomy. Drives the showcase filter chips. */
export const projectCategories = ['automation', 'web', 'ai-data', 'ecommerce'] as const;
export type ProjectCategory = (typeof projectCategories)[number];

/**
 * A quantified outcome shown on the project card.
 * `labelKey` resolves against `messages/*.json → projects.metrics.*` so the
 * unit and phrasing stay natural in EN / FR / AR / DE.
 */
export interface ProjectMetric {
  labelKey: string;
  value: number;
  /** Rendered verbatim after the value, e.g. '%', 'h/week', '×'. */
  unit: string;
  /** 'down' renders green for reductions (errors, latency, cost). */
  direction: 'up' | 'down';
}

export interface Project {
  /** Stable key; also the i18n namespace for this project's prose. */
  slug: string;
  category: ProjectCategory;
  /** Language-neutral tech chips — intentionally NOT translated. */
  stack: readonly string[];
  metrics: readonly ProjectMetric[];
  githubUrl?: string;
  liveUrl?: string;
  /** Renders the "Live demo" affordance instead of a static screenshot. */
  hasLiveDemo?: boolean;
  featured: boolean;
  year: number;
  /** Tailwind gradient pair for the card's generated cover art. */
  accent: readonly [string, string];
}

/** ── Cost estimator ─────────────────────────────────────────────── */

export type EstimatorOptionId = string;

export interface EstimatorOption {
  id: EstimatorOptionId;
  /** Price delta in USD. Flat adders. */
  price: number;
  /** Working days this option adds to the timeline. */
  days: number;
  /** Mutually exclusive within its group (radio) vs additive (checkbox). */
  exclusive?: boolean;
}

export interface EstimatorGroup {
  id: string;
  type: 'radio' | 'checkbox';
  options: readonly EstimatorOption[];
  /** Pre-selected option ids on first render. */
  defaults?: readonly EstimatorOptionId[];
}

export interface Quote {
  subtotal: number;
  /** Rush surcharge, discounts, etc. */
  adjustments: number;
  total: number;
  /** Estimates are ranges, never a single number — protects the margin. */
  low: number;
  high: number;
  days: number;
}

/** ── GitHub ─────────────────────────────────────────────────────── */

export interface GithubStats {
  username: string;
  publicRepos: number;
  followers: number;
  totalStars: number;
  /** Languages by byte count across public repos, descending. */
  topLanguages: { name: string; percentage: number }[];
  /** 52-week contribution-style heatmap, oldest → newest. */
  contributions: { date: string; count: number }[];
  fetchedAt: string;
}

/** ── Contact ────────────────────────────────────────────────────── */

export interface ContactPayload {
  name: string;
  email: string;
  company?: string;
  budget?: string;
  message: string;
  locale: Locale;
}
