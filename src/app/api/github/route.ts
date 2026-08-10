import { getGithubStats } from '@/lib/github';

/**
 * GET /api/github — live repository stats.
 *
 * Thin wrapper so the client widget can revalidate without a full page load.
 * The real caching happens one layer down in `lib/github.ts` via Next's fetch
 * cache, so this handler is effectively free after the first hourly miss.
 */
export const revalidate = 3600;

export async function GET() {
  const stats = await getGithubStats();

  if (!stats) {
    // 200 with a null payload, not an error: an unreachable GitHub is an
    // expected degraded state for a decorative widget, not a page failure.
    return Response.json(
      { stats: null, reason: 'github_unavailable' },
      { status: 200, headers: { 'Cache-Control': 'public, s-maxage=300' } },
    );
  }

  return Response.json(
    { stats },
    {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    },
  );
}
