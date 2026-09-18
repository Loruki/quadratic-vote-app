import type { MetadataRoute } from 'next';

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3030';

// Only the evergreen marketing pages. Poll pages are link-shared, not searched.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/`, changeFrequency: 'monthly', priority: 1 },
    { url: `${BASE}/vs/dot-voting`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/create`, changeFrequency: 'yearly', priority: 0.6 },
    { url: `${BASE}/explore`, changeFrequency: 'daily', priority: 0.5 },
  ];
}
