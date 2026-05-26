import type { Metadata } from 'next';
import { Eyebrow } from '@/components/shared/eyebrow';
import { MyPollsList } from '@/components/my/my-polls-list';

export const metadata: Metadata = {
  title: 'My polls — Quadratic Vote',
  description: 'Polls you created from this browser. Admin links included.',
  robots: { index: false },
};

export default function MyPollsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
      <header className="space-y-3">
        <Eyebrow>This browser</Eyebrow>
        <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          My polls
        </h1>
        <p className="max-w-2xl text-muted-foreground sm:text-lg">
          Every poll you create is saved here so you can recover its admin link if you lost
          it. Stored locally in this browser — clearing your data or switching devices means
          starting fresh, so for important polls also save a backup file.
        </p>
      </header>
      <div className="mt-8">
        <MyPollsList />
      </div>
    </main>
  );
}
