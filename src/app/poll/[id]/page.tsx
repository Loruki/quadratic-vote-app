import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, KeyRound, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Eyebrow } from '@/components/shared/eyebrow';
import { getPollWithOptions, getVoterAllocations, hasVoterSubmitted } from '@/lib/polls';
import { getVoterId } from '@/lib/voter-cookie';
import { VotingClient } from '@/components/vote/voting-client';
import { AlreadyVotedSummary } from '@/components/vote/already-voted-summary';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const data = await getPollWithOptions(id);
  if (!data) return { title: 'Poll not found' };
  return {
    title: `${data.poll.title} — Quadratic Vote`,
    description: data.poll.description ?? 'Vote with how much you care.',
    openGraph: {
      title: data.poll.title,
      description: data.poll.description ?? 'Vote with how much you care.',
      images: ['/og.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title: data.poll.title,
      description: data.poll.description ?? 'Vote with how much you care.',
      images: ['/og.png'],
    },
  };
}

export default async function PollPage({ params }: PageProps) {
  const { id } = await params;
  const data = await getPollWithOptions(id);
  if (!data) notFound();

  // Tokenized polls require a personalized URL. Visiting the bare poll URL
  // shows a friendly explainer + a link to the results.
  if (data.poll.voterMode === 'tokenized') {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
        <Header title={data.poll.title} description={data.poll.description} />
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-grad-brand-soft text-primary">
            <KeyRound className="h-5 w-5" />
          </span>
          <div>
            <p className="text-base font-semibold">This poll needs your personal voter link</p>
            <p className="mt-1 text-sm text-muted-foreground">
              The organizer gave each voter a unique link that looks like{' '}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                /poll/{id}/v/…
              </code>
              . Check your email or messages — or ask the organizer to resend it.
            </p>
          </div>
        </div>
        <div className="mt-6 flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/poll/${id}/results`}>
              See live results <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </main>
    );
  }

  const voterId = await getVoterId();
  const hasVoted = voterId ? await hasVoterSubmitted(id, voterId) : false;
  const myAllocations = hasVoted && voterId ? await getVoterAllocations(id, voterId) : [];

  if (data.poll.isClosed) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
        <Header title={data.poll.title} description={data.poll.description} />
        <div className="mt-6 flex items-center gap-2 rounded-lg border border-amber-300/60 bg-amber-50/40 p-4 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
          <Lock className="h-4 w-4" />
          <span>This poll is closed — voting has ended.</span>
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

  if (hasVoted) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
        <Header title={data.poll.title} description={data.poll.description} />
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

  return (
    <main className="mx-auto w-full max-w-2xl px-4 pb-32 pt-6 sm:px-6 sm:pt-10">
      <Header title={data.poll.title} description={data.poll.description} />
      <VotingClient
        pollId={id}
        options={data.options.map((o) => ({ id: o.id, label: o.label }))}
        creditsPerVoter={data.poll.creditsPerVoter}
      />
    </main>
  );
}

function Header({ title, description }: { title: string; description: string | null }) {
  return (
    <header className="space-y-3">
      <Eyebrow>Poll</Eyebrow>
      <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
        {title}
      </h1>
      {description && (
        <p className="text-muted-foreground sm:text-lg">{description}</p>
      )}
    </header>
  );
}
