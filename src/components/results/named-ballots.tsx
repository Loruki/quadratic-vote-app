import { Eye } from 'lucide-react';
import type { ResultsView } from '@/lib/results';

interface Props {
  ballots: NonNullable<ResultsView['ballots']>;
  options: { id: string; label: string }[];
}

/**
 * Open ballots for polls created with ballotVisibility='named'. The organizer
 * opted into this at creation and every voter was told before voting, so
 * showing it is the point: decisions a group can hold each other to.
 */
export function NamedBallots({ ballots, options }: Props) {
  const labelFor = new Map(options.map((o) => [o.id, o.label]));

  return (
    <section className="mt-10" aria-labelledby="named-ballots-heading">
      <div className="flex items-center gap-2">
        <Eye className="h-4 w-4 text-primary" />
        <h2 id="named-ballots-heading" className="text-lg font-semibold tracking-tight">
          Who voted for what
        </h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        The organizer made ballots public. Each voter was told before voting.
      </p>

      {ballots.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No ballots yet.</p>
      ) : (
        <ul className="mt-4 space-y-2" role="list">
          {ballots.map((b, idx) => {
            const votes = [...b.allocations]
              .filter((a) => a.numVotes !== 0)
              .sort((x, y) => y.numVotes - x.numVotes);
            return (
              <li
                key={`${idx}-${b.label}`}
                className="rounded-2xl border border-border bg-card p-3 shadow-soft sm:flex sm:items-start sm:justify-between sm:gap-4"
              >
                <p className="font-medium">{b.label}</p>
                {votes.length === 0 ? (
                  <p className="mt-1 text-sm text-muted-foreground sm:mt-0">Abstained</p>
                ) : (
                  <ul className="mt-2 flex flex-wrap gap-1.5 sm:mt-0 sm:justify-end" role="list">
                    {votes.map((a) => (
                      <li
                        key={a.optionId}
                        className="rounded-full bg-grad-brand-soft px-2.5 py-1 text-xs tabular-nums"
                      >
                        {labelFor.get(a.optionId) ?? 'Removed option'}{' '}
                        <span className="font-semibold text-primary">+{a.numVotes}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
