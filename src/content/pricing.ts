import type { EstimatorGroup, Quote } from '@/types';

/**
 * ============================================================================
 *  PRICING ENGINE
 * ============================================================================
 *
 *  Deliberately a pure, dependency-free module so it can be unit-tested and
 *  reused server-side (the quote is re-computed on the server before it is
 *  attached to a booking — never trust a number that came from the browser).
 *
 *  All figures are USD. Structure, not prose: labels live in
 *  `messages/{locale}.json → estimator.*`.
 */

export const CURRENCY = 'USD';

/** Every project carries this floor regardless of options selected. */
export const BASE_FEE = 280;

/**
 * Estimates are shown as a ±band, never a single number. A hard number invites
 * haggling on a scope you haven't seen yet; a band sets expectations honestly.
 */
export const RANGE_SPREAD = 0.18;

export const estimatorGroups: readonly EstimatorGroup[] = [
  {
    id: 'projectType',
    type: 'radio',
    defaults: ['type-automation'],
    options: [
      { id: 'type-automation', price: 350, days: 5, exclusive: true },
      { id: 'type-website', price: 630, days: 10, exclusive: true },
      { id: 'type-webapp', price: 1260, days: 18, exclusive: true },
      { id: 'type-audit', price: 245, days: 3, exclusive: true },
    ],
  },
  {
    id: 'integrations',
    type: 'checkbox',
    options: [
      { id: 'int-shopify', price: 225, days: 3 },
      { id: 'int-sheets', price: 125, days: 2 },
      { id: 'int-n8n', price: 280, days: 4 },
      { id: 'int-payments', price: 315, days: 4 },
      { id: 'int-crm', price: 210, days: 3 },
    ],
  },
  {
    id: 'features',
    type: 'checkbox',
    options: [
      { id: 'feat-ai', price: 455, days: 5 },
      { id: 'feat-dashboard', price: 385, days: 5 },
      { id: 'feat-auth', price: 265, days: 3 },
      { id: 'feat-i18n', price: 295, days: 4 },
      { id: 'feat-cms', price: 245, days: 3 },
    ],
  },
  {
    id: 'support',
    type: 'radio',
    defaults: ['support-none'],
    options: [
      { id: 'support-none', price: 0, days: 0, exclusive: true },
      { id: 'support-1m', price: 175, days: 0, exclusive: true },
      { id: 'support-3m', price: 455, days: 0, exclusive: true },
    ],
  },
];

/** Rush delivery compresses the timeline and is priced accordingly. */
export const RUSH_MULTIPLIER = 1.35;
export const RUSH_DAY_FACTOR = 0.65;

const optionIndex = new Map(
  estimatorGroups.flatMap((g) => g.options.map((o) => [o.id, o] as const)),
);

export const defaultSelection: readonly string[] = estimatorGroups.flatMap(
  (g) => g.defaults ?? [],
);

/**
 * Computes a quote from a set of selected option ids.
 *
 * Pure and total: unknown ids are ignored rather than throwing, so a stale
 * bookmarked URL (`?opts=feat-removed`) degrades gracefully instead of 500ing.
 */
export function calculateQuote(selectedIds: readonly string[], rush = false): Quote {
  let subtotal = BASE_FEE;
  let days = 0;

  for (const id of selectedIds) {
    const option = optionIndex.get(id);
    if (!option) continue; // unknown / retired option — skip silently
    subtotal += option.price;
    days += option.days;
  }

  const total = rush ? Math.round(subtotal * RUSH_MULTIPLIER) : subtotal;
  const adjustments = total - subtotal;
  const effectiveDays = Math.max(
    2,
    Math.round(rush ? days * RUSH_DAY_FACTOR : days),
  );

  return {
    subtotal,
    adjustments,
    total,
    low: Math.round((total * (1 - RANGE_SPREAD)) / 10) * 10,
    high: Math.round((total * (1 + RANGE_SPREAD)) / 10) * 10,
    days: effectiveDays,
  };
}

/** Compact, locale-aware money formatting for the running total. */
export function formatMoney(amount: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: CURRENCY,
    maximumFractionDigits: 0,
  }).format(amount);
}
