/**
 * Per-project banner motif.
 *
 * The card banners used to be flat blocks of colour. Each one now carries a
 * small line-art mark of what the project actually *does* — the agent graph,
 * the conversation-to-catalogue hop, the one-in-three-out fan, the route.
 *
 * Deliberately drawn in `currentColor` over the card's existing gradient
 * rather than in new hues: the palette is unchanged, only the surface gains
 * structure. Server-rendered inline SVG — no image request, nothing to 404.
 */
export function ProjectMotif({ slug }: { slug: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 320 128"
      preserveAspectRatio="xMidYMid slice"
      className="pointer-events-none absolute inset-0 size-full text-white/45"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {slug === 'multi-agent-monitor' && (
        <>
          {/* Four agents feeding one orchestrator, plus the price line they watch. */}
          <path d="M60 34 L128 64 M60 94 L128 64 M60 64 L128 64 M92 20 L128 64" opacity="0.55" />
          <circle cx="60" cy="34" r="7" />
          <circle cx="60" cy="64" r="7" />
          <circle cx="60" cy="94" r="7" />
          <circle cx="92" cy="20" r="7" />
          <rect x="128" y="50" width="34" height="28" rx="7" />
          <path d="M162 64 H196" opacity="0.55" />
          <path d="M196 88 L216 72 L232 80 L252 44 L272 56" strokeWidth="2" />
          <circle cx="252" cy="44" r="3.5" fill="currentColor" stroke="none" />
        </>
      )}

      {slug === 'ai-sales-assistant' && (
        <>
          {/* A messy multi-product message resolving into catalogue matches. */}
          <path d="M40 40 H104 a8 8 0 0 1 8 8 v20 a8 8 0 0 1 -8 8 H60 l-12 12 v-12 h-8 a8 8 0 0 1 -8 -8 V48 a8 8 0 0 1 8 -8 z" />
          <path d="M52 54 H96 M52 64 H84" opacity="0.6" />
          <path d="M124 64 H164" opacity="0.55" />
          <path d="M156 58 L164 64 L156 70" opacity="0.55" />
          <rect x="176" y="38" width="30" height="22" rx="4" />
          <rect x="214" y="38" width="30" height="22" rx="4" opacity="0.55" />
          <rect x="252" y="38" width="30" height="22" rx="4" opacity="0.3" />
          <rect x="176" y="68" width="30" height="22" rx="4" opacity="0.55" />
          <rect x="214" y="68" width="30" height="22" rx="4" />
          <rect x="252" y="68" width="30" height="22" rx="4" opacity="0.3" />
        </>
      )}

      {slug === 'ai-customer-reply-assistant' && (
        <>
          {/* One inbound message; reply, log and alert run independently. */}
          <path d="M28 48 H76 a8 8 0 0 1 8 8 v16 a8 8 0 0 1 -8 8 H48 l-11 11 v-11 h-9 a8 8 0 0 1 -8 -8 V56 a8 8 0 0 1 8 -8 z" />
          <circle cx="132" cy="72" r="12" />
          <path d="M96 72 H120" opacity="0.55" />
          <path d="M144 72 C168 72 168 30 192 30" opacity="0.55" />
          <path d="M144 72 H192" opacity="0.55" />
          <path d="M144 72 C168 72 168 112 192 112" opacity="0.55" />
          {/* reply */}
          <path d="M204 18 h56 a6 6 0 0 1 6 6 v14 a6 6 0 0 1 -6 6 h-40 l-10 9 v-9 h-6 a6 6 0 0 1 -6 -6 V24 a6 6 0 0 1 6 -6 z" />
          {/* log */}
          <rect x="204" y="58" width="62" height="28" rx="4" />
          <path d="M204 68 H266 M225 58 V86" opacity="0.6" />
          {/* alert */}
          <path d="M204 100 h62 v24 h-62 z" />
          <path d="M204 100 L235 118 L266 100" opacity="0.6" />
        </>
      )}

      {slug === 'gotrek' && (
        <>
          {/* A route through a handful of stops. */}
          <path
            d="M32 100 C 78 100 70 44 116 44 C 162 44 156 96 202 96 C 244 96 246 52 288 52"
            strokeWidth="2"
            strokeDasharray="7 7"
          />
          <path d="M116 30 a10 10 0 0 1 10 10 c0 7 -10 16 -10 16 s-10 -9 -10 -16 a10 10 0 0 1 10 -10 z" />
          <path d="M202 82 a10 10 0 0 1 10 10 c0 7 -10 16 -10 16 s-10 -9 -10 -16 a10 10 0 0 1 10 -10 z" opacity="0.6" />
          <circle cx="32" cy="100" r="4.5" fill="currentColor" stroke="none" />
          <circle cx="288" cy="52" r="4.5" fill="currentColor" stroke="none" />
        </>
      )}
    </svg>
  );
}
