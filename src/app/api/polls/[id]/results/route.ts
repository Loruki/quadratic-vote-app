import type { NextRequest } from 'next/server';
import { jsonError } from '@/lib/api';
import { getPollWithOptions, getResults } from '@/lib/polls';

// Results are polled live by the client — never cache.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const data = await getPollWithOptions(id);
  if (!data) return jsonError('Poll not found', 404);
  const results = await getResults(id);
  const { adminToken: _omit, ...publicPoll } = data.poll;
  void _omit;
  return Response.json(
    {
      poll: publicPoll,
      options: data.options.map((o) => ({
        id: o.id,
        label: o.label,
        position: o.position,
        netVotes: results.perOption.get(o.id)?.netVotes ?? 0,
        creditsSpent: results.perOption.get(o.id)?.creditsSpent ?? 0,
      })),
      voterCount: results.voterCount,
      totalCreditsSpent: results.totalCreditsSpent,
      averageCreditsUtilization:
        results.voterCount > 0
          ? results.totalCreditsSpent / (results.voterCount * data.poll.creditsPerVoter)
          : 0,
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
