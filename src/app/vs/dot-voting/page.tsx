import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Eyebrow } from '@/components/shared/eyebrow';
import { DotVotingComparison } from '@/components/landing/dot-voting-comparison';
import { TemplateGrid } from '@/components/landing/template-grid';

const TITLE = 'Dot voting vs quadratic voting: a fairer way to prioritize as a team';
const DESCRIPTION =
  'Dot voting lets one person pile every dot on a pet idea. Quadratic voting makes stacking expensive, so broad support wins. When to use which, with a free online tool.';

export const metadata: Metadata = {
  title: `${TITLE} — Quadratic Vote`,
  description: DESCRIPTION,
  alternates: { canonical: '/vs/dot-voting' },
  openGraph: { title: TITLE, description: DESCRIPTION, images: ['/og.png'] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: ['/og.png'] },
};

/**
 * Comparison page for people searching for a dot-voting alternative, the
 * way they actually look for this tool. Deliberately even-handed: it says
 * when dot voting is the better choice.
 */
export default function DotVotingPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
      <header className="space-y-4">
        <Eyebrow>Comparison</Eyebrow>
        <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Dot voting vs <span className="text-grad-brand">quadratic voting</span>
        </h1>
        <p className="text-lg text-muted-foreground">
          Both let a group spread votes across options. The difference is what happens when
          someone puts all their votes on one option.
        </p>
      </header>

      <Prose>
        <h2>How dot voting works</h2>
        <p>
          Everyone gets the same number of dots (often 3 to 5) and puts them on the options
          they like, several on one option if they want. The option with the most dots wins.
          It&apos;s fast, visual and needs no explanation, which is why it shows up in almost
          every retro and workshop.
        </p>

        <h2>Where dot voting goes wrong</h2>
        <p>
          <strong>Stacking.</strong>{' '}Five dots from one person count the same as one dot each
          from five people. One strongly motivated person can outweigh a broad consensus, and
          everyone else can see it happening.
        </p>
        <p>
          <strong>No intensity signal.</strong>{' '}A dot on something you love and a dot on
          something you&apos;re fine with look the same, so the result can&apos;t tell a
          must-have from a nice-to-have.
        </p>

        <h2>How quadratic voting fixes it</h2>
        <p>
          Everyone gets the same budget of credits, but each extra vote on the same option
          costs more than the last. The first vote costs 1 credit, the second 3, the third 5;
          in total, <em>n</em> votes cost <em>n²</em> credits. Backing several options a little
          is cheap. Putting everything on one is expensive.
        </p>
        <div className="my-6 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="rounded-2xl border border-border bg-card p-4 text-center shadow-soft">
              <p className="text-2xl font-semibold tabular-nums">{n}</p>
              <p className="text-xs text-muted-foreground">{n === 1 ? 'vote' : 'votes'} cost</p>
              <p className="mt-1 font-semibold tabular-nums text-grad-brand">
                {n * n} {n === 1 ? 'credit' : 'credits'}
              </p>
            </div>
          ))}
        </div>
        <p>
          So four people giving one vote each (4 credits in total) produce the same total as one
          person giving four votes (16 credits). Broad support is cheap and one person pushing
          hard is expensive, which is how most groups would want it.
        </p>
      </Prose>

      <div className="mt-10">
        <DotVotingComparison />
      </div>

      <Prose>
        <h2>When to stick with dot voting</h2>
        <p>
          In a live workshop with sticky notes and a clear favorite, dot voting is hard to beat
          for speed. It&apos;s also fine when the stakes are low and nobody is likely to stack.
          Quadratic voting takes one extra idea to understand, and for a quick lunch-order poll
          that isn&apos;t worth it.
        </p>

        <h2>When quadratic voting is worth it</h2>
        <ul>
          <li>Several options compete for the same limited time, money or attention.</li>
          <li>You suspect a few loud voices would dominate a normal vote.</li>
          <li>You care about how strongly people feel, not just which option they pick.</li>
          <li>People vote asynchronously, from their phones, not all in one room.</li>
        </ul>
      </Prose>

      <section className="mt-12" aria-labelledby="templates-heading">
        <h2 id="templates-heading" className="text-2xl font-semibold tracking-tight">
          Try it on your next decision
        </h2>
        <p className="mt-2 text-muted-foreground">
          Free, no signup. Pick a template, share one link.
        </p>
        <div className="mt-6">
          <TemplateGrid from="vs_dot_voting" />
        </div>
        <div className="mt-6">
          <Button
            asChild
            size="lg"
            className="h-12 bg-grad-brand px-6 text-base text-primary-foreground shadow-brand hover:opacity-95"
          >
            <Link href="/create?from=vs_dot_voting">
              Start a poll <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}

/** Minimal long-form typography without pulling in a prose plugin. */
function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-10 space-y-4 text-base leading-relaxed text-muted-foreground [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-foreground [&_ul]:space-y-1.5">
      {children}
    </div>
  );
}
