'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, BookOpen, ExternalLink, GitBranch, Shield, Sparkles, TrendingUp, AlertTriangle } from 'lucide-react';
import { CostCurveDemo } from '@/components/landing/cost-curve-demo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function LearnPage() {
  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="hero-mesh pointer-events-none absolute inset-0 -z-10" aria-hidden />
        <div className="mx-auto max-w-5xl px-6 pb-20 pt-16 sm:pt-24 lg:pt-32">
          <div className="flex flex-col items-start gap-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium text-foreground/80 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Learn Quadratic Voting
            </span>
            <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Understand{' '}
              <span className="text-grad-brand">how QV works</span>
              <br className="hidden sm:block" /> and why it matters.
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl">
              A clear, interactive explainer for curious visitors. No PhD required — just 5 minutes
              to grasp the mechanism that's reshaping collective decisions from Colorado to Gitcoin.
            </p>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="border-t border-border/50 bg-muted/30">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary mb-4">
              The Core Problem
            </p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Most polls ask <span className="text-grad-brand">which</span>. QV asks{' '}
              <span className="text-grad-brand">how much</span>.
            </h2>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="flex gap-4">
                <div className="flex-shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-grad-brand text-primary-foreground">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Intensity of preference, not just direction</h3>
                  <p className="mt-1 text-muted-foreground">
                    Traditional voting forces a binary choice: you either support something or you don't.
                    But in reality, you might care deeply about one issue and barely care about another.
                    QV lets you express <em>intensity</em> — a passionate minority can outweigh a mildly
                    indifferent majority.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-grad-brand text-primary-foreground">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">The cost curve forces honesty</h3>
                  <p className="mt-1 text-muted-foreground">
                    Every vote has a price: 1 vote = 1 credit, 2 votes = 4 credits, 3 votes = 9 credits.
                    The cost is <em>votes squared</em>. Doubling your impact quadruples the price.
                    This makes 'gaming the system' expensive — you can't just upvote everything.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-grad-brand text-primary-foreground">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Designed for real decisions</h3>
                  <p className="mt-1 text-muted-foreground">
                    Whether it's a team picking features, a city budgeting funds, or a DAO allocating
                    grants — QV produces outcomes that better reflect what people actually want.
                    It's not a theory; it's been tested in legislatures, $50M+ grant rounds, and
                    citizen budgets worldwide.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Interactive Cost Curve Demo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="sticky top-24">
                <CostCurveDemo />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Real-World Proof */}
      <section className="border-t border-border/50">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary mb-4">
              Real-World Proof
            </p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              The math that won <span className="text-grad-brand">Colorado, Gitcoin, Taiwan, Optimism.</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Quadratic voting isn't just academic — it's been battle-tested in production.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <CaseStudyCard
              icon={<GitBranch className="h-5 w-5" />}
              title="Colorado Legislature"
              period="2019–2024"
              description="100 voice credits across 100+ bills. Top-ranked: Equal Pay Act. Expanded from House Dems to both chambers. Halted 2024 by court over anonymity vs transparency."
              source="RadicalxChange / Colorado Sun"
            />
            <CaseStudyCard
              icon={<Sparkles className="h-5 w-5" />}
              title="Gitcoin Grants"
              period="2019–Present"
              description="$60M+ distributed, 230+ rounds, 3,715+ projects, 270K+ donors. Quadratic Funding shifts power from large donors to broad community support. Created Gitcoin Passport for Sybil resistance."
              source="Gitcoin Impact Dashboard"
            />
            <CaseStudyCard
              icon={<Shield className="h-5 w-5" />}
              title="Taiwan Presidential Hackathon"
              period="2019–Present"
              description="99 voice credits, 30% scoring weight under Digital Minister Audrey Tang. Broke committee herding patterns — 'stopped the follow-up effect and group-influenced decision'."
              source="vTaiwan / RadicalxChange"
            />
            <CaseStudyCard
              icon={<AlertTriangle className="h-5 w-5" />}
              title="Optimism RetroPGF"
              period="2021–Present"
              description="Round 1 used QV. Rounds 2–3 switched to mean/median because small voter pools amplified outlier influence. Key lesson: QV needs large N for theoretical guarantees."
              source="RetroPGF / Optimism"
            />
          </div>

          <div className="mt-12 text-center">
            <Button variant="outline" asChild size="lg">
              <Link href="/create" className="flex items-center justify-center gap-2">
                Try it yourself <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Honest Limits */}
      <section className="border-t border-border/50 bg-muted/30">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary mb-4">
              Honest Limits
            </p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Where QV <span className="text-grad-brand">struggles</span> — and why we don't hide it.
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <LimitationCard
              icon={<AlertTriangle className="h-5 w-5" />}
              title="Sybil Attacks"
              description="Fake identities convert QV back to linear voting. One person with 10 accounts acts like 10 people. Requires identity verification (Gitcoin Passport, proof-of-personhood) for high-stakes decisions."
              severity="High"
            />
            <LimitationCard
              icon={<GitBranch className="h-5 w-5" />}
              title="Small Groups Amplify Outliers"
              description="Theoretical proofs require large N. With fewer than ~20 voters, individual allocations dominate. Optimism abandoned QV for this reason. For teams of 5–10, consider median aggregation instead."
              severity="Medium"
            />
            <LimitationCard
              icon={<Shield className="h-5 w-5" />}
              title="Collusion"
              description="Coordinated groups simulate a single large voter across accounts. Breaks QV's efficiency properties. Hard to detect, harder to prevent. Best defense: transparent processes and reputation systems."
              severity="Medium"
            />
            <LimitationCard
              icon={<BookOpen className="h-5 w-5" />}
              title="UX Comprehension"
              description="Quadratic cost is non-intuitive. Users allocate suboptimally without guidance. This tool addresses it with interactive demos and real-time marginal cost feedback — but it's an ongoing challenge."
              severity="Medium"
            />
            <LimitationCard
              icon={<AlertTriangle className="h-5 w-5" />}
              title="Anonymity vs Accountability"
              description="QV works best anonymously (honest preferences), but public bodies need transparency. Colorado's experiment was halted by court order over this. Our tool: anonymous by default, document the trade-off."
              severity="High"
            />
            <LimitationCard
              icon={<Sparkles className="h-5 w-5" />}
              title="Leftover Credits"
              description="Whole-number vote math means some credits can never be spent (e.g., 7 credits left, but √7 ≈ 2.65 — can't buy another vote on options with 2+ votes). We show clear messaging when this happens."
              severity="Low"
            />
          </div>
        </div>
      </section>

      {/* Research & Sources */}
      <section className="border-t border-border/50">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary mb-4">
              Deep Dive
            </p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Research, sources, and <span className="text-grad-brand">primary references</span>.
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Internal Research (docs/pm/research/)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ResearchLink
                  title="Key Findings"
                  description="7 distilled findings from competitive analysis (10 tools), academic research, and case studies — each mapping to a product decision."
                  href="/docs/pm/research/key-findings.md"
                  external={false}
                />
                <ResearchLink
                  title="QV Implementations & Theory"
                  description="Academic foundations (Lalley & Weyl, Posner & Weyl, Buterin et al.), real-world case studies (Colorado, Gitcoin, Taiwan, Optimism), and critical gotchas."
                  href="/docs/pm/research/qv-implementations-and-theory.md"
                  external={false}
                />
                <ResearchLink
                  title="Competitive Analysis"
                  description="10-tool deep dive: RxC QV, Snapshot, Gitcoin, Civicbase, Anish QV Dashboard, QV Lite, and more. Covers mobile support, inline education, Sybil resistance, UX patterns."
                  href="/docs/pm/research/competitive-analysis.md"
                  external={false}
                />
                <ResearchLink
                  title="Sources & References"
                  description="Curated bibliography: academic papers, books, blog posts, case studies, tools, and UX research. 60+ bookmarked resources organized by category."
                  href="/docs/pm/research/sources.md"
                  external={false}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="h-5 w-5 text-primary" />
                  Primary External Sources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ResearchLink
                  title="Lalley & Weyl: Quadratic Voting (formal proof, 2015)"
                  description="The mathematical proof that QV approaches efficiency as voter count grows."
                  href="https://www.ias.edu/sites/default/files/sss/pdfs/Rodrik/workshop%2014-15/Weyl-Quadratic_Voting.pdf"
                  external={true}
                />
                <ResearchLink
                  title="Posner & Weyl: Voting Squared (2014)"
                  description="Core political theory application of QV to democratic politics."
                  href="https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2343956"
                  external={true}
                />
                <ResearchLink
                  title="Buterin, Hitzig & Weyl: Liberal Radicalism / QF (2018)"
                  description="Extended QV into Quadratic Funding — matching proportional to square of sum of square roots."
                  href="https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3243656"
                  external={true}
                />
                <ResearchLink
                  title="Quadratic Voting in the Wild (Quarfoot et al., 2017)"
                  description="First empirical study with real participants. Found QV respondents spent 30% more time engaging."
                  href="https://www.researchgate.net/publication/318006147_Quadratic_Voting_in_the_Wild_Real_People_Real_Votes"
                  external={true}
                />
                <ResearchLink
                  title="Vitalik Buterin: Quadratic Payments Primer"
                  description="Accessible explainer of QV and QF from Ethereum's founder."
                  href="https://vitalik.ca/general/2019/12/07/quadratic.html"
                  external={true}
                />
                <ResearchLink
                  title="Tim Daub: UX Problems of Quadratic Voting"
                  description="Deep dive into why the formula 'runs backward from how humans budget' and how to fix it."
                  href="https://timdaub.github.io/2022/03/27/the-user-experience-problems-of-quadratic-voting/"
                  external={true}
                />
                <ResearchLink
                  title="WTF is QF (interactive explainer)"
                  description="Best-in-class interactive pattern for explaining quadratic mechanisms."
                  href="https://wtfisqf.com/"
                  external={true}
                />
                <ResearchLink
                  title="RadicalxChange QV Wiki"
                  description="Community-maintained knowledge base on QV theory, implementations, and case studies."
                  href="https://www.radicalxchange.org/wiki/quadratic-voting/"
                  external={true}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/50">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
          <div className="relative overflow-hidden rounded-3xl bg-grad-brand p-8 text-primary-foreground shadow-brand sm:p-12">
            <div className="hero-mesh pointer-events-none absolute inset-0 opacity-30" aria-hidden />
            <div className="relative text-center">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Ready to try it on a real decision?
              </h2>
              <p className="mt-3 max-w-xl text-base opacity-90 sm:text-lg mx-auto">
                What features to ship next. Where the team should travel. Which name to pick.
                Two minutes to set up, one link to share.
              </p>
              <div className="mt-6 flex justify-center">
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
    </main>
  );
}

