import { NextResponse, type NextRequest } from "next/server";

const ATTRIBUTION_COOKIE = "gk_attribution";
const ATTRIBUTION_PARAMS = [
  "ref",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

const NINETY_DAYS = 60 * 60 * 24 * 90;

/**
 * Captures referral / UTM params into a first-touch cookie the client reads
 * and forwards to PostHog. First-touch: once set, it is not overwritten.
 *
 * Returns a NextResponse you can keep mutating (or return as-is). Compose it
 * with any existing middleware:
 *
 *   export function middleware(req) {
 *     const res = growthMiddleware(req);
 *     // ...your auth logic on `res`...
 *     return res;
 *   }
 */
export function growthMiddleware(req: NextRequest): NextResponse {
  const res = NextResponse.next();

  // Already attributed → leave first touch intact.
  if (req.cookies.get(ATTRIBUTION_COOKIE)) return res;

  const captured: Record<string, string> = {};
  for (const param of ATTRIBUTION_PARAMS) {
    const value = req.nextUrl.searchParams.get(param);
    if (value) captured[param] = value;
  }

  if (Object.keys(captured).length > 0) {
    res.cookies.set(ATTRIBUTION_COOKIE, JSON.stringify(captured), {
      maxAge: NINETY_DAYS,
      httpOnly: false, // client JS must read it to forward to PostHog
      sameSite: "lax",
      path: "/",
    });
  }

  return res;
}
