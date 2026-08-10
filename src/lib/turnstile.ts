const VERIFY_ENDPOINT = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

interface TurnstileResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
}

/**
 * Server-side verification of a Cloudflare Turnstile token.
 *
 * The browser widget produces a token; it is worthless until Cloudflare
 * confirms it here. Tokens are single-use and expire after ~5 minutes.
 *
 * Fails CLOSED: any network error or missing secret rejects the submission.
 * A contact form that silently accepts spam when the CAPTCHA provider blips
 * is worse than one that asks the user to retry.
 */
export async function verifyTurnstile(
  token: string,
  remoteIp?: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    // Misconfiguration must never look like a pass.
    return { ok: false, reason: 'turnstile_not_configured' };
  }

  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp && remoteIp !== 'anonymous') body.set('remoteip', remoteIp);

  try {
    const res = await fetch(VERIFY_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body,
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return { ok: false, reason: `turnstile_http_${res.status}` };

    const data = (await res.json()) as TurnstileResponse;

    return data.success
      ? { ok: true }
      : { ok: false, reason: data['error-codes']?.join(',') ?? 'turnstile_rejected' };
  } catch {
    return { ok: false, reason: 'turnstile_unreachable' };
  }
}
