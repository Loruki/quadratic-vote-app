import { and, asc, count, desc, eq, inArray, sql } from 'drizzle-orm';
import { db, schema } from '@/db';

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
  const allVotes = await db
    .select()
    .from(schema.votes)
    .where(eq(schema.votes.pollId, pollId));

  const byOption = new Map<string, { netVotes: number; creditsSpent: number }>();
  const voterIds = new Set<string>();
  let totalCreditsSpent = 0;

  for (const v of allVotes) {
    voterIds.add(v.voterId);
    totalCreditsSpent += v.creditsSpent;
    const cur = byOption.get(v.optionId) ?? { netVotes: 0, creditsSpent: 0 };
    cur.netVotes += v.numVotes;
    cur.creditsSpent += v.creditsSpent;
    byOption.set(v.optionId, cur);
  }

  return {
    perOption: byOption,
    voterCount: voterIds.size,
    totalCreditsSpent,
  };
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
