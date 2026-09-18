'use client';

import { Activity, Eye, Lock, UserCheck, Wallet, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import type { ResultsView } from '@/lib/results';
import { NamedBallots } from './named-ballots';
import { ResultsChart } from './results-chart';
import { SmallGroupNote } from './small-group-note';

type LiveData = ResultsView;

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Props {
  pollId: string;
  initial: LiveData;
}

export function LiveResults({ pollId, initial }: Props) {
  // SWR polls /api/polls/[id]/results every 3s while the poll is open. Once
  // it's closed, we stop polling (results are final). The initial payload is
  // server-rendered so we never show an empty state.
  const { data } = useSWR<LiveData>(`/api/polls/${pollId}/results`, fetcher, {
    fallbackData: initial,
    refreshInterval: initial.poll.isClosed ? 0 : 3000,
    revalidateOnFocus: true,
  });

  const view = data ?? initial;
  const ranked = [...view.options].sort((a, b) => b.netVotes - a.netVotes);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 pt-1 text-sm">
        <StatChip
          icon={<Users className="h-3.5 w-3.5" />}
          label={`${view.voterCount} ${view.voterCount === 1 ? 'voter' : 'voters'}`}
        />
        <StatChip
          icon={<Wallet className="h-3.5 w-3.5" />}
          label={`${Math.round(view.averageCreditsUtilization * 100)}% avg. budget used`}
        />
        {view.turnout && (
          <StatChip
            icon={<UserCheck className="h-3.5 w-3.5" />}
            label={`${view.turnout.voted} of ${view.turnout.invited} invited voted`}
          />
        )}
        {view.ballots && (
          <StatChip icon={<Eye className="h-3.5 w-3.5" />} label="Named ballots" />
        )}
        {view.poll.isClosed ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            <Lock className="h-3 w-3" /> Closed
          </span>
        ) : (
          <LiveBadge />
        )}
      </div>

      {view.voterCount === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
          <p className="text-base font-medium">No votes yet.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Share the voter link to get the first ones in.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-8">
            <ResultsChart data={ranked} voterCount={view.voterCount} />
          </div>
          <SmallGroupNote voterCount={view.voterCount} />
        </>
      )}

      {view.ballots && <NamedBallots ballots={view.ballots} options={view.options} />}
    </>
  );
}

function LiveBadge() {
  // A tiny "live" indicator with a pulsing dot.
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1500);
    return () => clearInterval(id);
  }, []);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full bg-grad-brand-soft px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary"
      aria-live="polite"
      data-tick={tick}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inset-0 animate-ping rounded-full bg-primary opacity-75" />
        <span className="relative h-1.5 w-1.5 rounded-full bg-primary" />
      </span>
      <Activity className="h-3 w-3" /> Live
    </span>
  );
}

function StatChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground shadow-soft">
      <span className="text-primary">{icon}</span>
      {label}
    </span>
  );
}
