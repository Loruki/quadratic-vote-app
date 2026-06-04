'use client';

import { AlertTriangle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AllocationRow {
  optionId: string;
  label: string;
  numVotes: number;
  creditsSpent: number;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submitting: boolean;
  allocations: AllocationRow[];
  creditsPerVoter: number;
  onConfirm: () => void;
}

// Voters who cast a single vote and submit ("one-click submitters") usually
// missed the point of the mechanic. We BLOCK submission below 30% of budget
// for a non-blank ballot — a hard gate, not just a nudge. A fully blank
// ballot is still allowed (abstention is a legitimate choice).
const LOW_USAGE_THRESHOLD = 0.3;

export function SubmitDialog({
  open,
  onOpenChange,
  submitting,
  allocations,
  creditsPerVoter,
  onConfirm,
}: Props) {
  const nonZero = allocations.filter((a) => a.numVotes !== 0);
  const totalSpent = nonZero.reduce((sum, a) => sum + a.creditsSpent, 0);
  const usage = totalSpent / creditsPerVoter;
  // Blocked: cast at least one vote but used less than the threshold.
  const blocked = nonZero.length > 0 && usage < LOW_USAGE_THRESHOLD;
  const remaining = creditsPerVoter - totalSpent;
  const minSpend = Math.ceil(creditsPerVoter * LOW_USAGE_THRESHOLD);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Submit your vote?</DialogTitle>
          <DialogDescription>
            {nonZero.length === 0
              ? 'You’re submitting a blank ballot (abstention). You can’t change your vote after submitting.'
              : `Spending ${totalSpent} of ${creditsPerVoter} credits. You can’t change your vote after submitting.`}
          </DialogDescription>
        </DialogHeader>

        {blocked && (
          <div className="flex items-start gap-2.5 rounded-2xl border border-amber-300/60 bg-amber-50/60 p-3 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="space-y-1">
              <p className="font-semibold">
                Use more of your budget before submitting.
              </p>
              <p className="text-amber-900/90 dark:text-amber-100/90">
                Quadratic Vote isn’t a pick-one poll. You’ve spent{' '}
                <span className="tabular-nums font-medium">{totalSpent}</span> of{' '}
                <span className="tabular-nums">{creditsPerVoter}</span> credits — spend at
                least <span className="tabular-nums font-medium">{minSpend}</span>. Keep tapping{' '}
                <Sparkles className="inline h-3 w-3" /> + to add votes, on this option or any
                other. ({remaining} credits left.)
              </p>
            </div>
          </div>
        )}

        {nonZero.length > 0 && (
          <ul className="max-h-60 space-y-1.5 overflow-auto rounded-md border border-border bg-muted/30 p-3 text-sm">
            {nonZero.map((a) => (
              <li key={a.optionId} className="flex items-center justify-between gap-3">
                <span className="truncate">{a.label}</span>
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  {a.numVotes > 0 ? `+${a.numVotes}` : a.numVotes} ·{' '}
                  <span className="text-foreground">
                    {a.creditsSpent} {a.creditsSpent === 1 ? 'credit' : 'credits'}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}

        <DialogFooter className="sm:justify-end">
          {blocked ? (
            // Hard gate: the only way forward is back to voting. No escape
            // hatch — that's the difference between this and the old nudge.
            <Button
              onClick={() => onOpenChange(false)}
              disabled={submitting}
              className="bg-grad-brand text-primary-foreground shadow-brand hover:opacity-95"
            >
              Keep voting →
            </Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
                Keep editing
              </Button>
              <Button
                onClick={onConfirm}
                disabled={submitting}
                className="bg-grad-brand text-primary-foreground shadow-brand hover:opacity-95"
              >
                {submitting ? 'Submitting…' : 'Submit vote'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
