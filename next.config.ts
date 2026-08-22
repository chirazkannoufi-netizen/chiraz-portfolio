import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

/**
 * Wires next-intl into the build. Points at the request-scoped i18n config
 * so every Server Component can resolve the active locale + messages.
 */
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // Live avatars / OG images pulled from GitHub's CDN for the repo widgets.
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'opengraph.githubassets.com' },
    ],
  },

  /**
   * Baseline hardening.
   *
   * ⚠️  There is NO Content-Security-Policy yet, here or in `proxy.ts`.
   * A real one needs a per-request nonce (Next injects inline bootstrap
   * scripts) plus allowances for challenges.cloudflare.com (Turnstile's
   * script and its challenge frame) — so it belongs in the proxy, where the
   * nonce can be generated and forwarded. Until that exists, do not read the
   * headers below as a complete policy.
   */
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
