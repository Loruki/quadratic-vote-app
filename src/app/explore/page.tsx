import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Compass, Lock, Sparkles, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Eyebrow } from '@/components/shared/eyebrow';
import { getPublicPolls } from '@/lib/polls';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Explore polls — Quadratic Vote',
  description: 'Browse public quadratic-voting polls. Vote on what the community cares about.',
};

export default async function ExplorePage() {
  const polls = await getPublicPolls(48);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
      <header className="space-y-3">
        <Eyebrow icon={<Compass className="h-3 w-3" />}>Explore</Eyebrow>
        <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          What the community is <span className="text-grad-brand">deciding</span>.
        </h1>
        <p className="max-w-2xl text-muted-foreground sm:text-lg">
          Public polls anyone can vote on. Each one captures not just{' '}
          <em>which</em> options people prefer, but <em>how strongly</em>.
        </p>
        <div className="pt-2">
          <Button
            asChild
            className="bg-grad-brand text-primary-foreground shadow-soft hover:opacity-95"
          >
            <Link href="/create">
              Create a public poll <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      {polls.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
          <Sparkles className="mx-auto h-6 w-6 text-primary" />
          <p className="mt-3 text-base font-medium">No public polls yet.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Be the first — create one and share what your community should decide.
          </p>
        </div>
      ) : (
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
          {polls.map((p) => (
            <li key={p.id}>
              <Link
                href={`/poll/${p.id}`}
                className="group flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-brand"
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 rounded-full bg-grad-brand-soft px-2 py-0.5 font-semibold text-primary">
                    {p.creditsPerVoter}c · {p.optionCount} options
                  </span>
                  {p.isClosed && (
                    <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                      <Lock className="h-3 w-3" /> Closed
                    </span>
                  )}
                </div>
                <p className="mt-3 line-clamp-3 text-base font-semibold leading-snug">
                  {p.title}
                </p>
                {p.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {p.description}
                  </p>
                )}
                <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {p.voterCount} {p.voterCount === 1 ? 'voter' : 'voters'}
                  </span>
                  <span className="font-medium text-primary group-hover:underline">
                    Vote →
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
