import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Eyebrow } from '@/components/shared/eyebrow';
import { getPollWithOptions, getResults } from '@/lib/polls';
import { LiveResults } from '@/components/results/live-results';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const data = await getPollWithOptions(id);
  if (!data) return { title: 'Poll not found' };
  return {
    title: `Results: ${data.poll.title} — Quadratic Vote`,
    description: data.poll.description ?? undefined,
    openGraph: {
      title: data.poll.title,
      description: data.poll.description ?? 'Live quadratic voting results.',
      images: [`/api/og/poll/${id}`],
    },
    twitter: {
      card: 'summary_large_image',
      title: data.poll.title,
      description: data.poll.description ?? 'Live quadratic voting results.',
      images: [`/api/og/poll/${id}`],
    },
  };
}

export default async function ResultsPage({ params }: PageProps) {
  const { id } = await params;
  const data = await getPollWithOptions(id);
  if (!data) notFound();

  const results = await getResults(id);
  const utilization =
    results.voterCount > 0
      ? results.totalCreditsSpent / (results.voterCount * data.poll.creditsPerVoter)
      : 0;

  const initial = {
    poll: {
      id: data.poll.id,
      title: data.poll.title,
      isClosed: data.poll.isClosed,
      creditsPerVoter: data.poll.creditsPerVoter,
    },
    options: data.options.map((o) => ({
      id: o.id,
      label: o.label,
      position: o.position,
      netVotes: results.perOption.get(o.id)?.netVotes ?? 0,
      creditsSpent: results.perOption.get(o.id)?.creditsSpent ?? 0,
    })),
    voterCount: results.voterCount,
    averageCreditsUtilization: utilization,
  };

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      {data.poll.voterMode === 'open' && (
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-3">
          <Link href={`/poll/${id}`}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to poll
          </Link>
        </Button>
      )}

      <header className="space-y-3">
        <Eyebrow>Results</Eyebrow>
        <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          {data.poll.title}
        </h1>
        {data.poll.description && (
          <p className="text-muted-foreground sm:text-lg">{data.poll.description}</p>
        )}
        <LiveResults pollId={id} initial={initial} />
      </header>
    </main>
  );
}
