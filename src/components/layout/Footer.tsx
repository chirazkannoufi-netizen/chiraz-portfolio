import { useTranslations } from 'next-intl';
import { Github, Linkedin, Mail } from 'lucide-react';

import { profile } from '@/content/profile';

export function Footer() {
  const t = useTranslations('footer');
  // Rendered on the server: no hydration mismatch from a client-side clock.
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border-subtle)] bg-[var(--surface-sunken)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-12 sm:px-8 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold">{profile.name}</p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">{t('tagline')}</p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={profile.contact.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="grid size-9 place-items-center rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-raised)] text-[var(--text-secondary)] transition-colors hover:text-[var(--accent)]"
          >
            <Github className="size-4" aria-hidden="true" />
          </a>
          <a
            href={profile.contact.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="grid size-9 place-items-center rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-raised)] text-[var(--text-secondary)] transition-colors hover:text-[var(--accent)]"
          >
            <Linkedin className="size-4" aria-hidden="true" />
          </a>
          <a
            href={`mailto:${profile.contact.email}`}
            aria-label={profile.contact.email}
            className="grid size-9 place-items-center rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-raised)] text-[var(--text-secondary)] transition-colors hover:text-[var(--accent)]"
          >
            <Mail className="size-4" aria-hidden="true" />
          </a>
        </div>
      </div>

      <div className="border-t border-[var(--border-subtle)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-5 text-xs text-[var(--text-muted)] sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>{t('rights', { year })}</p>
          <p>{t('builtWith')}</p>
        </div>

        {/* Signature line. Left untranslated on purpose — it reads as a
            personal mark rather than UI copy, and stays identical in all
            four locales. `dir="ltr"` keeps the name and heart in order
            inside the Arabic RTL layout. */}
        <p
          dir="ltr"
          className="border-t border-[var(--border-subtle)] px-5 py-4 text-center text-xs text-[var(--text-muted)] sm:px-8"
        >
          Made with <span className="text-[var(--accent)]">♡</span> by Chiraz
        </p>
      </div>
    </footer>
  );
}
