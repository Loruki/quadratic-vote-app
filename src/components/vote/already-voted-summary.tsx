import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { creditCost } from '@/lib/quadratic';

interface Props {
  pollId: string;
  options: { id: string; label: string }[];
  creditsPerVoter: number;
  allocations: { optionId: string; numVotes: number }[];
}

export function AlreadyVotedSummary({ pollId, options, creditsPerVoter, allocations }: Props) {
  const byOption = new Map(allocations.map((a) => [a.optionId, a.numVotes]));
  const totalSpent = allocations.reduce((s, a) => s + creditCost(a.numVotes), 0);

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 rounded-lg border border-emerald-300/60 bg-emerald-50/40 p-4 text-sm text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-200">
        <CheckCircle2 className="h-4 w-4" />
        <span>You&apos;ve already voted on this poll. Here&apos;s how you allocated.</span>
      </div>

      <ul className="mt-5 space-y-2">
        {options.map((o) => {
          const v = byOption.get(o.id) ?? 0;
          return (
            <li
              key={o.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3 text-sm"
            >
              <span className="truncate">{o.label}</span>
              <span className="shrink-0 tabular-nums text-muted-foreground">
                <span
                  className={
                    v > 0
                      ? 'font-medium text-primary'
                      : v < 0
                        ? 'font-medium text-destructive'
                        : 'text-muted-foreground'
                  }
                >
                  {v > 0 ? `+${v}` : v}
                </span>{' '}
                · {creditCost(v)}c
              </span>
            </li>
          );
        })}
      </ul>

      <p className="mt-4 text-sm text-muted-foreground">
        Total: {totalSpent} of {creditsPerVoter} credits spent.
      </p>

      <div className="mt-6">
        <Button asChild>
          <Link href={`/poll/${pollId}/results`}>See results</Link>
        </Button>
      </div>
    </div>
  );
}
