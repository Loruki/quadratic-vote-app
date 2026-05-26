'use client';

import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';

interface Row {
  id: string;
  label: string;
  netVotes: number;
  creditsSpent: number;
}

export function ResultsChart({ data }: { data: Row[] }) {
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
            <p className="relative z-10 mt-2 text-xs text-muted-foreground tabular-nums">
              {r.creditsSpent} credits committed
            </p>
          </li>
        );
      })}
    </ul>
  );
}
