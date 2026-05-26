import { useSyncExternalStore } from 'react';

/**
 * Returns `false` during SSR and the first client render (so hydration is
 * byte-identical to the server output), then `true` afterwards.
 *
 * Built on top of `useSyncExternalStore` with a no-op subscriber — the
 * difference between server snapshot (`false`) and client snapshot
 * (`true`) is what flips it after hydration.
 */
const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function useIsClient(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
