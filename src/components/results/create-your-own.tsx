import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { POLL_TEMPLATES } from '@/lib/templates';

export type CreateSource = 'results' | 'voted';

/**
 * The growth loop: every poll reaches N voters, and the results page is the
 * last thing they see. Offer them the tool for their own decision, with
 * templates so the next step is one tap. `from` lets /create attribute the
 * poll back to this surface.
 */
export function CreateYourOwn({ source }: { source: CreateSource }) {
  return (
    <section
      className="mt-10 rounded-3xl border border-border bg-grad-brand-soft p-5 shadow-soft sm:p-6"
      aria-labelledby="create-your-own-heading"
    >
      <h2 id="create-your-own-heading" className="text-lg font-semibold tracking-tight">
        Got a decision of your own?
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Run one like this for your team, friends or family. About a minute, no signup.
      </p>
      <ul className="mt-4 flex flex-wrap gap-2" role="list">
        {POLL_TEMPLATES.map((t) => (
          <li key={t.id}>
            <Link
              href={`/create?template=${t.id}&from=${source}`}
              className="inline-flex rounded-full border border-border bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary"
            >
              {t.name}
            </Link>
          </li>
        ))}
        <li>
          <Link
            href={`/create?from=${source}`}
            className="inline-flex items-center gap-1 rounded-full bg-grad-brand px-3 py-1.5 text-sm font-medium text-primary-foreground shadow-soft transition-opacity hover:opacity-95"
          >
            Start blank <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </li>
      </ul>
    </section>
  );
}
