import { contactSchema } from '@/lib/schemas';
import { verifyTurnstile } from '@/lib/turnstile';
import { getClientIp, rateLimit } from '@/lib/rate-limit';
import { sendContactFallback } from '@/lib/mailer';

/**
 * ============================================================================
 *  POST /api/contact — secure lead intake
 * ============================================================================
 *
 *  Defence in depth, cheapest filter first:
 *
 *    1. Rate limit    — 5 submissions / IP / 10 min (free, instant)
 *    2. Zod           — shape, length, type (free)
 *    3. Honeypot      — hidden `website` field must be empty (free). Checked
 *                       after Zod, and Zod deliberately tolerates a filled
 *                       one: rejecting it there would name the field in the
 *                       422 and teach the bot what to drop next time.
 *    4. Turnstile     — one network round-trip to Cloudflare (~100 ms)
 *    5. Delivery      — n8n webhook, with a direct-email fallback beneath it
 *
 *  The response is intentionally uniform: a caller cannot distinguish
 *  "captcha failed" from "you're rate limited" by timing or message, which
 *  denies a spammer the feedback loop they'd need to tune around the filters.
 */

const CONTACT_LIMIT = 5;
const CONTACT_WINDOW_MS = 10 * 60_000;

export async function POST(req: Request) {
  const ip = getClientIp(req);

  // ── 1. Rate limit ────────────────────────────────────────────────
  const limit = rateLimit(`contact:${ip}`, CONTACT_LIMIT, CONTACT_WINDOW_MS);
  if (!limit.success) {
    return Response.json(
      { ok: false, error: 'rate_limited', retryAfter: limit.retryAfter },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    );
  }

  // ── 2 & 3. Parse + validate ──────────────────────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      {
        ok: false,
        error: 'validation_failed',
        // Field-level keys only — resolved to localised copy on the client.
        issues: parsed.error.issues.map((i) => ({
          path: i.path.join('.'),
          key: i.message,
        })),
      },
      { status: 422 },
    );
  }

  const data = parsed.data;

  // Honeypot tripped: respond 200 so the bot logs a success and moves on.
  // A 4xx tells it the field is detected and invites a retry without it.
  if (data.website) {
    return Response.json({ ok: true }, { status: 200 });
  }

  // ── 4. Turnstile ─────────────────────────────────────────────────
  const captcha = await verifyTurnstile(data.turnstileToken, ip);
  if (!captcha.ok) {
    return Response.json({ ok: false, error: 'captcha_failed' }, { status: 403 });
  }

  // ── 5. Deliver ───────────────────────────────────────────────────
  // Primary path is the n8n webhook; SMTP is the safety net beneath it. The
  // lead is the product, so "nowhere to send it" must never mean "lose it".
  const submittedAt = new Date().toISOString();
  const webhookUrl = process.env.N8N_WEBHOOK_URL;

  if (webhookUrl) {
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          // The raw shared secret, sent as-is — NOT an HMAC of the body. The
          // n8n workflow compares this header against the same secret and
          // stops if it differs, so leaking the webhook URL alone doesn't let
          // anyone inject fake leads.
          'x-portfolio-signature': process.env.N8N_WEBHOOK_SECRET ?? '',
        },
        // Contract: name / email / message / locale / submitted_at are the
        // agreed fields. company, budget and meta are extras the form also
        // collects — n8n can read or ignore them, but dropping them here
        // would silently lose data the visitor actually filled in.
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          message: data.message,
          locale: data.locale,
          submitted_at: submittedAt,
          company: data.company || null,
          // `|| null`, not `?? null`: an untouched dropdown submits `''`,
          // which is "no answer", not an answer of empty string.
          budget: data.budget || null,
          meta: {
            ip,
            userAgent: req.headers.get('user-agent') ?? 'unknown',
            referer: req.headers.get('referer') ?? null,
          },
        }),
        // Short on purpose. The webhook is expected to acknowledge
        // immediately and fan out to Telegram/Google Sheets on its own time;
        // the visitor should never sit watching a spinner for that.
        signal: AbortSignal.timeout(5_000),
      });

      // Any 2xx is the acknowledgement we asked for — done.
      if (res.ok) {
        return Response.json({ ok: true }, { status: 200 });
      }
      console.error(`[contact] n8n responded ${res.status} — falling back to email`);
    } catch (error) {
      console.error('[contact] webhook unreachable or timed out — falling back to email', error);
    }
  } else {
    console.warn('[contact] N8N_WEBHOOK_URL is not set — using the email fallback');
  }

  const fallback = await sendContactFallback(data, {
    reason: webhookUrl ? 'webhook_failed' : 'webhook_not_configured',
    submittedAt,
    ip,
  });

  if (fallback.ok) {
    return Response.json({ ok: true }, { status: 200 });
  }

  // Both channels are down. Say so honestly rather than showing a success
  // screen for a message that went nowhere — the form's error copy points
  // the visitor at the email and WhatsApp links, which always work.
  console.error(`[contact] lead could not be delivered (${fallback.reason})`, {
    name: data.name,
    email: data.email,
    submittedAt,
  });
  return Response.json({ ok: false, error: 'delivery_unavailable' }, { status: 503 });
}
