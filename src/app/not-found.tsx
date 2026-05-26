import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">404</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">Poll not found</h1>
      <p className="mt-2 text-muted-foreground">
        This poll doesn&apos;t exist, or the link has been mistyped. Double-check the URL.
      </p>
      <div className="mt-6 flex gap-2">
        <Button asChild>
          <Link href="/">Home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/create">Create a poll</Link>
        </Button>
      </div>
    </main>
  );
}
