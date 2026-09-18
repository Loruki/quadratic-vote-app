import Link from 'next/link';
import { ArrowRight, BarChart3, Coins, ExternalLink, Scale, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Eyebrow } from '@/components/shared/eyebrow';
import { CostCurveDemo } from '@/components/landing/cost-curve-demo';
import { DotVotingComparison } from '@/components/landing/dot-voting-comparison';
import { TemplateGrid } from '@/components/landing/template-grid';
import { TrackView } from '@/growth-kit';

/**
 * V2 positioning: lead with the job (group prioritization), not the
 * mechanism. Nobody searches for "quadratic voting"; they search for a
 * better retro, roadmap or budget vote. QV is how it works, explained
 * lower down. See docs/pm/research/demand-and-distribution.md.
 */
export default function Home() {
  return (
    <main className="flex-1">
      <TrackView event="landing_view" />
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="hero-mesh pointer-events-none absolute inset-0 -z-10" aria-hidden />
        <div className="mx-auto max-w-5xl px-6 pb-16 pt-16 sm:pt-24 lg:pt-28">
          <div className="flex flex-col items-start gap-6">
            <Eyebrow icon={<Scale className="h-3 w-3" />}>Group prioritization, done fairly</Eyebrow>
            <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Find out what your group{' '}
              <span className="text-grad-brand">cares about most.</span>
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl">
              With dot voting, one person can pile every dot on their pet idea. Here,
              everyone gets the same budget, and each extra vote on the same option costs more.
              So the ranking shows what the group actually wants. Runs on a phone in 90 seconds.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                asChild
                size="lg"
                className="h-12 bg-grad-brand px-6 text-base text-primary-foreground shadow-brand transition-opacity hover:opacity-95"
              >
                <Link href="/create?from=landing">
                  Start a poll <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 border-border/80 bg-background/60 px-5 text-base backdrop-blur"
              >
                <Link href="#templates">Browse templates</Link>
              </Button>
            </div>
            <p className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
              <Zap className="h-3.5 w-3.5 text-primary" /> No signup. Nothing to pay. Same
              credits for everyone.
            </p>
          </div>
        </div>
      </section>

      {/* Templates */}
      <section id="templates" className="border-t border-border/50">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Pick the decision. <span className="text-grad-brand">We’ll set it up.</span>
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Each template pre-fills a title and options you can edit. Share one link and
            people vote from their phones.
          </p>
          <div className="mt-8">
            <TemplateGrid from="landing" />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-border/50 bg-muted/30">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            One rule: <span className="text-grad-brand">stacking gets expensive.</span>
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            <Feature
              icon={<Coins className="h-5 w-5" />}
              title="Same credits for everyone"
              body="Each voter gets the same budget, usually 100 credits. They aren't money and nobody can buy more."
            />
            <Feature
              icon={<Scale className="h-5 w-5" />}
              title="Each extra vote costs more"
              body="Your first vote on an option costs 1 credit, the next 3, then 5. You can back one idea hard or several a little, not everything at once."
            />
            <Feature
              icon={<BarChart3 className="h-5 w-5" />}
              title="Results you can check"
              body="See how many people backed each option and how many votes each gave, so broad support and one loud voter look different."
            />
          </div>
          <div className="mt-12">
            <CostCurveDemo />
          </div>
        </div>
      </section>

      {/* vs dot voting */}
      <section className="border-t border-border/50">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Dot voting vs quadratic voting
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                Why piling your dots on one idea{' '}
                <span className="text-grad-brand">stops working.</span>
              </h2>
              <p className="mt-4 text-muted-foreground">
                Dot voting is quick and easy to understand, which is why it&apos;s everywhere.
                But it treats five dots from one person the same as one dot from five people.
                Quadratic voting charges for stacking, so the ranking reflects how many people
                care as well as how much.
              </p>
              <Link
                href="/vs/dot-voting"
                className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                The full comparison <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <DotVotingComparison />
          </div>
        </div>
      </section>

      {/* Proof — told honestly */}
      <section className="border-t border-border/50 bg-muted/30">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Used in the wild
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                Colorado lawmakers used it for five years.{' '}
                <span className="text-grad-brand">Then a judge stopped them.</span>
              </h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p className="text-lg">
                From 2019, Colorado House Democrats used quadratic voting to rank which bills
                should get a share of limited state money. In January 2024 a Denver judge
                ordered them to stop. The method worked; the problem was that the ballots were
                secret, and a legislature must decide in public.
              </p>
              <p>
                That&apos;s why ballots here are anonymous by default, and when a group should
                own its choices, organizers with personal voter links can switch to{' '}
                <span className="font-medium text-foreground">named ballots</span>. Voters are
                always told before they vote.
              </p>
              <a
                href="https://coloradosun.com/2024/01/05/colorado-legisalture-quadratic-voting-lawsuit/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                Read the Colorado Sun story <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-border/50">
        <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Straight answers
          </h2>
          <div className="mt-8 space-y-3">
            <Faq q="Do people pay for votes?">
              No. Every voter gets the same number of credits for free. Credits only measure
              how much each option matters to you. You can&apos;t buy more, and there&apos;s
              no money anywhere in the system.
            </Faq>
            <Faq q="Isn't it complicated?">
              There&apos;s one thing to learn: each extra vote on the same option costs more
              (1, then 3, then 5 credits). The first taps on the voting page teach it, and
              most people finish in about 90 seconds.
            </Faq>
            <Faq q="When should I use a normal poll instead?">
              For yes/no questions, or when you just need one winner quickly. Quadratic voting
              is useful when there are several options competing for limited time, money or
              attention, and you want to know how strongly people feel.
            </Faq>
            <Faq q="Can people game it?">
              On an open link, one vote per browser: someone determined could clear cookies
              and vote again. When it matters, use personal voter links, which each work once.
              Two voters can agree to split their credits across each other&apos;s picks.
              In a small group of people who know each other, that&apos;s usually just a
              compromise.
            </Faq>
            <Faq q="Is my vote anonymous?">
              By default, yes: results show totals and a per-option breakdown, never who voted
              what. The only exception is a poll with named ballots, which you&apos;ll be told
              about on the voting page before you vote.
            </Faq>
            <Faq q="Does it work for small groups?">
              Yes, that&apos;s the main use: a team, a committee, friends or family. In a small
              group one enthusiastic voter can move the ranking, so every result shows how
              many people backed each option.
            </Faq>
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="border-t border-border/50">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
          <div className="relative overflow-hidden rounded-3xl bg-grad-brand p-8 text-primary-foreground shadow-brand sm:p-12">
            <div className="hero-mesh pointer-events-none absolute inset-0 opacity-30" aria-hidden />
            <div className="relative">
              <h2 className="flex items-center gap-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                <ShieldCheck className="h-8 w-8 shrink-0" /> Try it on a real decision.
              </h2>
              <p className="mt-3 max-w-xl text-base opacity-90 sm:text-lg">
                What to fix first. What to build next. Where to go this summer. Two minutes to
                set up, one link to share.
              </p>
              <div className="mt-6">
                <Button
                  asChild
                  size="lg"
                  className="h-12 bg-background px-6 text-base text-foreground hover:bg-background/90"
                >
                  <Link href="/create?from=landing_cta">
                    Start a poll <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
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

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="group rounded-2xl border border-border bg-card p-5 shadow-soft">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium [&::-webkit-details-marker]:hidden">
        {q}
        <span className="text-primary transition-transform group-open:rotate-45" aria-hidden>
          +
        </span>
      </summary>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{children}</p>
    </details>
  );
}
