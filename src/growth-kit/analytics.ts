import posthog from "posthog-js";

/**
 * The reusable funnel contract. Every side project reports these same five
 * events so a single PostHog funnel works across all of them.
 */
export const GROWTH_EVENTS = {
  LANDING_VIEW: "landing_view",
  SIGNUP_START: "signup_start",
  SIGNUP_COMPLETE: "signup_complete",
  ACTIVATED: "activated",
  SHARED: "shared",
} as const;

export type GrowthEvent = (typeof GROWTH_EVENTS)[keyof typeof GROWTH_EVENTS];

type Props = Record<string, unknown>;

/** Low-level typed capture. Prefer the `growth.*` helpers below. */
export function track(event: GrowthEvent, props?: Props): void {
  posthog.capture(event, props);
}

/** Funnel helpers — the only events you should be firing for acquisition. */
export const growth = {
  landingView: (props?: Props) => track(GROWTH_EVENTS.LANDING_VIEW, props),
  signupStart: (props?: Props) => track(GROWTH_EVENTS.SIGNUP_START, props),
  signupComplete: (props?: Props) => track(GROWTH_EVENTS.SIGNUP_COMPLETE, props),
  /** The app-defined aha moment. See README for each app's definition. */
  activated: (props?: Props) => track(GROWTH_EVENTS.ACTIVATED, props),
  shared: (props?: Props) => track(GROWTH_EVENTS.SHARED, props),
};

/** Tie events to a known user once they sign up. */
export function identify(distinctId: string, props?: Props): void {
  posthog.identify(distinctId, props);
}

/** Clear identity on logout so the next visitor isn't merged in. */
export function resetIdentity(): void {
  posthog.reset();
}

export { posthog };
