"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";

const ATTRIBUTION_COOKIE = "gk_attribution";

function readAttribution(): Record<string, string> | null {
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${ATTRIBUTION_COOKIE}=`));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match.split("=").slice(1).join("=")));
  } catch {
    return null;
  }
}

/**
 * Initializes PostHog once, stamps every event with `app`, and attaches
 * first-touch attribution (ref / utm_*) captured by the middleware.
 *
 * Wrap your root layout's children with this.
 */
export function PostHogProvider({
  app,
  children,
}: {
  app: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) {
      // No key in this environment (e.g. local without .env) — stay silent.
      return;
    }
    if (!posthog.__loaded) {
      posthog.init(key, {
        // Default to the same-origin reverse proxy (/ingest) so ad/tracking
        // blockers don't drop events. ui_host keeps toolbar links pointing at
        // the real PostHog app. See README for the next.config rewrites.
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "/ingest",
        ui_host:
          process.env.NEXT_PUBLIC_POSTHOG_UI_HOST ?? "https://eu.posthog.com",
        defaults: "2025-05-24", // App Router-aware pageviews + sensible defaults
        person_profiles: "identified_only",
      });
    }

    // Stamp every event with the app name → enables cross-project breakdown.
    posthog.register({ app });

    // Attach first-touch attribution so it rides on every event + the person.
    const attribution = readAttribution();
    if (attribution) {
      posthog.register(attribution);
      posthog.setPersonProperties(attribution);
    }
  }, [app]);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