function CaseStudyCard({
  icon,
  title,
  period,
  description,
  source,
}: {
  icon: React.ReactNode;
  title: string;
  period: string;
  description: string;
  source: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-brand"
    >
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-grad-brand-soft text-primary">
        {icon}
      </div>
      <div className="flex items-baseline justify-between gap-2 mb-2">
        <h3 className="text-base font-semibold">{title}</h3>
        <span className="text-xs text-muted-foreground font-mono">{period}</span>
      </div>
      <p className="text-sm text-muted-foreground mb-3">{description}</p>
      <p className="text-xs text-muted-foreground/70">Source: {source}</p>
    </motion.div>
  );
}

function LimitationCard({
  icon,
  title,
  description,
  severity,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  severity: 'High' | 'Medium' | 'Low';
}) {
  const severityColors = {
    High: 'text-red-500 bg-red-500/10 border-red-500/20',
    Medium: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    Low: 'text-green-500 bg-green-500/10 border-green-500/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-2xl border border-border bg-card p-5 shadow-soft"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-grad-brand-soft text-primary">
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-baseline gap-2 mb-1">
            <h3 className="text-base font-semibold">{title}</h3>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${severityColors[severity]}`}>
              {severity}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}

function ResearchLink({
  title,
  description,
  href,
  external,
}: {
  title: string;
  description: string;
  href: string;
  external: boolean;
}) {
  return (
    <Button
      variant="ghost"
      className="w-full justify-start gap-3 p-3 hover:bg-muted/50 transition-colors text-left"
      asChild
    >
      <Link href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}>
        <div className="flex-1">
          <p className="font-medium text-foreground">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {external && <ExternalLink className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />}
      </Link>
    </Button>
  );
}