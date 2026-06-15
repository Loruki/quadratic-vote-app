import "server-only";
import { PostHog } from "posthog-node";
import type { GrowthEvent } from "./analytics";

/**
 * Server-side capture — immune to ad/tracking blockers because it never runs
 * in the browser. Use it for events you cannot afford to lose: conversions
 * (signup_complete), payments, anything money-adjacent. Top-of-funnel events
 * (landing_view, pageviews) stay client-side where richer context exists.
 *
 * Import from "@/growth-kit/server" only — keep it out of client bundles.
 */

let client: PostHog | null = null;

function getClient(): PostHog | null {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? process.env.POSTHOG_KEY;
  if (!key) return null;
  if (!client) {
    client = new PostHog(key, {
      // Direct ingestion host (no proxy needed — no blockers server-side).
      host: process.env.POSTHOG_SERVER_HOST ?? "https://eu.i.posthog.com",
      flushAt: 1, // send immediately; serverless functions are short-lived
      flushInterval: 0,
    });
  }
  return client;
}

const APP = process.env.NEXT_PUBLIC_POSTHOG_APP;

/** Capture a funnel event from the server. Awaits the flush so it isn't dropped. */
export async function trackServer(
  distinctId: string,
  event: GrowthEvent,
  props?: Record<string, unknown>,
): Promise<void> {
  const c = getClient();
  if (!c) return;
  c.capture({
    distinctId,
    event,
    properties: { ...(APP ? { app: APP } : {}), ...props },
  });
  await c.flush();
}

/**
 * Extract the browser's PostHog distinct_id from its cookie value, so a
 * server-side event can be attributed to the same anonymous person who did the
 * earlier client-side steps (stitches the funnel when there's no login).
 *
 * The cookie name is `ph_<projectKey>_posthog`; read it with next/headers
 * cookies() and pass the .value here.
 */
export function distinctIdFromCookie(cookieValue: string | undefined): string | null {
  if (!cookieValue) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(cookieValue));
    return typeof parsed?.distinct_id === "string" ? parsed.distinct_id : null;
  } catch {
    return null;
  }
}

/** Set person properties from the server (e.g. email/name at signup). */
export async function identifyServer(
  distinctId: string,
  properties: Record<string, unknown>,
): Promise<void> {
  const c = getClient();
  if (!c) return;
  c.identify({ distinctId, properties });
  await c.flush();
}
