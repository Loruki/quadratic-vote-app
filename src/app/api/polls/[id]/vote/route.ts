import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { db, schema } from '@/db';
import { jsonError, parseJson } from '@/lib/api';
import { creditCost, totalCreditsSpent } from '@/lib/quadratic';
import { submitVoteSchema } from '@/lib/validators/poll';
import { getOrCreateVoterId } from '@/lib/voter-cookie';
import { trackServer, distinctIdFromCookie } from '@/growth-kit/server';

export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id: pollId } = await ctx.params;

  const parsed = await parseJson(request, submitVoteSchema);
  if (!parsed.ok) return parsed.response;
  const input = parsed.data;

  const cleaned = input.allocations.filter((a) => a.numVotes !== 0);
  const spent = totalCreditsSpent(cleaned);

  let resolvedVoterId = '';

  try {
    await db.transaction(async (tx) => {
      const poll = await tx.query.polls.findFirst({ where: eq(schema.polls.id, pollId) });
      if (!poll) throw new VoteError(404, 'Poll not found');
      if (poll.isClosed) throw new VoteError(409, 'Poll is closed');
      if (spent > poll.creditsPerVoter) {
        throw new VoteError(
          400,
          `Budget exceeded: spent ${spent}, budget ${poll.creditsPerVoter}`,
        );
      }

      const optionRows = await tx
        .select({ id: schema.options.id })
        .from(schema.options)
        .where(eq(schema.options.pollId, pollId));
      const validIds = new Set(optionRows.map((o) => o.id));
      for (const a of cleaned) {
        if (!validIds.has(a.optionId)) {
          throw new VoteError(400, `Unknown option for this poll: ${a.optionId}`);
        }
      }

      // Resolve voter identity based on the poll's mode.
      let voterId: string;
      let voterTokenRowId: string | null = null;
      if (poll.voterMode === 'tokenized') {
        if (!input.voterToken) {
          throw new VoteError(401, 'This poll requires a personalized voter link');
        }
        const tokenRow = await tx.query.voterTokens.findFirst({
          where: eq(schema.voterTokens.token, input.voterToken),
        });
        if (!tokenRow || tokenRow.pollId !== pollId) {
          throw new VoteError(403, 'Invalid voter token');
        }
        if (tokenRow.consumedAt) {
          throw new VoteError(409, 'This voter link has already been used');
        }
        voterId = tokenRow.id;
        voterTokenRowId = tokenRow.id;
      } else {
        // Open mode: cookie identity. Set the cookie if it's the first time.
        const { voterId: cookieVoter } = await getOrCreateVoterId();
        voterId = cookieVoter;
      }
      resolvedVoterId = voterId;

      let ballot;
      try {
        [ballot] = await tx
          .insert(schema.ballots)
          .values({ pollId, voterId, creditsSpent: spent })
          .returning();
      } catch (e) {
        if (isUniqueViolation(e)) throw new VoteError(409, 'You have already voted on this poll');
        throw e;
      }

      if (cleaned.length > 0) {
        await tx.insert(schema.votes).values(
          cleaned.map((a) => ({
            pollId,
            ballotId: ballot.id,
            voterId,
            optionId: a.optionId,
            numVotes: a.numVotes,
            creditsSpent: creditCost(a.numVotes),
          })),
        );
      }

      // Stamp the voter token as consumed (tokenized polls only).
      if (voterTokenRowId) {
        await tx
          .update(schema.voterTokens)
          .set({ consumedAt: new Date(), ballotId: ballot.id })
          .where(eq(schema.voterTokens.id, voterTokenRowId));
      }
    });
  } catch (err) {
    if (err instanceof VoteError) return jsonError(err.message, err.status);
    throw err;
  }

  // Activation captured server-side (blocker-proof): a vote was cast. Stitch to
  // the anonymous visitor so the funnel stays one person; fall back to voterId.
  const phKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const store = await cookies();
  const distinctId =
    distinctIdFromCookie(phKey ? store.get(`ph_${phKey}_posthog`)?.value : undefined) ??
    resolvedVoterId ??
    pollId;
  await trackServer(distinctId, 'activated', { pollId, creditsSpent: spent });

  return Response.json({ ok: true, creditsSpent: spent });
}

class VoteError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

function isUniqueViolation(e: unknown): boolean {
  for (let cur: unknown = e; cur != null; cur = (cur as { cause?: unknown }).cause) {
    if (typeof cur === 'object' && 'code' in cur && (cur as { code: unknown }).code === '23505') {
      return true;
    }
  }
  return false;
}
