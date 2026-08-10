'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Check, Globe, Loader2 } from 'lucide-react';

import { usePathname, useRouter } from '@/i18n/navigation';
import { locales, localeMeta, type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';

/**
 * ============================================================================
 *  LANGUAGE SWITCHER
 * ============================================================================
 *
 *  Design decisions worth knowing:
 *
 *  • Switching preserves the current path. A visitor reading /fr/#projects who
 *    picks Arabic lands on /ar/#projects, not back at the homepage. That is
 *    the whole difference between a language switcher and a language button.
 *
 *  • Native <button> + explicit roving focus rather than a headless menu
 *    library — four items don't justify the dependency, and this way the
 *    keyboard contract is visible in the source.
 *
 *  • Each option is labelled in its OWN language (العربية, not "Arabic"),
 *    because someone who can't read the current language still needs to find
 *    theirs. The English name is kept as a secondary line for scanability.
 *
 *  • Navigation runs inside `useTransition`, so React keeps the old UI
 *    interactive and we can show a spinner instead of a frozen dropdown.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations('language');
  const activeLocale = useLocale() as Locale;

  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  /** Close on outside click and on Escape. */
  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent | TouchEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus(); // return focus where the user left it
      }
    }

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  /** Move focus into the list when it opens — required for keyboard users. */
  useEffect(() => {
    if (!open) return;
    const activeIndex = locales.indexOf(activeLocale);
    itemRefs.current[activeIndex === -1 ? 0 : activeIndex]?.focus();
  }, [open, activeLocale]);

  function switchTo(next: Locale) {
    setOpen(false);
    if (next === activeLocale) return;

    startTransition(() => {
      // `params` is spread back in so dynamic segments (e.g. /[locale]/work/
      // [slug]) survive the switch instead of resolving to a literal ":slug".
      router.replace({ pathname, params }, { locale: next });
    });
  }

  /** Up/Down arrows cycle through options; Home/End jump to the ends. */
  function onListKeyDown(event: React.KeyboardEvent, index: number) {
    const last = locales.length - 1;
    let nextIndex: number | null = null;

    switch (event.key) {
      case 'ArrowDown':
        nextIndex = index === last ? 0 : index + 1;
        break;
      case 'ArrowUp':
        nextIndex = index === 0 ? last : index - 1;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = last;
        break;
      default:
        return;
    }

    event.preventDefault();
    itemRefs.current[nextIndex]?.focus();
  }

  const active = localeMeta[activeLocale];

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('current', { language: active.label })}
        className="flex h-9 items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-raised)] px-2.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--accent)]"
      >
        {isPending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Globe className="size-4" aria-hidden="true" />
        )}
        <span className="hidden sm:inline">{activeLocale.toUpperCase()}</span>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t('switch')}
          // `end-0` (logical) not `right-0`: in RTL the menu must align to the
          // left edge automatically. Physical properties would break Arabic.
          className="absolute end-0 top-11 z-50 w-52 overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-1 shadow-xl shadow-black/5 dark:shadow-black/40"
        >
          {locales.map((locale, index) => {
            const meta = localeMeta[locale];
            const isActive = locale === activeLocale;

            return (
              <li key={locale} role="option" aria-selected={isActive}>
                <button
                  ref={(el) => {
                    itemRefs.current[index] = el;
                  }}
                  type="button"
                  // Each label is in its own script, so mark it up as such —
                  // screen readers switch voice, and Arabic renders RTL inside
                  // an otherwise LTR menu.
                  lang={locale}
                  dir={locale === 'ar' ? 'rtl' : 'ltr'}
                  onClick={() => switchTo(locale)}
                  onKeyDown={(event) => onListKeyDown(event, index)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-start text-sm transition-colors',
                    isActive
                      ? 'bg-[var(--surface-sunken)] text-[var(--accent)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--surface-sunken)]',
                  )}
                >
                  <span aria-hidden="true" className="text-base leading-none">
                    {meta.flag}
                  </span>
                  <span className="flex-1">
                    <span className="block font-medium">{meta.label}</span>
                    <span className="block text-xs text-[var(--text-muted)]">
                      {meta.english}
                    </span>
                  </span>
                  {isActive && <Check className="size-4 shrink-0" aria-hidden="true" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
