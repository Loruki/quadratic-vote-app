import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MyPollsHeaderLink } from './my-polls-header-link';
import { Wordmark } from './wordmark';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/40 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
        <Wordmark />
        <nav className="flex items-center gap-1">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="/explore">Explore</Link>
          </Button>
          <MyPollsHeaderLink />
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="/#how-it-works">How it works</Link>
          </Button>
          <Button asChild size="sm" className="bg-grad-brand text-primary-foreground shadow-soft hover:opacity-95">
            <Link href="/create">Create a poll</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
