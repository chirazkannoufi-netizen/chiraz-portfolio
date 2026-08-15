# Architecture & System Setup

**Project:** Interactive Digital Portfolio & AI Engine
**For:** Chiraz Lina Kannoufi — Web & Automation Developer
**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · next-intl v4 · Vercel AI SDK v7

---

## 1. The one architectural decision everything else follows from

**Facts live in exactly one typed file. Prose lives in exactly four JSON files. Nothing else holds content.**

```
src/content/profile.ts   →  verified CV facts (language-neutral)
messages/{en,fr,ar,de}.json  →  every string a human reads
```

`profile.ts` feeds the hero, the timeline, the JSON-LD structured data **and the AI agent's system prompt**. That last one is the point: the chatbot's knowledge base is *generated* from the same file the site renders, so the agent physically cannot claim a credential the site doesn't show. Update the CV in one place; the site, the SEO metadata and the AI all move together.

This is what stops a recruiter-facing chatbot from inventing a Master's degree — the failure mode that makes AI portfolio agents a liability rather than an asset.

> **Note on the record:** your CV states a *Licence en Informatique (Bac+3 / B.Sc.)* from Université Ferhat Abbas Sétif 1, while the Cahier des Charges said "Master's". The build uses **Licence / B.Sc.** throughout, and the system prompt names the level explicitly with an instruction not to soften or upgrade it.

---

## 2. Folder structure

```
chiraz-portfolio/
├── messages/                     # 253 keys × 4 locales, parity-enforced in CI
│   ├── en.json  fr.json  ar.json  de.json
├── scripts/
│   └── check-i18n.mjs            # fails the build if a locale drifts
├── public/
│   └── cv/chiraz-lina-kannoufi-{en,fr,ar,de}.pdf
└── src/
    ├── proxy.ts                  # Next 16 middleware → locale negotiation
    ├── i18n/
    │   ├── routing.ts            # locales, RTL set, display metadata
    │   ├── navigation.ts         # locale-aware <Link> / useRouter
    │   └── request.ts            # per-request locale + lazy dictionary load
    ├── content/                  # ── SOURCE OF TRUTH ──
    │   ├── profile.ts            # verified CV facts
    │   ├── projects.ts           # case-study registry (structure only)
    │   └── pricing.ts            # pure pricing engine, no React
    ├── lib/
    │   ├── ai/system-prompt.ts   # generated from profile.ts
    │   ├── schemas.ts            # Zod — shared client + server
    │   ├── rate-limit.ts         # fixed-window, in-process
    │   ├── turnstile.ts          # server-side CAPTCHA verification
    │   └── utils.ts
    ├── types/index.ts
    ├── app/
    │   ├── globals.css           # Tailwind v4 @theme — the design system
    │   ├── [locale]/
    │   │   ├── layout.tsx        # ROOT layout: <html lang dir>, providers
    │   │   ├── page.tsx          # section composition + JSON-LD
    │   │   └── not-found.tsx
    │   ├── not-found.tsx         # global 404 (outside any locale)
    │   ├── api/
    │   │   ├── chat/route.ts     # streaming AI agent
    │   │   └── contact/route.ts  # validated + CAPTCHA'd lead intake
    │   ├── sitemap.ts            # per-locale + hreflang
    │   └── robots.ts
    └── components/
        ├── layout/    Navbar · Footer
        ├── ui/        Section · Reveal
        ├── theme/     ThemeProvider · ThemeToggle
        ├── i18n/      LanguageSwitcher
        ├── hero/      Hero · RoleTyper · ResumeDownload
        ├── about/     About
        ├── projects/  ProjectShowcase · ProjectCard
        ├── services/  ServicesGrid · CostEstimator
        ├── contact/   ContactForm · Turnstile
        └── chat/      ChatWidget · OpenChatButton · chat-store
```

**Rule of thumb:** `'use client'` appears in 18 files out of 39 — up from the original 11/50 as the interactive background and skills canvas landed, both of which need real client-side work (cursor tracking, measured layout) that CSS/server-rendering can't do. Everything else — all four languages of copy, the whole services section, the entire About timeline text — is still HTML by the time it reaches the browser.

