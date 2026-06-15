import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  devIndicators: false,
  // growth-kit PostHog reverse proxy — route analytics through our own domain so
  // ad/tracking blockers don't drop events. Ingestion needs trailing slashes kept.
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      {
        source: '/ingest/static/:path*',
        destination: 'https://eu-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/ingest/:path*',
        destination: 'https://eu.i.posthog.com/:path*',
      },
    ];
  },
};

export default nextConfig;
