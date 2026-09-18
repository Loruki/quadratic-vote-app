import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Eyebrow } from '@/components/shared/eyebrow';
import { getPollWithOptions, getResultsView } from '@/lib/polls';
import { CreateYourOwn } from '@/components/results/create-your-own';
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
      description: data.poll.description ?? 'Live results — see what the group cares about most.',
      images: ['/og.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title: data.poll.title,
      description: data.poll.description ?? 'Live results — see what the group cares about most.',
      images: ['/og.png'],
    },
  };
}

export default async function ResultsPage({ params }: PageProps) {
  const { id } = await params;
  const view = await getResultsView(id);
  if (!view) notFound();
  const { poll } = view;

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      {poll.voterMode === 'open' && (
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-3">
          <Link href={`/poll/${id}`}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to poll
          </Link>
        </Button>
      )}

      <header className="space-y-3">
        <Eyebrow>Results</Eyebrow>
        <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          {poll.title}
        </h1>
        {poll.description && (
          <p className="text-muted-foreground sm:text-lg">{poll.description}</p>
        )}
        <LiveResults pollId={id} initial={view} />
      </header>

      <CreateYourOwn source="results" />
    </main>
  );
}
