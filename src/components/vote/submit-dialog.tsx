'use client';

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
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
            Keep editing
          </Button>
          <Button onClick={onConfirm} disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit vote'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
