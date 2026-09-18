'use client';

import { motion } from 'framer-motion';
import { ChevronDown, Crown } from 'lucide-react';
import type { ResultsOptionView } from '@/lib/results';

type Row = Pick<
  ResultsOptionView,
  'id' | 'label' | 'netVotes' | 'creditsSpent' | 'supporters' | 'histogram'
>;

export function ResultsChart({ data, voterCount }: { data: Row[]; voterCount: number }) {
  const maxAbs = Math.max(1, ...data.map((d) => Math.abs(d.netVotes)));
  const top = data[0];

  return (
    <ul className="space-y-3" role="list" aria-label="Results">
      {data.map((r, idx) => {
        const isWinner = idx === 0 && top && r.netVotes > 0;
        const isNeg = r.netVotes < 0;
        const w = Math.max(2, (Math.abs(r.netVotes) / maxAbs) * 100);
        return (
          <li
            key={r.id}
            className={`relative overflow-hidden rounded-2xl border bg-card p-4 shadow-soft transition-all ${
              isWinner
                ? 'border-primary/30 ring-1 ring-primary/15'
                : isNeg
                  ? 'border-destructive/30'
                  : 'border-border'
            }`}
          >
            <div className="relative z-10 flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                {isWinner && (
                  <span
                    className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-grad-brand text-primary-foreground shadow-soft"
                    aria-label="Top result"
                  >
                    <Crown className="h-3 w-3" />
                  </span>
                )}
                <p className="truncate text-base font-medium">{r.label}</p>
              </div>
              <p
                className={`shrink-0 text-base font-semibold tabular-nums ${
                  isNeg ? 'text-destructive' : isWinner ? 'text-grad-brand' : 'text-foreground'
                }`}
              >
                {r.netVotes > 0 ? `+${r.netVotes}` : r.netVotes}
              </p>
            </div>
            <div className="relative z-10 mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${w}%` }}
                transition={{
                  type: 'spring',
                  stiffness: 80,
                  damping: 18,
                  delay: 0.05 * idx,
                }}
                className={`h-full rounded-full ${
                  isNeg
                    ? 'bg-destructive'
                    : isWinner
                      ? 'bg-grad-brand'
                      : 'bg-primary/70'
                }`}
              />
            </div>
            <Breakdown row={r} voterCount={voterCount} />
          </li>
        );
      })}
    </ul>
  );
}

/**
 * "Backed by N of M voters" plus an expandable histogram, so anyone can
 * re-add the total by hand and tell broad support from one enthusiast.
 */
function Breakdown({ row, voterCount }: { row: Row; voterCount: number }) {
  const backed = `Backed by ${row.supporters} of ${voterCount} ${voterCount === 1 ? 'voter' : 'voters'}`;

  if (row.histogram.length === 0) {
    return (
      <p className="relative z-10 mt-2 text-xs text-muted-foreground tabular-nums">
        {backed}
      </p>
    );
  }

  return (
    <details className="group relative z-10 mt-2 text-xs text-muted-foreground">
      <summary className="flex cursor-pointer list-none items-center gap-1 tabular-nums transition-colors hover:text-foreground [&::-webkit-details-marker]:hidden">
        {backed} · {row.creditsSpent} credits
        <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
        <span className="sr-only">Show how this total adds up</span>
      </summary>
      <div className="mt-2 rounded-xl bg-muted/50 p-3">
        <p className="mb-1.5 font-medium text-foreground">How it adds up</p>
        <ul className="space-y-1 tabular-nums" aria-label={`Vote breakdown for ${row.label}`}>
          {row.histogram.map((h) => (
            <li key={h.votes} className="flex justify-between gap-3">
              <span>
                {h.voters} {h.voters === 1 ? 'voter' : 'voters'} × {h.votes}{' '}
                {h.votes === 1 ? 'vote' : 'votes'}
              </span>
              <span>
                = {h.voters * h.votes} {h.voters * h.votes === 1 ? 'vote' : 'votes'} ·{' '}
                {h.voters * h.votes * h.votes}{' '}
                {h.voters * h.votes * h.votes === 1 ? 'credit' : 'credits'}
              </span>
            </li>
          ))}
          <li className="flex justify-between gap-3 border-t border-border/60 pt-1 font-medium text-foreground">
            <span>Total</span>
            <span>
              {row.netVotes} votes · {row.creditsSpent} credits
            </span>
          </li>
        </ul>
      </div>
    </details>
  );
}
