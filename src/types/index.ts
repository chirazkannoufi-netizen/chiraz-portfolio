import type { Locale } from '@/i18n/routing';

export type { Locale };

/** Project taxonomy. Drives the showcase filter chips. */
export const projectCategories = ['automation', 'web', 'ai-data', 'ecommerce'] as const;
export type ProjectCategory = (typeof projectCategories)[number];

/**
 * A quantified fact shown on the project card.
 *
 * ⚠️ A metric may only exist here if the number is stated in that project's
 * own public README. No estimates, no rounding, no inferred figures.
 *
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
  /**
   * Real app logo for the banner, where one exists. Projects without a
   * shipped logo fall back to their generated motif rather than to an
   * invented mark.
   */
  logo?: string;
  /** Renders the "Live demo" affordance instead of a static screenshot. */
  hasLiveDemo?: boolean;
  featured: boolean;
  /**
   * Optional: only set where the project itself states a year. The card hides
   * the badge when absent rather than showing a guessed date.
   */
  year?: number;
  /** Tailwind gradient pair for the card's generated cover art. */
  accent: readonly [string, string];
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
