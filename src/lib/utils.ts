import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes with correct precedence.
 * `clsx` handles conditionals; `twMerge` resolves conflicts so a caller's
 * `className="p-8"` beats a component's default `p-4` instead of both landing
 * in the class list and letting source order decide.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Clamp a number into a range — used by the estimator gauge. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Stable, dependency-free id for list keys and ARIA relationships. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    // Strip combining diacritical marks (é -> e) so slugs stay URL-safe.
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