---

## 3. Internationalisation (EN · FR · AR · DE)

### Routing

`/` → redirects to negotiated locale → `/en`, `/fr`, `/ar`, `/de`

`localePrefix: 'always'`. Hiding `/en` would give the default language an asymmetric URL and complicate hreflang; every language gets a stable, indexable URL instead.

### Request lifecycle

```
proxy.ts  ─ cookie → Accept-Language → default ─→  /[locale]/...
   ↓
i18n/request.ts  ─ resolve locale, import ONE dictionary ─→  Server Components
   ↓
[locale]/layout.tsx  ─ <html lang dir>  +  NextIntlClientProvider
```

Only the active locale's dictionary is imported. The other three never enter the bundle.

### RTL is layout, not a stylesheet

Arabic isn't a translated copy of the LTR layout — the whole axis flips. This is handled with **CSS logical properties throughout**, so there is no second stylesheet to maintain:

| Instead of | Use |
|---|---|
| `left-0` / `right-0` | `start-0` / `end-0` |
| `ml-2` / `pr-4` | `ms-2` / `pe-4` |
| `text-left` | `text-start` |
| `border-l` | `border-s` |

Three things needed explicit handling beyond that:

1. **Numerals stay LTR.** `.numeric` applies `direction: ltr; unicode-bidi: isolate` so `90%`, `$740` and `2026` don't mirror inside Arabic text.
2. **Directional icons flip.** `rtl:rotate-180` on arrows, `rtl:-scale-x-100` on the send icon.
3. **Typography changes.** Arabic swaps to Noto Kufi Arabic at `line-height: 1.9` — Latin leading looks cramped under Arabic's vertical detail.

Proper nouns (`Next.js`, `n8n`, `PostgreSQL`) carry `dir="ltr"` so they read correctly inside Arabic paragraphs.

### Translation integrity

`scripts/check-i18n.mjs` compares all four dictionaries against `en.json` as reference and fails on a missing key, an unexpected key, or a type mismatch (string vs array vs object). Enforced in CI (`.github/workflows/i18n-check.yml`) on every PR — four languages drift silently otherwise, and a missing key renders as a raw key path in production, in the one language you don't read.

```
$ node scripts/check-i18n.mjs
✓ ar.json — 253 keys, in sync with en
✓ de.json — 253 keys, in sync with en
✓ fr.json — 253 keys, in sync with en
Translation parity check passed.
```

---

## 4. The AI agent

**Grounded prompt, not RAG.** The complete verified profile is a few thousand tokens. A vector store would add infrastructure, latency and a retrieval-miss failure mode to solve a problem that doesn't exist at this scale.

```
content/profile.ts + projects.ts + pricing.ts
            ↓  serialised at build
     lib/ai/system-prompt.ts
            ↓  per request, localised
     app/api/chat/route.ts  ──stream──▶  ChatWidget
```

The system prompt is structured in four blocks, ordered deliberately:

1. **Non-negotiable rules first** — including an explicit escape hatch ("say you don't have that detail, then offer the contact form"). A model always needs a compliant move available, or it invents one.
2. **Style** — mirror the visitor's language; 2–3 sentences by default; outcome before method before stack.
3. **Conversation playbook** — what to do with "is she a fit for X", "can she do Y", "how much for Z".
4. **Knowledge base** — the generated facts.

Request pipeline, cheapest filter first:

```
rate limit (12/min/IP)  →  Zod payload bounds  →  API key check  →  model
```

Every rejection happens before the only step that costs money. `temperature: 0.3` and `maxOutputTokens: 700` — this agent recites verified facts; creativity here is indistinguishable from hallucination.

---

## 5. Security posture

