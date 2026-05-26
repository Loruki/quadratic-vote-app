import { and, asc, desc, eq, sql } from 'drizzle-orm';
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
 * Public polls for the /explore page, with cheap aggregated voter counts.
 * Returns at most `limit` polls, ordered newest first.
 */
export async function getPublicPolls(limit = 24) {
  const rows = await db
    .select({
      id: schema.polls.id,
      title: schema.polls.title,
      description: schema.polls.description,
      creditsPerVoter: schema.polls.creditsPerVoter,
      isClosed: schema.polls.isClosed,
      createdAt: schema.polls.createdAt,
      voterCount: sql<number>`COALESCE((SELECT COUNT(*) FROM ${schema.ballots} WHERE ${schema.ballots.pollId} = ${schema.polls.id}), 0)`.as(
        'voter_count',
      ),
      optionCount: sql<number>`COALESCE((SELECT COUNT(*) FROM ${schema.options} WHERE ${schema.options.pollId} = ${schema.polls.id}), 0)`.as(
        'option_count',
      ),
    })
    .from(schema.polls)
    .where(and(eq(schema.polls.visibility, 'public'), eq(schema.polls.voterMode, 'open')))
    .orderBy(desc(schema.polls.createdAt))
    .limit(limit);

  return rows;
}
