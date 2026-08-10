import { openai } from '@ai-sdk/openai';
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from 'ai';

import { buildSystemPrompt } from '@/lib/ai/system-prompt';
import { chatRequestSchema } from '@/lib/schemas';
import { getClientIp, rateLimit } from '@/lib/rate-limit';
import { routing, type Locale } from '@/i18n/routing';

/**
 * ============================================================================
 *  POST /api/chat — CV Chatbot Agent
 * ============================================================================
 *
 *  Streams a grounded, multilingual answer about Chiraz's background.
 *
 *  Order of operations is deliberate — every check that can reject the request
 *  runs BEFORE the model is called, because the model call is the only step
 *  that costs money:
 *
 *    1. rate limit   (cheap, in-memory)
 *    2. schema check (cheap, bounds the payload)
 *    3. model call   (expensive)
 */

export const maxDuration = 30;

/** Hard ceiling per IP per minute. Generous for a human, hostile to a script. */
const CHAT_LIMIT = 12;
const CHAT_WINDOW_MS = 60_000;

export async function POST(req: Request) {
  // ── 1. Rate limit ────────────────────────────────────────────────
  const ip = getClientIp(req);
  const limit = rateLimit(`chat:${ip}`, CHAT_LIMIT, CHAT_WINDOW_MS);

  if (!limit.success) {
    return Response.json(
      { error: 'rate_limited', retryAfter: limit.retryAfter },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    );
  }

  // ── 2. Validate ──────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400 });
  }

  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: 'invalid_request' }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) {
    // Explicit 503 beats an opaque provider stack trace in the client.
    return Response.json({ error: 'ai_not_configured' }, { status: 503 });
  }

  const locale: Locale = parsed.data.locale ?? routing.defaultLocale;
  const messages = parsed.data.messages as UIMessage[];

  // ── 3. Stream ────────────────────────────────────────────────────
  const result = streamText({
    model: openai(process.env.AI_MODEL ?? 'gpt-4o-mini'),

    // AI SDK 7 names this `instructions`. On AI SDK ≤ 6 the equivalent
    // parameter is `system` — rename this single key if you downgrade.
    instructions: buildSystemPrompt(locale),

    messages: await convertToModelMessages(messages),

    // Low temperature: this agent recites verified facts. Creativity here is
    // indistinguishable from hallucination.
    temperature: 0.3,

    // Caps a runaway answer. The prompt already asks for 2–3 sentences; this
    // is the enforcement backstop.
    maxOutputTokens: 700,
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
