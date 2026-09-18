import type { MetadataRoute } from 'next';

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3030';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Admin links are secrets; /my is per-browser; the API isn't content.
      disallow: ['/api/', '/my', '/poll/*/admin/', '/poll/*/v/'],
    },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
