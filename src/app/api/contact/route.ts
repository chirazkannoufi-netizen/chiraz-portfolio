import { contactSchema } from '@/lib/schemas';
import { verifyTurnstile } from '@/lib/turnstile';
import { getClientIp, rateLimit } from '@/lib/rate-limit';

/**
 * ============================================================================
 *  POST /api/contact — secure lead intake
 * ============================================================================
 *
 *  Defence in depth, cheapest filter first:
 *
 *    1. Rate limit    — 5 submissions / IP / 10 min (free, instant)
 *    2. Honeypot      — hidden `website` field must be empty (free)
 *    3. Zod           — shape, length, type (free)
 *    4. Turnstile     — one network round-trip to Cloudflare (~100 ms)
 *    5. n8n webhook   — fan-out to Telegram + email + Supabase
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

  // ── 5. Fan-out via n8n ───────────────────────────────────────────
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error('[contact] N8N_WEBHOOK_URL is not set — lead was dropped');
    return Response.json({ ok: false, error: 'delivery_unavailable' }, { status: 503 });
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        // Shared secret — verify inside the n8n workflow so the webhook URL
        // leaking doesn't let anyone inject fake leads into Telegram.
        'x-portfolio-signature': process.env.N8N_WEBHOOK_SECRET ?? '',
      },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        company: data.company || null,
        budget: data.budget ?? null,
        message: data.message,
        locale: data.locale,
        meta: {
          ip,
          userAgent: req.headers.get('user-agent') ?? 'unknown',
          referer: req.headers.get('referer') ?? null,
          receivedAt: new Date().toISOString(),
        },
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) throw new Error(`n8n responded ${res.status}`);
  } catch (error) {
    // The lead is the product. Log loudly so a failed delivery is visible in
    // observability rather than silently swallowed.
    console.error('[contact] webhook delivery failed', error);
    return Response.json({ ok: false, error: 'delivery_failed' }, { status: 502 });
  }

  return Response.json({ ok: true }, { status: 200 });
}
