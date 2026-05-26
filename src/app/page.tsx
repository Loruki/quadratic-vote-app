import Link from 'next/link';
import { ArrowRight, Coins, Smartphone, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CostCurveDemo } from '@/components/landing/cost-curve-demo';

export default function Home() {
  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="hero-mesh pointer-events-none absolute inset-0 -z-10" aria-hidden />
        <div className="mx-auto max-w-5xl px-6 pb-20 pt-16 sm:pt-24 lg:pt-32">
          <div className="flex flex-col items-start gap-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium text-foreground/80 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Quadratic voting, made for everyone
            </span>
            <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Vote with{' '}
              <span className="text-grad-brand">how much</span>
              <br className="hidden sm:block" /> you care.
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Most polls only ask <em>which</em>. Quadratic Vote asks <em>how strongly</em> —
              every voter spends a credit budget, and concentrating votes gets expensive fast.
              Honest priorities, in 90 seconds, on a phone.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                asChild
                size="lg"
                className="h-12 bg-grad-brand px-6 text-base text-primary-foreground shadow-brand transition-opacity hover:opacity-95"
              >
                <Link href="/create">
                  Create a poll <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 border-border/80 bg-background/60 px-5 text-base backdrop-blur"
              >
                <Link href="#how-it-works">See how it works</Link>
              </Button>
            </div>
            <p className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
              <Zap className="h-3.5 w-3.5 text-primary" /> No signup. No wallet. Open source.
            </p>
          </div>

          {/* Interactive demo */}
          <div className="mt-14">
            <CostCurveDemo />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-border/50 bg-muted/30">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Three ideas. <span className="text-grad-brand">One mechanism.</span>
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            <Feature
              icon={<Coins className="h-5 w-5" />}
              title="N votes cost N² credits"
              body="1 vote = 1 credit. 2 votes = 4. 3 votes = 9. The cost curve forces honest priorities — you can't just upvote everything."
            />
            <Feature
              icon={<Smartphone className="h-5 w-5" />}
              title="Built for phones"
              body="Share a link, vote one-handed on the commute. No account, no wallet, no setup. The link IS the product."
            />
            <Feature
              icon={<Sparkles className="h-5 w-5" />}
              title="Teaches itself"
              body="The interface explains QV by letting you do it. Watch the budget bar move — you'll feel the math."
            />
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="border-t border-border/50">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Used in the wild
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                The math that won{' '}
                <span className="text-grad-brand">Colorado, Gitcoin, Taiwan, Optimism.</span>
              </h2>
            </div>
            <p className="text-lg text-muted-foreground">
              Quadratic voting has been tested in legislatures, $50M+ grant rounds, citizen
              budgets and DAO governance. The theory works. The evidence works. What&apos;s been
              missing is a tool the rest of us can actually use — without a PhD in mechanism
              design.
            </p>
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="border-t border-border/50">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
          <div className="relative overflow-hidden rounded-3xl bg-grad-brand p-8 text-primary-foreground shadow-brand sm:p-12">
            <div className="hero-mesh pointer-events-none absolute inset-0 opacity-30" aria-hidden />
            <div className="relative">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Try it on a real decision.
              </h2>
              <p className="mt-3 max-w-xl text-base opacity-90 sm:text-lg">
                What features to ship next. Where the team should travel. Which name to pick.
                Two minutes to set up, one link to share.
              </p>
              <div className="mt-6">
                <Button
                  asChild
                  size="lg"
                  className="h-12 bg-background px-6 text-base text-foreground hover:bg-background/90"
                >
                  <Link href="/create">
                    Create your first poll <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/50">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-6 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            Open source · Anonymous · Phone-first · Built for{' '}
            <span className="text-grad-brand font-medium">honest preferences</span>.
          </p>
          <p className="text-xs">
            © {new Date().getFullYear()} Quadratic Vote
          </p>
        </div>
      </footer>
    </main>
  );
}

function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="group rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-brand">
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-grad-brand-soft text-primary">
        {icon}
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
