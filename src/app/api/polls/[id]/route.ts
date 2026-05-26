import { timingSafeEqual } from 'node:crypto';
import { eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { db, schema } from '@/db';
import { jsonError, parseJson } from '@/lib/api';
import { updatePollSchema } from '@/lib/validators/poll';
import { getPollWithOptions, getVoterAllocations, hasVoterSubmitted } from '@/lib/polls';
import { getVoterId } from '@/lib/voter-cookie';

function compareTokens(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const data = await getPollWithOptions(id);
  if (!data) return jsonError('Poll not found', 404);
  const voterId = await getVoterId();
  const hasVoted = voterId ? await hasVoterSubmitted(id, voterId) : false;
  const myAllocations = voterId ? await getVoterAllocations(id, voterId) : [];
  // Strip adminToken — it must never leak through the public API.
  const { adminToken: _omit, ...publicPoll } = data.poll;
  void _omit;
  return Response.json({
    poll: publicPoll,
    options: data.options,
    hasVoted,
    myAllocations: myAllocations.map((v) => ({ optionId: v.optionId, numVotes: v.numVotes })),
  });
}

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  // Read admin token from Authorization: Bearer ..., NEVER from the URL.
  // Query-string tokens leak into logs, browser history, and Referer headers.
  const auth = request.headers.get('authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length).trim() : '';
  if (!token) return jsonError('Admin token required', 401);

  const poll = await db.query.polls.findFirst({ where: eq(schema.polls.id, id) });
  if (!poll) return jsonError('Poll not found', 404);
  if (!compareTokens(poll.adminToken, token)) return jsonError('Invalid admin token', 403);

  const parsed = await parseJson(request, updatePollSchema);
  if (!parsed.ok) return parsed.response;
  const input = parsed.data;

  const [updated] = await db
    .update(schema.polls)
    .set({ isClosed: input.isClosed })
    .where(eq(schema.polls.id, id))
    .returning();

  return Response.json({ poll: updated });
}
