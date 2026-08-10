import type { GithubStats } from '@/types';

const API = 'https://api.github.com';

/**
 * GitHub REST is called exclusively from the server.
 *
 * Two reasons: the PAT never reaches the browser, and Next's fetch cache gives
 * us one upstream call per hour shared across every visitor instead of one per
 * page view. Anonymous GitHub allows 60 req/h — a modest traffic spike would
 * otherwise blank the widget.
 */
function headers(): HeadersInit {
  const token = process.env.GITHUB_TOKEN;
  return {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

interface GhUser {
  public_repos: number;
  followers: number;
}

interface GhRepo {
  name: string;
  stargazers_count: number;
  language: string | null;
  size: number;
  fork: boolean;
  pushed_at: string;
}

const REVALIDATE_SECONDS = 3600;

async function gh<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API}${path}`, {
      headers: headers(),
      next: { revalidate: REVALIDATE_SECONDS, tags: ['github'] },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    // Never let a third-party outage take down the page — the caller
    // degrades to a skeleton state instead.
    return null;
  }
}

/**
 * Aggregates public profile stats.
 * Returns `null` on any upstream failure so the UI can render an honest
 * "stats unavailable" state rather than zeros that look like real data.
 */
export async function getGithubStats(
  username = process.env.GITHUB_USERNAME ?? '',
): Promise<GithubStats | null> {
  if (!username) return null;

  const [user, repos] = await Promise.all([
    gh<GhUser>(`/users/${username}`),
    gh<GhRepo[]>(`/users/${username}/repos?per_page=100&sort=pushed`),
  ]);

  if (!user || !repos) return null;

  const owned = repos.filter((r) => !r.fork);

  const totalStars = owned.reduce((sum, r) => sum + r.stargazers_count, 0);

  // Weight languages by repo size (KB) rather than repo count, so twenty
  // one-file config repos don't outrank one substantial application.
  const byLanguage = new Map<string, number>();
  for (const repo of owned) {
    if (!repo.language) continue;
    byLanguage.set(repo.language, (byLanguage.get(repo.language) ?? 0) + repo.size);
  }
  const totalSize = [...byLanguage.values()].reduce((a, b) => a + b, 0) || 1;

  const topLanguages = [...byLanguage.entries()]
    .map(([name, size]) => ({ name, percentage: Math.round((size / totalSize) * 100) }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 5);

  return {
    username,
    publicRepos: user.public_repos,
    followers: user.followers,
    totalStars,
    topLanguages,
    contributions: buildActivityFromPushes(owned),
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * Approximates a 52-week activity heatmap from repository `pushed_at` dates.
 *
 * ⚠️  This is an approximation, not the real contribution graph — that data
 * is only exposed through GitHub's GraphQL API and requires an authenticated
 * token. Documented here so nobody later mistakes it for exact commit counts.
 * To make it exact, swap this for the GraphQL `contributionsCollection` query.
 */
function buildActivityFromPushes(repos: GhRepo[]): { date: string; count: number }[] {
  const days = new Map<string, number>();
  const today = new Date();

  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.set(d.toISOString().slice(0, 10), 0);
  }

  for (const repo of repos) {
    const key = repo.pushed_at?.slice(0, 10);
    if (key && days.has(key)) {
      days.set(key, (days.get(key) ?? 0) + 1);
    }
  }

  return [...days.entries()].map(([date, count]) => ({ date, count }));
}
