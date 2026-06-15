import type { Metadata } from 'next';
import { Eyebrow } from '@/components/shared/eyebrow';
import { CreatePollForm } from '@/components/poll/create-poll-form';
import { TrackView } from '@/growth-kit';

export const metadata: Metadata = {
  title: 'Create a poll — Quadratic Vote',
  description: 'Set a title, list your options, share the link. Two minutes, no signup.',
};

export default function CreatePage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
      <TrackView event="signup_start" />
      <header className="space-y-3">
        <Eyebrow>New poll</Eyebrow>
        <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          What should we decide{' '}
          <span className="text-grad-brand">together?</span>
        </h1>
        <p className="max-w-xl text-muted-foreground">
          Add your options, pick how much budget each voter gets, and share the link.
          Two minutes, no signup. We&apos;ll give you a private admin link to manage the poll.
        </p>
      </header>
      <div className="mt-8 rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-7">
        <CreatePollForm />
      </div>
    </main>
  );
}