| Layer | Mechanism |
|---|---|
| Contact spam | Honeypot → Zod → Cloudflare Turnstile (verified server-side) → rate limit |
| API abuse | Fixed-window rate limiting per IP on `/api/chat` and `/api/contact` |
| Secrets | `OPENAI_API_KEY`, `TURNSTILE_SECRET_KEY`, `N8N_WEBHOOK_SECRET` are server-only — never prefixed `NEXT_PUBLIC_` |
| Webhook forgery | `x-portfolio-signature` shared secret, verified inside the n8n workflow |
| Headers | HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options` |
| Prompt injection | System prompt refuses persona changes and instruction disclosure |

Two decisions worth calling out:

- **Turnstile fails closed.** A network error or missing secret rejects the submission. A contact form that silently accepts spam when the CAPTCHA provider blips is worse than one that asks the user to retry.
- **The honeypot returns 200.** A bot that trips it logs a success and moves on. A 4xx would tell it the field is detected and invite a retry without it.

---

## 6. Performance

| Decision | Why |
|---|---|
| Scroll reveals use IntersectionObserver + CSS, not Framer Motion | The compositor handles it off the main thread; the library is reserved for the card and modal work it's actually good at |
| Hero background is pure CSS | Zero image requests, zero CLS, can never 404 |
| Project covers are generated gradients | Same reasoning — no image pipeline, no broken thumbnails |
| Typewriter has a fixed `min-height` | Otherwise each role change reflows the page — a classic CLS source |

---

## 7. Setup

```bash
npm install
cp .env.example .env.local     # fill in the keys you have
npm run i18n:check             # verify translation parity
npm run dev                    # → http://localhost:3000/en
```

The site runs with **no keys at all** — the chat returns a clean 503, and the contact form reports a delivery error. Add keys to switch each feature on independently.

### Environment variables

| Variable | Required for | Notes |
|---|---|---|
| `OPENAI_API_KEY` | AI chatbot | Server-only |
| `AI_MODEL` | AI chatbot | Defaults to `gpt-4o-mini` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | Contact form | Both required — form rejects without them |
| `N8N_WEBHOOK_URL` / `N8N_WEBHOOK_SECRET` | Lead delivery | Verify the signature inside n8n |
| `NEXT_PUBLIC_SITE_URL` | SEO | Canonical + sitemap base |

### Before first deploy

1. Drop four CV PDFs into `public/cv/` as `chiraz-lina-kannoufi-{en,fr,ar,de}.pdf`
2. Add `public/og.png` (1200×630)
3. Replace the placeholder GitHub/LinkedIn URLs in `src/content/profile.ts`
4. Add real `githubUrl` / `liveUrl` values in `src/content/projects.ts`
5. Review the numbers in `src/content/pricing.ts` — they are a starting point, not a recommendation

### Next.js version note

This targets **Next.js 16**, where `middleware.ts` was renamed to `proxy.ts`. On Next.js 15 or earlier, rename `src/proxy.ts` → `src/middleware.ts`; the contents are identical.

---

## 8. n8n workflow for the contact form

The route POSTs this shape to `N8N_WEBHOOK_URL`:

```json
{
  "name": "...", "email": "...", "company": null,
  "budget": "1500-5000", "message": "...", "locale": "fr",
  "meta": { "ip": "...", "userAgent": "...", "referer": null, "receivedAt": "ISO-8601" }
}
```

Suggested workflow:

```
Webhook (POST)
  → IF  $request.headers['x-portfolio-signature'] === $env.PORTFOLIO_SECRET
      → Supabase: insert row into `leads`
      → Telegram: sendMessage  (name · budget · first 200 chars)
      → Gmail/SMTP: templated acknowledgement in {{locale}}
  → ELSE  respond 401
```

---

## 9. Known trade-offs

Stated plainly so nobody discovers them later:

1. **Rate limiting is per-instance.** Serverless instances don't share memory, so the effective limit is `limit × instances`. Acceptable for a portfolio. Swap the body of `rateLimit()` for `@upstash/ratelimit` if traffic ever justifies it — the signature is deliberately identical.
2. **Chat history is per-session.** No persistence layer. Add Supabase if you want analytics on what recruiters actually ask — which would be genuinely useful signal.
3. **The estimator prices client-side for display.** `calculateQuote()` is a pure function precisely so the server can re-price before a quote is ever acted on. Do that if quotes ever leave the browser.
