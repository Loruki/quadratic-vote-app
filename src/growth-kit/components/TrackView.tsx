"use client";

import { useEffect, useRef } from "react";
import { track, type GrowthEvent } from "../analytics";

/**
 * Fires a funnel event once on mount. Drop into a server-component page to
 * record a view without making the whole page client-side:
 *
 *   <TrackView event="landing_view" />
 *   <TrackView event="activated" props={{ matches: count }} />
 */
export function TrackView({
  event,
  props,
}: {
  event: GrowthEvent;
  props?: Record<string, unknown>;
}) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return; // guard StrictMode double-invoke
    fired.current = true;
    track(event, props);
  }, [event, props]);
  return null;
}
