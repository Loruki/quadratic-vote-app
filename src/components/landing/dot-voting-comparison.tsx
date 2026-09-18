import { Check, Minus, X } from 'lucide-react';

type Mark = 'yes' | 'no' | 'partly';

const ROWS: { label: string; dots: Mark; qv: Mark; note: string }[] = [
  {
    label: 'One person can stack everything on a pet idea',
    dots: 'yes',
    qv: 'no',
    note: '5 dots on one sticky = 5 people each giving one. Here, 5 votes on one option cost 25 credits.',
  },
  {
    label: 'Shows the gap between “love it” and “fine”',
    dots: 'partly',
    qv: 'yes',
    note: 'Extra votes cost more each time, so people only stack where they really care.',
  },
  {
    label: 'Broad support beats one loud voter',
    dots: 'no',
    qv: 'yes',
    note: 'Four people × 1 vote = 4 votes for 4 credits. One person × 4 votes = 4 votes for 16.',
  },
  {
    label: 'You can check how each total was reached',
    dots: 'partly',
    qv: 'yes',
    note: 'Every result shows how many voters backed an option and how many votes each gave.',
  },
  {
    label: 'Nothing to learn',
    dots: 'yes',
    qv: 'partly',
    note: 'One thing to learn: your second vote on an option costs 3, the third costs 5. The first taps teach it.',
  },
];

function MarkIcon({ mark, positive }: { mark: Mark; positive: boolean }) {
  // `positive` = whether "yes" is good for this row, so colors carry meaning.
  const good = (mark === 'yes') === positive && mark !== 'partly';
  if (mark === 'partly') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <Minus className="h-4 w-4" aria-hidden /> Partly
      </span>
    );
  }
  const Icon = mark === 'yes' ? Check : X;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium ${
        good ? 'text-emerald-700 dark:text-emerald-400' : 'text-destructive'
      }`}
    >
      <Icon className="h-4 w-4" aria-hidden /> {mark === 'yes' ? 'Yes' : 'No'}
    </span>
  );
}

/** Honest side-by-side. Includes the one row where dot voting wins. */
export function DotVotingComparison() {
  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
      <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 border-b border-border bg-muted/40 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:gap-x-8 sm:px-6">
        <span />
        <span className="w-16 text-center sm:w-20">Dot voting</span>
        <span className="w-16 text-center text-primary sm:w-20">Quadratic</span>
      </div>
      <ul role="list">
        {ROWS.map((r, idx) => {
          // Row 1 describes a flaw, so "yes" is bad there.
          const positive = idx !== 0;
          return (
            <li
              key={r.label}
              className="grid grid-cols-[1fr_auto_auto] items-start gap-x-4 border-b border-border/60 px-4 py-4 last:border-b-0 sm:gap-x-8 sm:px-6"
            >
              <div>
                <p className="text-sm font-medium">{r.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{r.note}</p>
              </div>
              <span className="flex w-16 justify-center pt-0.5 sm:w-20">
                <MarkIcon mark={r.dots} positive={positive} />
              </span>
              <span className="flex w-16 justify-center pt-0.5 sm:w-20">
                <MarkIcon mark={r.qv} positive={positive} />
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
