'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useIsClient } from '@/hooks/use-is-client';
import { applyVote, canAffordAnyMoreVote, creditCost, remainingCredits, totalCreditsSpent } from '@/lib/quadratic';
import { nextTeach, type TeachStep } from '@/lib/teaching';
import { BudgetBar } from './budget-bar';
import { OptionCard } from './option-card';
import { SubmitDialog } from './submit-dialog';
import { VotingHintBanner } from './voting-hint-banner';

interface Props {
  pollId: string;
  options: { id: string; label: string }[];
  creditsPerVoter: number;
  voterToken?: string;
  voterLabel?: string | null;
}

type AllocationMap = Record<string, number>;

// Replaces the older `qv_walkthrough_seen` modal flag — the modal got
// dismissed without being read, so we moved to an inline banner with its
// own flag (separate so reverting wouldn't surprise returning users).
const HINT_KEY = 'qv_voting_hint_seen';
// Separate flag for the F19 just-in-time cost annotation. Kept distinct
// from HINT_KEY so the two teaching layers can be reverted independently,
// and so a voter who saw the old banner still gets the cost lesson once.
const COST_TAUGHT_KEY = 'qv_cost_taught';

// The two beats of the cost lesson, surfaced inline on the tapped card.
const BEAT_TEXT: Record<1 | 2, string> = {
  1: 'That first vote cost 1 credit. Try tapping the same option again.',
  2: 'This one cost 3, not 1 — votes get pricier as you stack them. That’s quadratic voting.',
};

const ANNOTATION_MS = 6000;

