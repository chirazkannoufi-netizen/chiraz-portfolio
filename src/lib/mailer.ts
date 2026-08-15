import nodemailer from 'nodemailer';

import { profile } from '@/content/profile';
import type { ContactPayload } from '@/types';

/**
 * ============================================================================
 *  SMTP FALLBACK — the safety net under the n8n webhook
 * ============================================================================
 *
 *  The n8n workflow is the primary delivery path: it fans a lead out to
 *  Telegram, email and Supabase. This module exists for the moments it can't
 *  run — no `N8N_WEBHOOK_URL` configured yet, the instance is down, or the
 *  call times out — because a dropped lead is the one failure this form
 *  cannot afford. It is deliberately *not* a second fan-out: one email,
 *  straight to Chiraz, containing everything the visitor typed.
 *
 *  Configuration is optional. With no SMTP variables set the fallback simply
 *  reports itself unavailable rather than throwing, so a site with neither
 *  channel configured still fails predictably instead of 500ing.
 */

function env(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() !== '' ? value.trim() : undefined;
}

/** True when enough SMTP settings exist to even attempt a send. */
export function isMailerConfigured(): boolean {
  return Boolean(env('SMTP_HOST') && env('SMTP_USER') && env('SMTP_PASS'));
}

/** Where the fallback lands. Defaults to the address already on the site. */
function recipient(): string {
  return env('CONTACT_TO') ?? profile.contact.email;
}

export interface FallbackContext {
  /** Why the primary path was skipped — surfaced in the email subject. */
  reason: 'webhook_not_configured' | 'webhook_failed';
  submittedAt: string;
  ip: string;
}

/**
 * Sends the lead straight to Chiraz over SMTP.
 *
 * Resolves to `{ ok: false }` rather than throwing: the caller is a request
 * handler that must still answer the visitor, and an SMTP outage should not
 * turn into a 500.
 */
export async function sendContactFallback(
  data: ContactPayload,
  context: FallbackContext,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!isMailerConfigured()) {
    return { ok: false, reason: 'smtp_not_configured' };
  }

  const port = Number(env('SMTP_PORT') ?? 587);

  const transport = nodemailer.createTransport({
    host: env('SMTP_HOST'),
    port,
    // 465 is implicit TLS; 587 upgrades via STARTTLS.
    secure: port === 465,
    auth: { user: env('SMTP_USER')!, pass: env('SMTP_PASS')! },
  });

  const lines = [
    `Name:    ${data.name}`,
    `Email:   ${data.email}`,
    data.company ? `Company: ${data.company}` : null,
    data.budget ? `Budget:  ${data.budget}` : null,
    `Locale:  ${data.locale}`,
    `Sent:    ${context.submittedAt}`,
    `IP:      ${context.ip}`,
    '',
    data.message,
    '',
    '—',
    context.reason === 'webhook_not_configured'
      ? 'Delivered by the SMTP fallback because N8N_WEBHOOK_URL is not set.'
      : 'Delivered by the SMTP fallback because the n8n webhook did not accept the lead.',
  ].filter(Boolean);

  try {
    await transport.sendMail({
      from: env('SMTP_FROM') ?? env('SMTP_USER')!,
      to: recipient(),
      // Replying to the notification replies to the visitor.
      replyTo: `${data.name} <${data.email}>`,
      subject: `Portfolio contact — ${data.name}`,
      text: lines.join('\n'),
    });
    return { ok: true };
  } catch (error) {
    console.error('[contact] SMTP fallback failed', error);
    return { ok: false, reason: 'smtp_send_failed' };
  }
}
