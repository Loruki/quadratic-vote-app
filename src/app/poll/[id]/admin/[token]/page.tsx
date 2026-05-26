import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { eq } from 'drizzle-orm';
import { Button } from '@/components/ui/button';
import { db, schema } from '@/db';
import { SMALL_GROUP_THRESHOLD } from '@/lib/constants';
import { getPollWithOptions, getResults, getTokensForPoll } from '@/lib/polls';
import { ResultsChart } from '@/components/results/results-chart';
import { AdminControls } from '@/components/admin/admin-controls';
import { PostCreationBanner } from '@/components/admin/post-creation-banner';

export const metadata: Metadata = { title: 'Admin — Quadratic Vote', robots: { index: false } };

interface PageProps {
  params: Promise<{ id: string; token: string }>;
}

export default async function AdminPage({ params }: PageProps) {
  const { id, token } = await params;
  const poll = await db.query.polls.findFirst({ where: eq(schema.polls.id, id) });
  if (!poll) notFound();
  if (poll.adminToken !== token) notFound();

  const data = await getPollWithOptions(id);
  if (!data) notFound();
  const results = await getResults(id);
  const tokens =
    data.poll.voterMode === 'tokenized' ? await getTokensForPoll(id) : [];

  // Resolve origin from request headers so server- and client-rendered
  // URLs match exactly. Avoids window.location.origin hydration mismatches.
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3030';
  const proto = h.get('x-forwarded-proto') ?? 'http';
  const origin = `${proto}://${host}`;
  const ranked = data.options
    .map((o) => ({
      id: o.id,
      label: o.label,
      netVotes: results.perOption.get(o.id)?.netVotes ?? 0,
      creditsSpent: results.perOption.get(o.id)?.creditsSpent ?? 0,
    }))
    .sort((a, b) => b.netVotes - a.netVotes);

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-3">
        <Link href={`/poll/${id}/results`}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Public results
        </Link>
      </Button>

      <PostCreationBanner
        pollId={id}
        pollTitle={data.poll.title}
        adminUrl={`${origin}/poll/${id}/admin/${token}`}
        voterUrl={
          data.poll.voterMode === 'open' ? `${origin}/poll/${id}` : null
        }
        voterMode={data.poll.voterMode as 'open' | 'tokenized'}
        visibility={data.poll.visibility as 'public' | 'unlisted'}
        dismissTo={`/poll/${id}/admin/${token}`}
      />

      <header>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Admin view
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          {data.poll.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Created {new Date(data.poll.createdAt).toLocaleString()}
        </p>
      </header>

      <AdminControls
        pollId={id}
        token={token}
        origin={origin}
        isClosed={data.poll.isClosed}
        voterCount={results.voterCount}
        voterMode={data.poll.voterMode as 'open' | 'tokenized'}
        tokens={tokens.map((t) => ({
          token: t.token,
          label: t.label,
          consumedAt: t.consumedAt ? t.consumedAt.toISOString() : null,
        }))}
      />

      {results.voterCount === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No votes yet. Share the voter link to get the first ones in.
        </div>
      ) : (
        <>
          <div className="mt-6">
            <ResultsChart data={ranked} />
          </div>
          {results.voterCount < SMALL_GROUP_THRESHOLD && (
            <div className="mt-5 rounded-md border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
              Fewer than {SMALL_GROUP_THRESHOLD} voters — individual allocations have more impact
              on results.
            </div>
          )}
        </>
      )}
    </main>
  );
}
