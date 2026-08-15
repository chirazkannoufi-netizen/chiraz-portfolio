'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale, useTranslations } from 'next-intl';
import { AlertCircle, CheckCircle2, Loader2, MessageCircle, Send } from 'lucide-react';

import { contactFormSchema, type ContactFormValues } from '@/lib/schemas';
import { profile } from '@/content/profile';
import { Turnstile } from './Turnstile';
import { cn } from '@/lib/utils';
import type { Locale } from '@/i18n/routing';

/**
 * ============================================================================
 *  SECURE CONTACT FORM
 * ============================================================================
 *
 *  Client stack: React Hook Form (uncontrolled inputs — no re-render per
 *  keystroke) + Zod through `zodResolver`, sharing the exact schema the server
 *  re-validates against. One definition, two enforcement points.
 *
 *  A detail that matters: Zod messages here are translation KEYS, not English
 *  sentences. `contact.validation.nameShort` resolves through next-intl at
 *  render time, so a French visitor gets a French validation error from the
 *  same schema the English visitor hit. Hard-coding English strings in the
 *  schema is the usual way multilingual forms end up half-translated.
 *
 *  Server-side, `/api/contact` independently re-runs this schema, verifies the
 *  Turnstile token with Cloudflare, and rate-limits by IP. Nothing here is
 *  trusted; this layer exists purely so the user finds out immediately.
 */

type Status = 'idle' | 'submitting' | 'success' | 'error';

const BUDGETS = ['under-500', '500-1500', '1500-5000', '5000-plus', 'not-sure'] as const;