export function VotingClient({
  pollId,
  options,
  creditsPerVoter,
  voterToken,
  voterLabel,
}: Props) {
  const router = useRouter();
  const isClient = useIsClient();
  const [allocations, setAllocations] = useState<AllocationMap>(() =>
    Object.fromEntries(options.map((o) => [o.id, 0])),
  );
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [hintExplicitlyDismissed, setHintExplicitlyDismissed] = useState(false);
  // Read-once on mount: was this voter previously taught? Only effective
  // after isClient flips true, which avoids the hydration mismatch.
  const [hintSeenBefore] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.localStorage.getItem(HINT_KEY) === '1';
    } catch {
      return false;
    }
  });

  // F19 cost annotation: which card shows which beat right now, and how far
  // through the lesson this voter is. teachStep seeds from localStorage but
  // is only ever *used* by tap handlers (post-hydration), so no SSR mismatch.
  const [annotation, setAnnotation] = useState<{ optionId: string; beat: 1 | 2 } | null>(null);
  const teachStep = useRef<TeachStep>(
    (() => {
      if (typeof window === 'undefined') return 0;
      try {
        return window.localStorage.getItem(COST_TAUGHT_KEY) === '1' ? 'done' : 0;
      } catch {
        return 0;
      }
    })(),
  );
  const annotationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showBeat(optionId: string, beat: 1 | 2) {
    setAnnotation({ optionId, beat });
    if (annotationTimer.current) clearTimeout(annotationTimer.current);
    annotationTimer.current = setTimeout(() => setAnnotation(null), ANNOTATION_MS);
  }

  function markTaught() {
    teachStep.current = 'done';
    try {
      window.localStorage.setItem(COST_TAUGHT_KEY, '1');
    } catch {
      /* noop */
    }
  }

  // Clear the auto-fade timer on unmount.
  useEffect(() => () => {
    if (annotationTimer.current) clearTimeout(annotationTimer.current);
  }, []);

  const allocationsList = useMemo(
    () => options.map((o) => ({ optionId: o.id, numVotes: allocations[o.id] ?? 0 })),
    [allocations, options],
  );

  const spent = totalCreditsSpent(allocationsList);
  const remaining = remainingCredits(allocationsList, creditsPerVoter);
  const stranded = remaining > 0 && !canAffordAnyMoreVote(allocationsList, creditsPerVoter);
  const hasAnyVote = allocationsList.some((a) => a.numVotes !== 0);

  // Persist the dismissal when the voter clicks X. We do NOT auto-dismiss
  // on first vote anymore — surprise layout shifts at the moment of first
  // interaction feel like a bug. The banner stays for the whole session
  // unless the voter dismisses it, and the flag is also set on successful
  // submit (in `submit()` below) so returning voters don't see it twice.
  useEffect(() => {
    if (!isClient) return;
    if (hintExplicitlyDismissed) {
      try {
        window.localStorage.setItem(HINT_KEY, '1');
      } catch {
        /* noop */
      }
    }
  }, [isClient, hintExplicitlyDismissed]);

  const showHint = isClient && !hintSeenBefore && !hintExplicitlyDismissed;

  function change(optionId: string, direction: 1 | -1) {
    setAllocations((prev) => {
      // Validate against `prev`, never against render-scoped state: two
      // near-simultaneous taps on different options would otherwise both
      // check the same stale snapshot and overshoot the budget.
      const next = applyVote(prev, optionId, direction, creditsPerVoter);
      if (!next) {
        toast.error('Not enough credits for that vote');
        return prev;
      }
      return next;
    });

    // First-visit cost lesson. Best-effort and gated on the vote actually
    // being affordable (so we never teach off a rejected tap); the two
    // teachable steps cost 1 and 3 credits, so they're always affordable
    // when they fire. Render-scoped `allocations` is fine here — teaching
    // is not correctness-critical the way the budget gate above is.
    if (
      direction === 1 &&
      teachStep.current !== 'done' &&
      applyVote(allocations, optionId, direction, creditsPerVoter)
    ) {
      const totalVotesBefore = Object.values(allocations).reduce((a, b) => a + b, 0);
      const { step, beat } = nextTeach(
        teachStep.current,
        allocations[optionId] ?? 0,
        totalVotesBefore,
        direction,
      );
      teachStep.current = step;
      if (beat) {
        showBeat(optionId, beat);
        if (step === 'done') markTaught();
      }
    }
  }

  async function submit() {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/polls/${pollId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          allocations: allocationsList,
          voterToken: voterToken ?? undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Failed to submit' }));
        toast.error(body.error ?? 'Failed to submit');
        return;
      }
      toast.success('Vote recorded');
      // After a successful submission, mark both teaching layers as seen —
      // the voter has demonstrated they get it, so future polls skip the
      // banner and the cost annotation even if they never hit beat 2.
      try {
        window.localStorage.setItem(HINT_KEY, '1');
        window.localStorage.setItem(COST_TAUGHT_KEY, '1');
      } catch {
        /* noop */
      }
      router.push(`/poll/${pollId}/results`);
    } catch {
      toast.error('Network error. Check your connection and retry.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-6">
      {voterLabel && (
        <div className="mb-4 flex items-center gap-2 rounded-2xl border border-primary/20 bg-grad-brand-soft px-4 py-2.5 text-sm">
          <span className="font-medium text-foreground">
            Voting as <span className="text-grad-brand font-semibold">{voterLabel}</span>
          </span>
          <span className="text-muted-foreground">· personalized link</span>
        </div>
      )}
      <BudgetBar spent={spent} budget={creditsPerVoter} />

      <AnimatePresence>
        {showHint && (
          <VotingHintBanner
            creditsPerVoter={creditsPerVoter}
            optionsCount={options.length}
            onDismiss={() => setHintExplicitlyDismissed(true)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {stranded && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 flex items-start gap-2 rounded-md border border-amber-300/60 bg-amber-50/50 p-3 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100"
          >
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              You&apos;ve used {spent} of {creditsPerVoter} credits — the remaining {remaining}{' '}
              {remaining === 1 ? 'credit isn’t' : 'credits aren’t'} enough for another vote
              on any option. You can submit as-is, or reduce a vote elsewhere to free up budget.
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <ul className="mt-5 space-y-3" role="list" aria-label="Voting options">
        {options.map((o) => (
          <OptionCard
            key={o.id}
            label={o.label}
            votes={allocations[o.id] ?? 0}
            remainingCredits={remaining}
            onChange={(dir) => change(o.id, dir)}
            annotation={annotation?.optionId === o.id ? BEAT_TEXT[annotation.beat] : undefined}
          />
        ))}
      </ul>

      {/* Sticky on desktop too (was sm:static): a full-width band on mobile,
          a floating centered bar on desktop — so the budget + submit stay in
          view even on a long list of options. */}
      <div className="fixed inset-x-0 bottom-0 z-10 sm:bottom-6 sm:px-4">
        <div className="border-t border-border/60 bg-background/90 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/70 sm:mx-auto sm:max-w-2xl sm:rounded-2xl sm:border sm:border-border sm:bg-card/85 sm:px-5 sm:py-4 sm:shadow-brand sm:supports-[backdrop-filter]:bg-card/75">
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <div className="text-sm">
            <p className="font-medium tabular-nums">
              {spent} / {creditsPerVoter} credits
            </p>
            <p className="text-xs text-muted-foreground">
              {hasAnyVote
                ? 'Tap submit when you’re done'
                : 'Cast at least one vote, or submit blank to abstain'}
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => setConfirmOpen(true)}
            disabled={submitting}
            className="h-11 bg-grad-brand text-primary-foreground shadow-brand hover:opacity-95"
          >
            Submit vote
          </Button>
          </div>
        </div>
      </div>

      <SubmitDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        submitting={submitting}
        allocations={allocationsList.map((a) => ({
          optionId: a.optionId,
          label: options.find((o) => o.id === a.optionId)?.label ?? '',
          numVotes: a.numVotes,
          creditsSpent: creditCost(a.numVotes),
        }))}
        creditsPerVoter={creditsPerVoter}
        onConfirm={submit}
      />
    </div>
  );
}
