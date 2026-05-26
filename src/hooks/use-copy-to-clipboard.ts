'use client';

import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';

interface Options {
  /** Toast title on success — defaults to "Copied to clipboard". */
  successMessage?: string;
  /** Time the `copied` flag stays true after a successful copy (ms). */
  resetAfterMs?: number;
  /** If false, no toast is shown on success. */
  toastOnSuccess?: boolean;
}

/**
 * Hook for clipboard writes with a transient "copied" flag.
 *
 * Replaces 6 near-identical try/catch + setState + setTimeout snippets
 * spread across the admin / share / my-polls / post-create components.
 */
export function useCopyToClipboard(opts: Options = {}) {
  const {
    successMessage = 'Copied to clipboard',
    resetAfterMs = 1500,
    toastOnSuccess = true,
  } = opts;
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = useCallback(
    async (value: string, overrideMessage?: string): Promise<boolean> => {
      try {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        if (toastOnSuccess) toast.success(overrideMessage ?? successMessage);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), resetAfterMs);
        return true;
      } catch {
        toast.error('Could not copy. Tap the field, then long-press to copy.');
        return false;
      }
    },
    [resetAfterMs, successMessage, toastOnSuccess],
  );

  return { copied, copy };
}
