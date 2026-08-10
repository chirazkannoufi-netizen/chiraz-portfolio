/**
 * Fixed-window rate limiter backed by an in-process Map.
 *
 * Deliberately dependency-free. On a single Vercel instance this stops the
 * obvious abuse (someone holding Enter on the chatbot) at zero cost and zero
 * latency.
 *
 * ⚠️  Scaling note: serverless instances don't share memory, so the effective
 * limit is `limit × instances`. That is an acceptable trade for a portfolio.
 * If traffic ever justifies it, swap the body of `rateLimit()` for
 * `@upstash/ratelimit` — the signature is intentionally identical.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

/** Evict expired buckets so the Map can't grow unbounded on a warm instance. */
function sweep(now: number): void {
  if (buckets.size < 500) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  /** Seconds until the window resets — surfaced as `Retry-After`. */
  retryAfter: number;
}

export function rateLimit(
  identifier: string,
  limit = 20,
  windowMs = 60_000,
): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const bucket = buckets.get(identifier);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(identifier, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, retryAfter: 0 };
  }

  bucket.count += 1;

  if (bucket.count > limit) {
    return {
      success: false,
      remaining: 0,
      retryAfter: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  return { success: true, remaining: limit - bucket.count, retryAfter: 0 };
}

/**
 * Best-effort client IP. Vercel and Cloudflare both populate these headers;
 * we fall back to a constant so a missing header degrades to a shared bucket
 * rather than handing out an unlimited quota.
 */
export function getClientIp(request: Request): string {
  const headers = request.headers;
  return (
    headers.get('cf-connecting-ip') ??
    headers.get('x-real-ip') ??
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'anonymous'
  );
}
