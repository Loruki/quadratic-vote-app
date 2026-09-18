import type { Metadata } from 'next';
import { Eyebrow } from '@/components/shared/eyebrow';
import { CreatePollForm } from '@/components/poll/create-poll-form';
import { TrackView } from '@/growth-kit';
import { getTemplate } from '@/lib/templates';

export const metadata: Metadata = {
  title: 'Create a poll — Quadratic Vote',
  description:
    'Pick a template or list your options, share the link, and see what your group cares about most. Two minutes, no signup.',
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function CreatePage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const template = getTemplate(first(sp.template));
  // Where the creator came from, e.g. 'results' / 'voted' for the voter →
  // creator loop, 'landing' for the template chips on the home page.
  const from = first(sp.from)?.slice(0, 32);

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
      <TrackView
        event="signup_start"
        props={{ ...(from ? { from } : {}), ...(template ? { template: template.id } : {}) }}
      />
      <header className="space-y-3">
        <Eyebrow>New poll</Eyebrow>
        <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          What should we decide{' '}
          <span className="text-grad-brand">together?</span>
        </h1>
        <p className="max-w-xl text-muted-foreground">
          List the options, share one link, and everyone spends the same budget of credits on
          what matters to them. Two minutes, no signup. You&apos;ll get a private admin link to
          manage the poll.
        </p>
      </header>
      <div className="mt-8 rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-7">
        <CreatePollForm key={template?.id ?? 'blank'} template={template} />
      </div>
    </main>
  );
}
