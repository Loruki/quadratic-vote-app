'use client';

import { motion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';
import { useState } from 'react';

const BUDGET = 25;
const MAX = 5;

export function CostCurveDemo() {
  const [votes, setVotes] = useState(2);
  const cost = votes * votes;
  const pct = Math.min(100, (cost / BUDGET) * 100);

  return (
    <div className="grid gap-6 rounded-3xl border border-border bg-card/80 p-6 shadow-soft backdrop-blur sm:p-8 lg:grid-cols-[1.1fr_1fr]">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Feel the cost curve
        </p>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          {votes} {votes === 1 ? 'vote' : 'votes'} costs{' '}
          <span className="text-grad-brand">{cost} credits</span>
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          The math is simple but it changes everything:{' '}
          <span className="font-medium text-foreground">cost = votes²</span>. Doubling your
          impact <em>quadruples</em> the price.
        </p>

        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setVotes((v) => Math.max(0, v - 1))}
            disabled={votes === 0}
            aria-label="Decrement demo votes"
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-background text-foreground transition-colors hover:bg-muted disabled:opacity-40"
          >
            <Minus className="h-4 w-4" />
          </button>
          <div className="flex-1">
            <div className="flex items-baseline justify-between text-xs text-muted-foreground">
              <span className="font-medium uppercase tracking-wider">Budget</span>
              <span className="tabular-nums">
                <span className="font-semibold text-foreground">{cost}</span> / {BUDGET}
              </span>
            </div>
            <div className="mt-1.5 h-3 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                initial={false}
                animate={{ width: `${pct}%` }}
                transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                className="h-full rounded-full bg-grad-brand"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => setVotes((v) => Math.min(MAX, v + 1))}
            disabled={votes === MAX || cost + (2 * votes + 1) > BUDGET}
            aria-label="Increment demo votes"
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-grad-brand text-primary-foreground shadow-soft transition-opacity hover:opacity-95 disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div>
        <div className="grid grid-cols-6 gap-2">
          {Array.from({ length: MAX + 1 }).map((_, n) => {
            const c = n * n;
            const active = n === votes;
            const reached = n <= votes;
            const overBudget = c > BUDGET;
            return (
              <motion.button
                key={n}
                type="button"
                onClick={() => setVotes(n)}
                disabled={overBudget}
                aria-pressed={active}
                aria-label={`Set demo to ${n} votes (${c} credits)`}
                initial={false}
                animate={{
                  scale: active ? 1.04 : 1,
                  opacity: overBudget ? 0.25 : reached ? 1 : 0.5,
                }}
                whileHover={overBudget ? undefined : { scale: active ? 1.06 : 1.03 }}
                whileTap={overBudget ? undefined : { scale: 0.97 }}
                className={`rounded-xl border p-2 text-center transition-shadow ${
                  active
                    ? 'border-transparent bg-grad-brand text-primary-foreground shadow-brand'
                    : reached
                      ? 'border-border bg-muted/50 hover:border-primary/40'
                      : 'border-border bg-card hover:border-primary/40'
                } disabled:cursor-not-allowed`}
              >
                <p className="font-mono text-[10px] uppercase tracking-wider opacity-80">
                  {n}v
                </p>
                <p className="font-mono text-sm font-semibold tabular-nums">
                  {c}
                </p>
              </motion.button>
            );
          })}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Tap any cell to jump there. Going from{' '}
          <span className="font-medium text-foreground">3 votes</span> to{' '}
          <span className="font-medium text-foreground">4</span> costs{' '}
          <span className="font-mono text-foreground">7</span> extra credits — more than
          you spent on the first three combined.
        </p>
      </div>
    </div>
  );
}
