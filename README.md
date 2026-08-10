# Chiraz Kanoufi — Interactive Portfolio & AI Engine

A four-language (EN · FR · AR · DE, with full RTL) portfolio that behaves like a
product: a grounded AI agent that answers recruiter questions from a verified CV,
filterable engineering case studies, live GitHub stats, an interactive cost
estimator, and a hardened contact pipeline.

**Read [`ARCHITECTURE.md`](./ARCHITECTURE.md) first** — it explains why the code is
shaped the way it is.

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev          # → http://localhost:3000/en
```

Runs with zero API keys. Each feature switches on as you add its key.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build (pre-renders all 4 locales) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run i18n:check` | Fails if any locale drifts from `en.json` — **wire this into CI** |
| `npm run lint` | ESLint |

## What's where

| I want to change… | Edit |
|---|---|
| A CV fact (job, degree, skill) | `src/content/profile.ts` — the AI updates with it |
| Any visible text | `messages/{en,fr,ar,de}.json` |
| A project / case study | `src/content/projects.ts` + the four `projects.items.*` blocks |
| Prices or timelines | `src/content/pricing.ts` |
| Colours, spacing, motion | `src/app/globals.css` (`@theme` block) |
| How the AI behaves | `src/lib/ai/system-prompt.ts` |

## Adding a fifth language

1. Add the code to `locales` in `src/i18n/routing.ts` (+ `rtlLocales` if RTL)
2. Add an entry to `localeMeta`
3. Copy `messages/en.json` → `messages/xx.json` and translate
4. `npm run i18n:check`

No component changes required.

## Dependency note

`ai`, `@ai-sdk/openai` and `@ai-sdk/react` release their major versions in lockstep.
If `npm install` reports a peer conflict between them, run:

```bash
npm i ai@latest @ai-sdk/openai@latest @ai-sdk/react@latest
```

This project is written against **AI SDK 7** (`streamText` + `toUIMessageStream` +
`createUIMessageStreamResponse`, and `instructions` rather than `system`). On AI SDK 6
or earlier, rename `instructions:` → `system:` in `src/app/api/chat/route.ts` and
return `result.toUIMessageStreamResponse()` directly.

## Deploy

Vercel: import the repo, add the environment variables from `.env.example`, deploy.
`generateStaticParams` pre-renders all four locales at build time.

Put Cloudflare in front for WAF and DDoS protection — Turnstile is already wired
into the contact form.
