/**
 * Pure aggregation of raw vote rows into per-option results.
 *
 * Beyond the totals, each option gets the numbers a skeptic needs to check
 * the outcome by hand: how many voters backed it, and a histogram of how
 * many votes each of them gave. "Is this result plausible, or did someone
 * hack it?" was the top complaint in real-world QV use — the breakdown
 * answers it without exposing who voted what.
 */

export interface VoteRow {
  voterId: string;
  optionId: string;
  numVotes: number;
}

export interface OptionSummary {
  netVotes: number;
  creditsSpent: number;
  /** Voters who put at least one vote on this option. */
  supporters: number;
  /** Sorted by votes ascending: `{ votes: 2, voters: 3 }` = three people gave 2 votes each. */
  histogram: { votes: number; voters: number }[];
}

export interface ResultsSummary {
  perOption: Map<string, OptionSummary>;
  /** Distinct voters with at least one non-zero vote. */
  voterCount: number;
  totalCreditsSpent: number;
}

export function summarizeVotes(rows: readonly VoteRow[]): ResultsSummary {
  const buckets = new Map<string, Map<number, number>>();
  const voterIds = new Set<string>();

  for (const r of rows) {
    if (r.numVotes === 0) continue;
    voterIds.add(r.voterId);
    const hist = buckets.get(r.optionId) ?? new Map<number, number>();
    hist.set(r.numVotes, (hist.get(r.numVotes) ?? 0) + 1);
    buckets.set(r.optionId, hist);
  }

  const perOption = new Map<string, OptionSummary>();
  let totalCreditsSpent = 0;

  for (const [optionId, hist] of buckets) {
    const histogram = [...hist.entries()]
      .map(([votes, voters]) => ({ votes, voters }))
      .sort((a, b) => a.votes - b.votes);
    let netVotes = 0;
    let creditsSpent = 0;
    let supporters = 0;
    for (const { votes, voters } of histogram) {
      netVotes += votes * voters;
      creditsSpent += votes * votes * voters;
      supporters += voters;
    }
    totalCreditsSpent += creditsSpent;
    perOption.set(optionId, { netVotes, creditsSpent, supporters, histogram });
  }

  return { perOption, voterCount: voterIds.size, totalCreditsSpent };
}

export const EMPTY_OPTION_SUMMARY: OptionSummary = {
  netVotes: 0,
  creditsSpent: 0,
  supporters: 0,
  histogram: [],
};

/** Serializable results payload, shared by the results API route and page. */
export interface ResultsOptionView {
  id: string;
  label: string;
  position: number;
  netVotes: number;
  creditsSpent: number;
  supporters: number;
  histogram: { votes: number; voters: number }[];
}

export interface ResultsView {
  poll: {
    id: string;
    title: string;
    description: string | null;
    isClosed: boolean;
    creditsPerVoter: number;
    voterMode: string;
    ballotVisibility: string;
  };
  options: ResultsOptionView[];
  voterCount: number;
  totalCreditsSpent: number;
  averageCreditsUtilization: number;
  /** Tokenized polls only: how many invited voters have submitted. */
  turnout: { voted: number; invited: number } | null;
  /** Named-ballot polls only: each submitted voter's allocation. */
  ballots: { label: string; allocations: { optionId: string; numVotes: number }[] }[] | null;
}
