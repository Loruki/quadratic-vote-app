'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
  open: boolean;
  steps: string[];
}

/**
 * Full-screen "we're working on it" overlay shown during poll creation.
 *
 * Even when the API responds in 80ms, fast operations on critical,
 * irreversible actions feel jarring — banks and payment processors lean into
 * deliberate progress displays because trust matters more than raw speed
 * here. We tick through the provided steps on a fixed cadence so the user
 * sees the full sequence. The parent holds the overlay open until *both*
 * the API call has resolved and the animation has reached its final step,
 * whichever is later.
 */
export function CreationProgress({ open, steps }: Props) {
  return (
    <AnimatePresence>{open && <ProgressOverlay steps={steps} />}</AnimatePresence>
  );
}

function ProgressOverlay({ steps }: { steps: string[] }) {
  // current is local to this mount; AnimatePresence unmounts the overlay
  // when `open` flips to false, so we never need to reset state — fresh
  // mounts always start at 0.
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    // Step cadence: ~380ms each → 4 steps ≈ 1.5s minimum. The async
    // timer callbacks scheduling setState are the React-recommended way to
    // synchronize with an external timing source.
    const timeouts = steps.map((_, i) =>
      setTimeout(() => setCurrent(i + 1), 380 * (i + 1)),
    );
    return () => timeouts.forEach(clearTimeout);
  }, [steps]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-busy="true"
      aria-label="Creating your poll"
    >
      <motion.div
        initial={{ y: 14, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 8, opacity: 0, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 220, damping: 22 }}
        className="relative w-[min(420px,92vw)] overflow-hidden rounded-3xl border border-border bg-card shadow-brand"
      >
        <div className="bg-grad-brand px-6 py-5 text-primary-foreground">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 backdrop-blur">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-90">
                Working on it
              </p>
              <p className="text-base font-semibold">Creating your poll</p>
            </div>
          </div>
        </div>

        <ul className="space-y-2 p-5">
          {steps.map((step, idx) => {
            const done = idx < current;
            const active = idx === current;
            return (
              <li
                key={step}
                className="flex items-center gap-3 rounded-xl border border-transparent bg-muted/40 px-3 py-2.5"
              >
                <span
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-full transition-all ${
                    done
                      ? 'bg-grad-brand text-primary-foreground'
                      : active
                        ? 'bg-grad-brand-soft text-primary'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {done ? (
                    <motion.span
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 320, damping: 20 }}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </motion.span>
                  ) : active ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <span className="text-[11px] font-semibold tabular-nums">{idx + 1}</span>
                  )}
                </span>
                <span
                  className={`text-sm font-medium ${
                    done ? 'text-foreground' : active ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {step}
                </span>
              </li>
            );
          })}
        </ul>

        <p className="border-t border-border px-5 py-3 text-center text-xs text-muted-foreground">
          Don&apos;t close this tab — we&apos;ll redirect you in a moment.
        </p>
      </motion.div>
    </motion.div>
  );
}