export function ContactForm() {
  const t = useTranslations('contact');
  const locale = useLocale() as Locale;

  const [status, setStatus] = useState<Status>('idle');
  const [errorKey, setErrorKey] = useState<string>('network');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    mode: 'onBlur', // validate on blur, not per keystroke — less shouty
  });

  /** Resolve a Zod message key to localised copy, with a safe fallback. */
  function messageFor(key?: string): string | undefined {
    if (!key) return undefined;
    return key.startsWith('validation.') ? t(key) : key;
  }

  async function onSubmit(values: ContactFormValues) {
    if (!captchaToken) {
      setStatus('error');
      setErrorKey('captcha_failed');
      return;
    }

    setStatus('submitting');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...values, locale, turnstileToken: captchaToken }),
      });

      const data = (await response.json()) as { ok: boolean; error?: string };

      if (!response.ok || !data.ok) {
        setErrorKey(data.error ?? 'network');
        setStatus('error');
        return;
      }

      reset();
      setCaptchaToken(null);
      setStatus('success');
    } catch {
      setErrorKey('network');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div
        role="status"
        className="surface-card flex flex-col items-center gap-3 rounded-2xl p-10 text-center"
      >
        <CheckCircle2 className="size-10 text-emerald-500" aria-hidden="true" />
        <h3 className="text-lg font-semibold">{t('successTitle')}</h3>
        <p className="max-w-sm text-sm text-[var(--text-secondary)]">{t('successBody')}</p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-2 text-sm font-medium text-[var(--accent)]"
        >
          {t('sendAnother')}
        </button>
      </div>
    );
  }

  const fieldClass =
    'w-full rounded-xl border bg-[var(--surface-raised)] px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]';

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="surface-card rounded-2xl p-6">
      {/* Honeypot. `tabIndex={-1}` and aria-hidden keep it away from humans
          and assistive tech; a bot filling every field trips it. Not display:
          none — some bots skip hidden inputs specifically. */}
      <div className="absolute -left-[9999px] top-0" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" type="text" tabIndex={-1} autoComplete="off" {...register('website')} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="name"
          label={t('fields.name')}
          error={messageFor(errors.name?.message)}
          required
        >
          <input
            id="name"
            type="text"
            autoComplete="name"
            placeholder={t('fields.namePlaceholder')}
            aria-invalid={Boolean(errors.name)}
            className={cn(
              fieldClass,
              errors.name ? 'border-red-500' : 'border-[var(--border-subtle)]',
            )}
            {...register('name')}
          />
        </Field>

        <Field
          id="email"
          label={t('fields.email')}
          error={messageFor(errors.email?.message)}
          required
        >
          <input
            id="email"
            type="email"
            autoComplete="email"
            dir="ltr"
            placeholder={t('fields.emailPlaceholder')}
            aria-invalid={Boolean(errors.email)}
            className={cn(
              fieldClass,
              errors.email ? 'border-red-500' : 'border-[var(--border-subtle)]',
            )}
            {...register('email')}
          />
        </Field>

        <Field id="company" label={t('fields.company')} hint={t('optional')}>
          <input
            id="company"
            type="text"
            autoComplete="organization"
            placeholder={t('fields.companyPlaceholder')}
            className={cn(fieldClass, 'border-[var(--border-subtle)]')}
            {...register('company')}
          />
        </Field>

        <Field id="budget" label={t('fields.budget')} hint={t('optional')}>
          <select
            id="budget"
            defaultValue=""
            className={cn(fieldClass, 'border-[var(--border-subtle)]')}
            {...register('budget')}
          >
            <option value="" disabled>
              {t('fields.budgetPlaceholder')}
            </option>
            {BUDGETS.map((budget) => (
              <option key={budget} value={budget}>
                {t(`budgets.${budget}`)}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mt-4">
        <Field
          id="message"
          label={t('fields.message')}
          error={messageFor(errors.message?.message)}
          required
        >
          <textarea
            id="message"
            rows={5}
            placeholder={t('fields.messagePlaceholder')}
            aria-invalid={Boolean(errors.message)}
            className={cn(
              fieldClass,
              'resize-y',
              errors.message ? 'border-red-500' : 'border-[var(--border-subtle)]',
            )}
            {...register('message')}
          />
        </Field>
      </div>

      <div className="mt-5">
        <Turnstile onVerify={setCaptchaToken} onExpire={() => setCaptchaToken(null)} />
        <p className="mt-1 text-[11px] text-[var(--text-muted)]">{t('protectedBy')}</p>
      </div>

      {status === 'error' && (
        <div
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-500/5 p-3 text-sm text-red-500"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            <strong className="block font-semibold">{t('errorTitle')}</strong>
            {t(`errors.${errorKey}`)}
          </span>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-[var(--accent)] px-6 text-sm font-semibold text-[var(--accent-contrast)] transition-transform hover:scale-[1.03] disabled:opacity-60 disabled:hover:scale-100"
        >
          {status === 'submitting' ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              {t('sending')}
            </>
          ) : (
            <>
              <Send className="size-4 rtl:-scale-x-100" aria-hidden="true" />
              {t('submit')}
            </>
          )}
        </button>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <a
            href={`mailto:${profile.contact.email}`}
            dir="ltr"
            className="text-sm text-[var(--text-muted)] underline-offset-4 hover:text-[var(--accent)] hover:underline"
          >
            {profile.contact.email}
          </a>

          {/* Second, lower-friction channel for anyone who would rather not
              fill in a form. Opens WhatsApp directly. */}
          <a
            href={profile.contact.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-muted)] underline-offset-4 transition-colors hover:text-[var(--accent)] hover:underline"
          >
            <MessageCircle className="size-4" aria-hidden="true" />
            {t('whatsapp')}
          </a>
        </div>
      </div>
    </form>
  );
}

/** Label + error plumbing, so every field is wired up identically. */
function Field({
  id,
  label,
  hint,
  error,
  required,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 flex items-baseline gap-2 text-sm font-medium">
        {label}
        {required && (
          <span className="text-red-500" aria-hidden="true">
            *
          </span>
        )}
        {hint && <span className="text-xs font-normal text-[var(--text-muted)]">({hint})</span>}
      </label>

      {children}

      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
