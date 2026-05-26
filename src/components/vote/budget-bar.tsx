'use client';

import { motion } from 'framer-motion';

interface Props {
  spent: number;
  budget: number;
}

export function BudgetBar({ spent, budget }: Props) {
  const pct = Math.max(0, Math.min(100, (spent / budget) * 100));
  const overShoot = spent > budget;
  const near = pct >= 80;

  return (
    <div className="sticky top-14 z-20 -mx-4 border-b border-border/60 bg-background/85 px-4 pb-3 pt-3 backdrop-blur sm:static sm:mx-0 sm:rounded-2xl sm:border sm:border-border sm:bg-card sm:px-5 sm:pb-4 sm:pt-4 sm:shadow-soft">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Budget
        </p>
        <p className="text-sm tabular-nums text-muted-foreground">
          <span
            className={`font-semibold ${
              overShoot ? 'text-destructive' : 'text-foreground'
            }`}
          >
            {spent}
          </span>{' '}
          / {budget} credits
        </p>
      </div>
      <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 220, damping: 24 }}
          className={`h-full rounded-full ${
            overShoot
              ? 'bg-destructive'
              : near
                ? 'bg-gradient-to-r from-amber-400 to-destructive'
                : 'bg-grad-brand'
          }`}
        />
      </div>
    </div>
  );
}
