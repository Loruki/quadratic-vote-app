import type { NextRequest } from 'next/server';
import { jsonError } from '@/lib/api';
import { getResultsView } from '@/lib/polls';

// Results are polled live by the client — never cache.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const view = await getResultsView(id);
  if (!view) return jsonError('Poll not found', 404);
  return Response.json(view, { headers: { 'Cache-Control': 'no-store' } });
}
