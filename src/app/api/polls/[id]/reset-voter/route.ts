import { timingSafeEqual } from 'node:crypto';
import { and, eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { db, schema } from '@/db';
import { jsonError, parseJson } from '@/lib/api';
import { resetVoterSchema } from '@/lib/validators/poll';

function compareTokens(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

class ResetError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

// Admin clears one tokenized voter's ballot so their personal link works
// again. Tokenized polls only — open polls have no per-person identity to
// reset. Admin token in Authorization: Bearer, never the URL.
export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  const auth = request.headers.get('authorization') ?? '';
  const adminToken = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length).trim() : '';
  if (!adminToken) return jsonError('Admin token required', 401);

  const parsed = await parseJson(request, resetVoterSchema);
  if (!parsed.ok) return parsed.response;
  const { voterToken } = parsed.data;

  try {
    await db.transaction(async (tx) => {
      const poll = await tx.query.polls.findFirst({ where: eq(schema.polls.id, id) });
      if (!poll) throw new ResetError(404, 'Poll not found');
      if (!compareTokens(poll.adminToken, adminToken)) {
        throw new ResetError(403, 'Invalid admin token');
      }
      if (poll.voterMode !== 'tokenized') {
        throw new ResetError(400, 'Reset is only available for tokenized polls');
      }

      const tokenRow = await tx.query.voterTokens.findFirst({
        where: eq(schema.voterTokens.token, voterToken),
      });
      if (!tokenRow || tokenRow.pollId !== id) {
        throw new ResetError(404, 'Voter not found for this poll');
      }
      // Idempotent: if the token was never used, there's nothing to clear.
      if (!tokenRow.consumedAt) return;

      // Delete the ballot — votes cascade via their ballot_id FK — then free
      // the token so its link works again.
      await tx
        .delete(schema.ballots)
        .where(and(eq(schema.ballots.pollId, id), eq(schema.ballots.voterId, tokenRow.id)));
      await tx
        .update(schema.voterTokens)
        .set({ consumedAt: null, ballotId: null })
        .where(eq(schema.voterTokens.id, tokenRow.id));
    });
  } catch (err) {
    if (err instanceof ResetError) return jsonError(err.message, err.status);
    throw err;
  }

  return Response.json({ ok: true });
}
