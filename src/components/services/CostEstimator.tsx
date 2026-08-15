'use client';

import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowRight, Clock, RotateCcw, Zap } from 'lucide-react';

import {
  calculateQuote,
  defaultSelection,
  estimatorGroups,
  formatMoney,
} from '@/content/pricing';
import { cn } from '@/lib/utils';

/**
 * ============================================================================
 *  INTERACTIVE COST ESTIMATOR
 * ============================================================================
 *
 *  The commercial argument for this component: a prospect who has spent ninety
 *  seconds assembling their own scope arrives at the booking form already
 *  qualified, and already anchored to a number. It filters out the enquiries
 *  that were never going to convert without a single email exchange.
 *
 *  Engineering notes:
 *   • Pricing math lives in `content/pricing.ts`, not here. This component
 *     only renders it — which is why the same function can re-price the quote
 *     server-side before it is attached to a booking.
 *   • Selection is one flat `Set<string>`, so radio groups and checkbox groups
 *     share a single state shape and a single reducer path.
 *   • Radios are real radios and checkboxes are real checkboxes. A div with an
 *     onClick would have cost me arrow-key navigation, form semantics and
 *     announced state for nothing.
 */
export function CostEstimator() {
  const t = useTranslations('estimator');
  const locale = useLocale();

  const [selected, setSelected] = useState<Set<string>>(new Set(defaultSelection));
  const [rush, setRush] = useState(false);

  const quote = useMemo(() => calculateQuote([...selected], rush), [selected, rush]);

  function toggle(groupId: string, optionId: string, exclusive: boolean) {
    setSelected((previous) => {
      const next = new Set(previous);

      if (exclusive) {
        // Radio: clear every sibling in this group first.
        const group = estimatorGroups.find((g) => g.id === groupId);
        group?.options.forEach((option) => next.delete(option.id));
        next.add(optionId);
      } else {
        if (next.has(optionId)) next.delete(optionId);
        else next.add(optionId);
      }

      return next;
    });
  }

  function reset() {
    setSelected(new Set(defaultSelection));
    setRush(false);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      {/* ── Options ──────────────────────────────────────────────── */}
      <div className="space-y-6">
        {estimatorGroups.map((group) => (
          <fieldset key={group.id} className="surface-card rounded-2xl p-5">
            <legend className="px-1 text-sm font-semibold">
              {t(`groups.${group.id}.title`)}
            </legend>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {group.options.map((option) => {
                const isSelected = selected.has(option.id);
                const isRadio = group.type === 'radio';

                return (
                  <label
                    key={option.id}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition-all',
                      isSelected
                        ? 'border-[var(--accent)] bg-[var(--surface-sunken)]'
                        : 'border-[var(--border-subtle)] hover:border-[var(--accent)]',
                    )}
                  >
                    <input
                      type={isRadio ? 'radio' : 'checkbox'}
                      name={group.id}
                      checked={isSelected}
                      onChange={() => toggle(group.id, option.id, Boolean(isRadio))}
                      className="size-4 shrink-0 accent-[var(--accent)]"
                    />
                    <span className="flex-1">{t(`groups.${group.id}.options.${option.id}`)}</span>
                    {option.price > 0 && (
                      <span className="numeric shrink-0 text-xs font-medium text-[var(--text-muted)]">
                        +{formatMoney(option.price, locale)}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}

        <label className="surface-card flex cursor-pointer items-center gap-3 rounded-2xl p-4">
          <input
            type="checkbox"
            checked={rush}
            onChange={(event) => setRush(event.target.checked)}
            className="size-4 accent-[var(--accent)]"
          />
          <Zap className="size-4 text-amber-500" aria-hidden="true" />
          <span className="flex-1 text-sm">
            <span className="font-medium">{t('rush.label')}</span>
            <span className="block text-xs text-[var(--text-muted)]">{t('rush.hint')}</span>
          </span>
        </label>
      </div>

      {/* ── Running total ────────────────────────────────────────── */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="surface-card rounded-2xl p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            {t('summary')}
          </p>

          {/* aria-live so the total is announced as options change — otherwise
              the whole component is invisible to a screen-reader user. */}
          <div aria-live="polite">
            <p className="mt-1 text-xs text-[var(--text-muted)]">{t('estimatedRange')}</p>
            <p className="numeric mt-1 text-3xl font-bold tracking-tight text-[var(--accent)]">
              {formatMoney(quote.low, locale)}
              <span className="mx-1.5 text-[var(--text-muted)]">–</span>
              {formatMoney(quote.high, locale)}
            </p>

            <div className="mt-4 flex items-center gap-2 border-t border-[var(--border-subtle)] pt-4 text-sm text-[var(--text-secondary)]">
              <Clock className="size-4 shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
              <span>{t('timeline')}:</span>
              <span className="numeric font-semibold">{t('days', { count: quote.days })}</span>
            </div>

            <p className="mt-2 text-xs text-[var(--text-muted)]">
              {t('selected', { count: selected.size })}
            </p>
          </div>

          <a
            href="#contact"
            className="group mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-contrast)] transition-transform hover:scale-[1.02]"
          >
            {t('cta')}
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
              aria-hidden="true"
            />
          </a>

          <button
            type="button"
            onClick={reset}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
            {t('reset')}
          </button>

          <p className="mt-4 text-[11px] leading-relaxed text-[var(--text-muted)]">
            {t('disclaimer')}
          </p>
        </div>
      </div>
    </div>
  );
}
