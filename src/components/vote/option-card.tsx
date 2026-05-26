'use client';

import { motion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';
import { creditCost, nextVoteCost, refundForDecrement } from '@/lib/quadratic';

interface Props {
  label: string;
  votes: number;
  remainingCredits: number;
  onChange: (direction: 1 | -1) => void;
}

export function OptionCard({ label, votes, remainingCredits, onChange }: Props) {
  const currentCost = creditCost(votes);
  const upCost = nextVoteCost(votes);
  const refund = refundForDecrement(votes);
  const canIncrement = upCost <= remainingCredits;
  const canDecrement = votes > 0;

  return (
    <li>
      <div
        className={`group rounded-2xl border bg-card p-4 shadow-soft transition-all ${
          votes > 0 ? 'border-primary/30 ring-1 ring-primary/10' : 'border-border'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <p className="text-base font-medium leading-snug">{label}</p>
          <motion.span
            key={votes}
            initial={{ scale: 0.85, opacity: 0.4 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 350, damping: 22 }}
            className={`shrink-0 rounded-md px-2 py-1 text-sm font-semibold tabular-nums ${
              votes > 0 ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
            }`}
            aria-live="polite"
          >
            {votes > 0 ? `${votes} vote${votes === 1 ? '' : 's'}` : 'no votes'}
          </motion.span>
        </div>

        <div className="mt-3 flex items-end justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            <p className="tabular-nums">
              {currentCost} credit{currentCost === 1 ? '' : 's'} spent
            </p>
            <p className="mt-0.5 tabular-nums">
              {votes === 0 ? (
                <>First vote costs <span className="font-medium text-foreground">1</span></>
              ) : (
                <>
                  Next vote costs <span className="font-medium text-foreground">{upCost}</span>
                  {refund > 0 && (
                    <>
                      {' · '}step back refunds{' '}
                      <span className="font-medium text-foreground">{refund}</span>
                    </>
                  )}
                </>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onChange(-1)}
              disabled={!canDecrement}
              aria-label={`Remove a vote from ${label}`}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card text-foreground shadow-soft transition-colors hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Minus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onChange(1)}
              disabled={!canIncrement}
              aria-label={`Add a vote to ${label}`}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-grad-brand text-primary-foreground shadow-brand transition-opacity hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}
