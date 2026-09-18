import { and, asc, count, desc, eq, inArray } from 'drizzle-orm';
import { db, schema } from '@/db';
import { EMPTY_OPTION_SUMMARY, summarizeVotes, type ResultsView } from '@/lib/results';

export async function getPollWithOptions(pollId: string) {
  const poll = await db.query.polls.findFirst({ where: eq(schema.polls.id, pollId) });
  if (!poll) return null;
  const opts = await db
    .select()
    .from(schema.options)
    .where(eq(schema.options.pollId, pollId))
    .orderBy(asc(schema.options.position));
  return { poll, options: opts };
}

export async function getVoterAllocations(pollId: string, voterId: string) {
  return db
    .select()
    .from(schema.votes)
    .where(and(eq(schema.votes.pollId, pollId), eq(schema.votes.voterId, voterId)));
}

export async function hasVoterSubmitted(pollId: string, voterId: string): Promise<boolean> {
  const row = await db.query.ballots.findFirst({
    where: and(eq(schema.ballots.pollId, pollId), eq(schema.ballots.voterId, voterId)),
  });
  return !!row;
}

export async function getVoterToken(token: string) {
  return db.query.voterTokens.findFirst({
    where: eq(schema.voterTokens.token, token),
  });
}

export async function getTokensForPoll(pollId: string) {
  return db
    .select()
    .from(schema.voterTokens)
    .where(eq(schema.voterTokens.pollId, pollId))
    .orderBy(asc(schema.voterTokens.createdAt));
}

export async function getResults(pollId: string) {
  const rows = await db
    .select({
      voterId: schema.votes.voterId,
      optionId: schema.votes.optionId,
      numVotes: schema.votes.numVotes,
    })
    .from(schema.votes)
    .where(eq(schema.votes.pollId, pollId));
  return summarizeVotes(rows);
}

/**
 * Everything the results page needs, in one serializable shape. Used by both
 * the server-rendered page (initial paint) and the polled API route, so the
 * two can never drift apart.
 */
export async function getResultsView(pollId: string): Promise<ResultsView | null> {
  const data = await getPollWithOptions(pollId);
  if (!data) return null;
  const { poll, options } = data;
  const results = await getResults(pollId);

  let turnout: ResultsView['turnout'] = null;
  let ballots: ResultsView['ballots'] = null;

  if (poll.voterMode === 'tokenized') {
    const tokens = await getTokensForPoll(pollId);
    turnout = {
      voted: tokens.filter((t) => t.consumedAt).length,
      invited: tokens.length,
    };

    if (poll.ballotVisibility === 'named') {
      // For tokenized polls, votes.voterId is the voter_tokens row id.
      const votesByVoter = new Map<string, { optionId: string; numVotes: number }[]>();
      const rows = await db
        .select({
          voterId: schema.votes.voterId,
          optionId: schema.votes.optionId,
          numVotes: schema.votes.numVotes,
        })
        .from(schema.votes)
        .where(eq(schema.votes.pollId, pollId));
      for (const r of rows) {
        const list = votesByVoter.get(r.voterId) ?? [];
        list.push({ optionId: r.optionId, numVotes: r.numVotes });
        votesByVoter.set(r.voterId, list);
      }
      ballots = tokens
        .filter((t) => t.consumedAt)
        .map((t, idx) => ({
          label: t.label ?? `Voter ${idx + 1}`,
          allocations: votesByVoter.get(t.id) ?? [],
        }));
    }
  }

  return {
    poll: {
      id: poll.id,
      title: poll.title,
      description: poll.description,
      isClosed: poll.isClosed,
      creditsPerVoter: poll.creditsPerVoter,
      voterMode: poll.voterMode,
      ballotVisibility: poll.ballotVisibility,
    },
    options: options.map((o) => {
      const summary = results.perOption.get(o.id) ?? EMPTY_OPTION_SUMMARY;
      return { id: o.id, label: o.label, position: o.position, ...summary };
    }),
    voterCount: results.voterCount,
    totalCreditsSpent: results.totalCreditsSpent,
    averageCreditsUtilization:
      results.voterCount > 0
        ? results.totalCreditsSpent / (results.voterCount * poll.creditsPerVoter)
        : 0,
    turnout,
    ballots,
  };
}

/** Has this browser's voter cookie cast a ballot on any poll? (Attribution only.) */
export async function hasVotedAnywhere(voterId: string): Promise<boolean> {
  const row = await db.query.ballots.findFirst({ where: eq(schema.ballots.voterId, voterId) });
  return !!row;
}

/**
 * Public polls for the /explore page, with aggregated option + voter counts.
 * Returns at most `limit` polls, ordered newest first.
 *
 * Counts are computed with two GROUP BY queries rather than correlated
 * subqueries: Drizzle's raw-sql `${table}` interpolation didn't correlate the
 * subquery to the outer row and silently returned 0 for every poll.
 */
export async function getPublicPolls(limit = 24) {
  const polls = await db
    .select({
      id: schema.polls.id,
      title: schema.polls.title,
      description: schema.polls.description,
      creditsPerVoter: schema.polls.creditsPerVoter,
      isClosed: schema.polls.isClosed,
      createdAt: schema.polls.createdAt,
    })
    .from(schema.polls)
    .where(and(eq(schema.polls.visibility, 'public'), eq(schema.polls.voterMode, 'open')))
    .orderBy(desc(schema.polls.createdAt))
    .limit(limit);

  if (polls.length === 0) return [];

  const ids = polls.map((p) => p.id);

  const [optionRows, ballotRows] = await Promise.all([
    db
      .select({ pollId: schema.options.pollId, n: count() })
      .from(schema.options)
      .where(inArray(schema.options.pollId, ids))
      .groupBy(schema.options.pollId),
    db
      .select({ pollId: schema.ballots.pollId, n: count() })
      .from(schema.ballots)
      .where(inArray(schema.ballots.pollId, ids))
      .groupBy(schema.ballots.pollId),
  ]);

  const optionCounts = new Map(optionRows.map((r) => [r.pollId, r.n]));
  const voterCounts = new Map(ballotRows.map((r) => [r.pollId, r.n]));

  return polls.map((p) => ({
    ...p,
    optionCount: optionCounts.get(p.id) ?? 0,
    voterCount: voterCounts.get(p.id) ?? 0,
  }));
}
