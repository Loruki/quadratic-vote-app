'use client';

import { motion } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';

interface Props {
  creditsPerVoter: number;
  optionsCount: number;
  onDismiss: () => void;
}

/**
 * Persistent inline hint shown above the option list on first visits.
 *
 * Replaces the previous TooltipWalkthrough modal, which voters routinely
 * dismissed without reading — leading to the failure mode of "click +1
 * once and Submit", treating the page like a pick-one poll. This banner
 * is inline (not a modal), so it can't be dismissed in a single reflex tap
 * the way a popup can. It auto-hides on the first allocation, so it never
 * lingers for voters who already get it.
 *
 * The critical message — the one missing from the modal — is the explicit
 * "tap + as many times as you want" line.
 *
 * Slimmed once the gnomon grid + the F19 cost annotation shipped: the
 * "2 votes = 4 credits, 3 = 9" arithmetic that used to live here is now
 * drawn by the cards and taught at the moment of the tap, so the banner
 * keeps only the two jobs the cards *don't* do — budget orientation and
 * the "you may tap one option many times" nudge.
 */
export function VotingHintBanner({ creditsPerVoter, optionsCount, onDismiss }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ type: 'spring', stiffness: 240, damping: 24 }}
      className="relative mt-4 overflow-hidden rounded-2xl border border-primary/25 bg-grad-brand-soft p-4 shadow-soft sm:p-5"
      role="region"
      aria-label="How this poll works"
    >
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss this hint"
        className="absolute right-2.5 top-2.5 rounded-md p-1 text-foreground/50 transition-colors hover:bg-foreground/10 hover:text-foreground"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <div className="flex items-start gap-3 pr-7">
        <span
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-grad-brand text-primary-foreground shadow-soft"
          aria-hidden
        >
          <Sparkles className="h-4 w-4" />
        </span>
        <div className="space-y-1.5 text-sm leading-relaxed">
          <p className="font-semibold text-foreground">
            You have{' '}
            <span className="text-grad-brand">{creditsPerVoter} credits</span> to spread
            across these {optionsCount} options.
          </p>
          <p className="text-foreground/80">
            <span className="font-medium text-foreground">
              Tap + as many times as you want
            </span>{' '}
            on any option — spend more where you care most.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
