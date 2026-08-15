'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Menu, X, Mail } from 'lucide-react';

import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { cn } from '@/lib/utils';

const SECTIONS = [
  { id: 'work', key: 'work' },
  { id: 'services', key: 'services' },
  { id: 'about', key: 'about' },
  { id: 'contact', key: 'contact' },
] as const;

export function Navbar() {
  const t = useTranslations('nav');
  const reduceMotion = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  /** Frosted background only once the page has moved — flat at rest. */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /**
   * Scroll-spy via IntersectionObserver rather than scroll math — no
   * per-frame layout reads, so it can't cause jank.
   */
  useEffect(() => {
    const targets = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveSection(visible.target.id);
      },
      // Band across the middle of the viewport: a section counts as "active"
      // when it occupies the reader's actual focus area.
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  /** Lock body scroll while the mobile sheet is open. */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled ? 'py-2' : 'py-4',
      )}
    >
      <nav
        aria-label="Primary"
        className={cn(
          'mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-2xl px-4 py-2.5 transition-all duration-300 sm:px-5',
          scrolled ? 'glass mx-4 shadow-lg shadow-black/5 sm:mx-8' : 'mx-4 sm:mx-8',
        )}
      >
        <Link
          href="/"
          className="group flex items-center gap-2 font-semibold tracking-tight"
          aria-label="Chiraz Lina Kannoufi — home"
        >
          <Image
            src="/ME.png"
            alt=""
            width={32}
            height={32}
            priority
            className="size-8 rounded-full object-cover ring-1 ring-[var(--border-subtle)] transition-shadow group-hover:shadow-[0_0_14px_var(--circuit)] group-hover:ring-[var(--circuit-strong)]"
          />
          <span className="hidden text-sm sm:inline">chiraz.dev</span>
        </Link>

        {/* Desktop navigation */}
        <ul className="hidden items-center gap-1 md:flex">
          {SECTIONS.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                aria-current={activeSection === section.id ? 'true' : undefined}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                  activeSection === section.id
                    ? 'text-[var(--accent)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                )}
              >
                {t(section.key)}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />

          <a
            href="#contact"
            aria-label={t('contact')}
            title={t('contact')}
            className="hidden size-9 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-raised)] text-[var(--text-secondary)] transition-all hover:border-[var(--circuit-strong)] hover:text-[var(--accent)] hover:shadow-[0_0_12px_var(--circuit)] active:scale-[0.96] sm:inline-flex"
          >
            <Mail className="size-4" aria-hidden="true" />
          </a>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? t('close') : t('menu')}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            className="grid size-9 place-items-center rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-raised)] text-[var(--text-secondary)] md:hidden"
          >
            {mobileOpen ? (
              <X className="size-4" aria-hidden="true" />
            ) : (
              <Menu className="size-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile sheet */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            initial={reduceMotion ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="glass mx-4 mt-2 rounded-2xl p-3 md:hidden sm:mx-8"
          >
            <ul className="flex flex-col gap-1">
              {SECTIONS.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-lg px-4 py-3 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-sunken)]"
                  >
                    {t(section.key)}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
