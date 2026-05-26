'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { canAffordAnyMoreVote, creditCost, remainingCredits, totalCreditsSpent } from '@/lib/quadratic';
import { BudgetBar } from './budget-bar';
import { OptionCard } from './option-card';
import { SubmitDialog } from './submit-dialog';
import { TooltipWalkthrough } from './tooltip-walkthrough';

interface Props {
  pollId: string;
  options: { id: string; label: string }[];
  creditsPerVoter: number;
  voterToken?: string;
  voterLabel?: string | null;
}

type AllocationMap = Record<string, number>;

const WALKTHROUGH_KEY = 'qv_walkthrough_seen';

export function VotingClient({
  pollId,
  options,
  creditsPerVoter,
  voterToken,
  voterLabel,
}: Props) {
  const router = useRouter();
  const [allocations, setAllocations] = useState<AllocationMap>(() =>
    Object.fromEntries(options.map((o) => [o.id, 0])),
  );
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [showWalkthrough, setShowWalkthrough] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return !window.localStorage.getItem(WALKTHROUGH_KEY);
    } catch {
      return false;
    }
  });

  const allocationsList = useMemo(
    () => options.map((o) => ({ optionId: o.id, numVotes: allocations[o.id] ?? 0 })),
    [allocations, options],
  );

  const spent = totalCreditsSpent(allocationsList);
  const remaining = remainingCredits(allocationsList, creditsPerVoter);
  const stranded = remaining > 0 && !canAffordAnyMoreVote(allocationsList, creditsPerVoter);
  const hasAnyVote = allocationsList.some((a) => a.numVotes !== 0);

  function change(optionId: string, direction: 1 | -1) {
    setAllocations((prev) => {
      const cur = prev[optionId] ?? 0;
      const next = cur + direction;
      const trialList = allocationsList.map((a) =>
        a.optionId === optionId ? { ...a, numVotes: next } : a,
      );
      const trialSpent = totalCreditsSpent(trialList);
      if (trialSpent > creditsPerVoter) {
        toast.error('Not enough credits for that vote');
        return prev;
      }
      return { ...prev, [optionId]: next };
    });
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
      router.push(`/poll/${pollId}/results`);
    } catch {
      toast.error('Network error. Check your connection and retry.');
    } finally {
      setSubmitting(false);
    }
  }

  function dismissWalkthrough() {
    setShowWalkthrough(false);
    try {
      window.localStorage.setItem(WALKTHROUGH_KEY, '1');
    } catch {
      /* noop */
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
          />
        ))}
      </ul>

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-border/60 bg-background/90 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/70 sm:static sm:mt-8 sm:rounded-2xl sm:border sm:bg-card sm:px-5 sm:py-4 sm:shadow-soft">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 sm:max-w-none">
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

      <TooltipWalkthrough
        open={showWalkthrough}
        creditsPerVoter={creditsPerVoter}
        onClose={dismissWalkthrough}
      />

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
