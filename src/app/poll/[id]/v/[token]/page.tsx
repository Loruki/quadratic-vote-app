import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, CheckCircle2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Eyebrow } from '@/components/shared/eyebrow';
import { getPollWithOptions, getVoterAllocations, getVoterToken } from '@/lib/polls';
import { VotingClient } from '@/components/vote/voting-client';
import { AlreadyVotedSummary } from '@/components/vote/already-voted-summary';

interface PageProps {
  params: Promise<{ id: string; token: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const data = await getPollWithOptions(id);
  if (!data) return { title: 'Poll not found' };
  return {
    title: `${data.poll.title} — Quadratic Vote`,
    description: data.poll.description ?? 'Your personal voter link.',
    robots: { index: false }, // never index personalized URLs
  };
}

export default async function TokenizedVotingPage({ params }: PageProps) {
  const { id, token } = await params;

  const tokenRow = await getVoterToken(token);
  if (!tokenRow || tokenRow.pollId !== id) notFound();

  const data = await getPollWithOptions(id);
  if (!data) notFound();

  // Closed poll
  if (data.poll.isClosed) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
        <Header
          title={data.poll.title}
          description={data.poll.description}
          voterLabel={tokenRow.label}
        />
        <div className="mt-6 flex items-center gap-2 rounded-2xl border border-amber-300/60 bg-amber-50/40 p-4 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
          <Lock className="h-4 w-4" /> This poll is closed — voting has ended.
        </div>
        <div className="mt-6">
          <Button asChild>
            <Link href={`/poll/${id}/results`}>
              See results <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </main>
    );
  }

  // Token already used
  if (tokenRow.consumedAt) {
    const myAllocations = await getVoterAllocations(id, tokenRow.id);
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
        <Header
          title={data.poll.title}
          description={data.poll.description}
          voterLabel={tokenRow.label}
        />
        <div className="mt-6 flex items-center gap-2 rounded-2xl border border-emerald-300/60 bg-emerald-50/50 p-4 text-sm text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-200">
          <CheckCircle2 className="h-4 w-4" />
          This voter link has been used — your ballot is locked in.
        </div>
        <AlreadyVotedSummary
          pollId={id}
          options={data.options}
          creditsPerVoter={data.poll.creditsPerVoter}
          allocations={myAllocations.map((v) => ({
            optionId: v.optionId,
            numVotes: v.numVotes,
          }))}
        />
      </main>
    );
  }

  // Active voting
  return (
    <main className="mx-auto w-full max-w-2xl px-4 pb-32 pt-6 sm:px-6 sm:pt-10">
      <Header
        title={data.poll.title}
        description={data.poll.description}
        voterLabel={tokenRow.label}
      />
      <VotingClient
        pollId={id}
        options={data.options.map((o) => ({ id: o.id, label: o.label }))}
        creditsPerVoter={data.poll.creditsPerVoter}
        voterToken={token}
        voterLabel={tokenRow.label}
      />
    </main>
  );
}

function Header({
  title,
  description,
}: {
  title: string;
  description: string | null;
  voterLabel: string | null;
}) {
  return (
    <header className="space-y-3">
      <Eyebrow>Personal voter link</Eyebrow>
      <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
        {title}
      </h1>
      {description && <p className="text-muted-foreground sm:text-lg">{description}</p>}
    </header>
  );
}
