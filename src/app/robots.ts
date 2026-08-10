import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://chiraz.dev';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // No SEO value, and /api/chat costs money per crawl.
      disallow: ['/api/'],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
