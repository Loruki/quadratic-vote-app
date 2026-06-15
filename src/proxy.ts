import { type NextRequest } from 'next/server';
import { growthMiddleware } from '@/growth-kit/middleware';

// Next 16 renamed Middleware → Proxy. growthMiddleware captures ref/utm into a
// first-touch cookie the client forwards to PostHog.
export function proxy(req: NextRequest) {
  return growthMiddleware(req);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
