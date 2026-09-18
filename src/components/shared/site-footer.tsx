import Link from 'next/link';
import { Mail } from 'lucide-react';

const CONTACT_EMAIL = 'contact@quadratic-voting.com';

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-border/50">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p>
            Anonymous · Phone-first · Built for{' '}
            <span className="text-grad-brand font-medium">honest preferences</span>.
          </p>
          <p className="text-xs">© {year} Quadratic Vote</p>
        </div>

        <nav className="flex flex-wrap items-center gap-x-4 gap-y-2" aria-label="Footer">
          <Link href="/explore" className="transition-colors hover:text-foreground">
            Explore
          </Link>
          <Link href="/create" className="transition-colors hover:text-foreground">
            Create a poll
          </Link>
          <Link href="/my" className="transition-colors hover:text-foreground">
            My polls
          </Link>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
          >
            <Mail className="h-4 w-4" /> {CONTACT_EMAIL}
          </a>
        </nav>
      </div>
    </footer>
  );
}
