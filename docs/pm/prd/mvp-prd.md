# PRD: Quadratic Vote MVP

# Problem Alignment

## Problem & Opportunity

**Most people have never experienced a voting system that lets them say _how much_ they care.** Every election, every team poll, every community decision — you get one vote per option, and your mild "sure, that's fine" counts the same as someone else's "this is critical to me." Preference intensity is invisible. Decisions get made on volume of hands, not strength of conviction.

Quadratic voting fixes this. It's a mechanism where votes cost more the more you concentrate them — so caring deeply about something means putting real skin in the game. It's been tested in Colorado's legislature, Gitcoin's $50M+ grant rounds, Taiwan's participatory budgeting, and Optimism's retroactive funding. The theory works. The math works. The real-world evidence works.

But here's the gap: **QV is still trapped in the world of people who already know what QV is.** The existing tools — RadicalxChange's QV app, Snapshot, Civicbase, and others — are built by and for the QV community. They're doing important work. They've proven the mechanism, pushed the theory forward, run real experiments. They're our allies in the same mission: making collective decisions fairer and more expressive.

What's missing from the ecosystem is the tool that **brings QV to people who have never heard of it.** The one a team lead shares in Slack without needing to explain the math. The one that teaches you quadratic voting _by letting you do it_ — on your phone, in 90 seconds, with no sign-up, no wallet, no PhD in mechanism design.

- **The real problem:** Not "existing tools are bad" — they serve their audiences well. The problem is that QV has an adoption ceiling. The mechanism is brilliant, but the on-ramp is steep. Most people never encounter QV because no tool meets them where they are: a link on their phone, zero context, two minutes to spare.
- **Our contribution to the ecosystem:** We lower that on-ramp. Mobile-first, inline education, zero friction. If RadicalxChange is the academic paper and Snapshot is the governance protocol, we're the tool that makes a first-timer say "oh, _that's_ why this is better than regular voting." We expand the pie — more people experiencing QV means more people advocating for it, studying it, building with it.
- **Who is affected:** Poll creators who want better signal from group decisions but shouldn't need to teach QV first. Voters who receive a link cold and need to _get it_ in seconds. Developers who want a clean, modern open-source codebase to learn from, fork, and build their own QV experiments on.
- **Why now:** The QV ecosystem has matured — the theory is proven, real-world deployments have validated it at scale, and a growing community of researchers, builders, and advocates is pushing it forward. What the ecosystem needs next is not another tool for insiders, but a bridge to everyone else. And simultaneously, a new class of decision-makers is emerging — AI agents that need structured mechanisms to make group choices, not just autocratic model picks.

## Vision

**QV as a decision primitive — for humans today, for agents tomorrow.**

The MVP is a web app for humans: create a poll, share a link, vote on your phone. But the ambition is bigger. Quadratic voting is not a UI pattern — it's a _mechanism_. The math doesn't care if the voter is a person or a model. It just needs a budget and a set of allocations.

Today, when multiple AI agents need to make a collective decision (which features to build, which risks to prioritize, which design to ship), they either defer to one model's judgment or do naive majority voting. Both lose the signal that QV captures: intensity of preference. A PM agent that strongly believes in a feature should be able to _spend more_ on that conviction — the same way a human voter does.

So the project has two layers:

1. **Now (MVP):** The best QV experience for humans who've never heard of quadratic voting
2. **Next:** QV as a headless decision primitive that agents can call — creating polls, casting votes, and aggregating preferences programmatically

The MVP's API-first architecture is deliberate. Every human action (create, vote, view results) goes through the same API endpoints that an agent would use. We're building the interface and the infrastructure at the same time.

## High Level Approach

Build the QV tool that doesn't exist yet in the ecosystem: **the one designed entirely for the person who's never heard of quadratic voting.** Zero-friction — no sign-up, no login, no wallet. Share a link, vote on your phone, understand the mechanism by _using_ it.

We use the existing Next.js 15 + Supabase stack (already set up with DB schema, QV math library, and test infrastructure). The MVP covers the full loop: create → share → vote → results. We ship when a poll creator can go from idea to results without touching documentation.

**Our design philosophy — what makes this different in the ecosystem:**

- **First-timer-first** — every design decision optimizes for someone encountering QV for the first time, not for power users or governance experts
- **Mobile-native** — poll links travel through Slack, WhatsApp, iMessage. The voting experience must work on a phone, one-handed, on a commute
- **Zero-barrier** — no account, no wallet, no setup. The link IS the product
- **Teach by doing** — the interface itself is the QV explainer. You learn the cost curve by watching your budget bar react as you vote

### Narrative

**Maria (Poll Creator):** Maria is a product lead at a 40-person startup. Her team of 12 needs to prioritize 8 feature ideas for Q2. She's used dot-voting before but everyone votes for everything — no signal. She finds Quadratic Vote, types her 8 options, sets 100 credits per voter, and shares the link in Slack. Two minutes of setup, zero explanation needed because the voting page teaches QV inline. Results come back in an hour with clear prioritization — the team's two must-haves stand out because people spent real credits on them.

**Jake (Voter):** Jake gets Maria's link on his phone during his commute. He's never heard of quadratic voting. The page loads instantly, a brief tooltip explains "you have 100 credits — votes cost more the more you concentrate them." He sees 8 options with +/- buttons and a budget bar. He taps +3 on the feature he cares most about, watches the cost jump from 4 to 9 credits, and _gets it_. He spreads his remaining credits across 4 other options and submits. Total time: 90 seconds.

**Priya (Developer):** Priya finds the repo on GitHub while researching mechanism design. She clones it, runs `npm install && npm run dev`, and has it running locally in under 5 minutes. The code is TypeScript, well-structured, and the QV math has 12 unit tests. She forks it for her student council's elections.

## Goals

1. **A voter can go from link → understanding QV → submitting votes in under 2 minutes on mobile** — this is the north star metric. If we nail this, we've built something no other tool in the ecosystem offers.
2. **A poll creator can go from idea → shareable link in under 2 minutes** — no sign-up, no config beyond title + options
3. **Results clearly surface intensity of preference** — make visible the signal that traditional polling loses
4. **Expand the QV ecosystem** — a clean, forkable, open-source codebase that developers can learn from, build on, and adapt for their own QV experiments
5. **Ship the smallest complete loop** — create, vote, results. Nothing more until this works perfectly.

## Non-goals

1. **User authentication / accounts** — adds friction, not needed for MVP. Voters are identified by anonymous cookie tokens. Poll creators get a secret admin URL.
2. **Real-time updates / WebSockets** — results update on page load, not live. Adds complexity with minimal value for async voting.
3. **Advanced analytics** — no per-voter breakdowns, no statistical analysis, no CSV export. Just clear aggregate results.
4. **Integrations** — no Slack bot, no API for third parties, no embed widget. Share a link.
5. **Custom branding / white-labeling** — one look, one brand.
6. **Email notifications** — no email collection, no reminders. The link is the distribution mechanism.
7. **Multi-round voting or runoffs** — single round only.
8. **Landing page interactive demo** — important but ships after MVP. The MVP is the functional voting loop.

---

# Solution Alignment

## Key Features

### Plan of record (MVP)

**1. Poll Creation Page** `(/create)`

- Title (required), description (optional)
- Add 2–20 options (text labels, reorderable)
- Credits per voter (default 100, configurable: 25, 50, 100, 150, 200)
- Submit → receive shareable voter link + secret admin link
- No sign-up, no auth. Admin link is the only way to manage the poll.

**2. Voting Page** `(/poll/[id])`

- Mobile-first layout: options as cards, each with +/- vote buttons
- **Budget bar** at the top — real-time animated bar showing credits spent / total
- **Per-option cost display** — current votes, credits spent, and cost of the _next_ vote
- **First-time QV tooltip** — brief, dismissible walkthrough on first visit explaining credits and quadratic cost
- **Leftover credits handling** — when remaining credits can't buy another vote on any option, show a clear message ("You've used 97 of 100 credits — not enough for another vote on any option")
- Cookie-based voter identity — one vote submission per browser
- Negative votes (against) — voters can subtract votes too, spending the same quadratic cost
- Submit button with confirmation
- Already-voted state: show a "You've already voted" message with their allocation summary

**3. Results Page** `(/poll/[id]/results)`

- Accessible to anyone with the poll link (not just admin)
- Bar chart showing net votes per option, sorted by total
- Total voters count displayed prominently
- **Small group note** — if fewer than 10 voters, show: "Quadratic voting works best with larger groups. With fewer voters, individual allocations have more impact."
- Credits utilization summary (average % of credits used)

**4. Admin Page** `(/poll/[id]/admin/[token])`

- Everything on the results page, plus:
- Close/reopen poll
- Poll status (open/closed, voter count, creation date)
- Shareable voter link (copy button)

**5. Core Infrastructure**

- API routes: `POST /api/polls` (create), `GET /api/polls/[id]` (read), `POST /api/polls/[id]/vote` (submit votes), `GET /api/polls/[id]/results` (results), `PATCH /api/polls/[id]` (admin: close/reopen)
- Zod validation on all API inputs
- QV math library (already built, 12 unit tests passing)
- Drizzle ORM with existing schema (polls, options, votes)
- Error handling: network failures, invalid poll ID, closed poll, double-vote attempt, budget exceeded

### Future considerations (not MVP)

**Near-term (UI enhancements):**

- **Interactive landing page demo** — "Budget a City" scenario teaching QV in 30 seconds (Finding 2)
- **Email-verified voting** — optional, creator can require email to reduce Sybil attacks (Finding 7)
- **Poll expiration** — auto-close after a date/time (schema already has `closesAt` column)
- **Results sharing** — social cards, shareable result snapshots
- **Embed mode** — `<iframe>` for embedding in Notion, blogs, etc.
- **CSV export** — aggregate results download
- **Dark mode**

**Longer-term (QV for agents):**

- **Agent-as-creator** — an AI agent (Claude, GPT, custom) can call our API to create a poll and distribute voter links as part of a larger workflow. Example: a PM agent identifies 8 candidate features, creates a QV poll, and shares it with the team — no human touches the creation UI.
- **Agent-as-voter** — agents themselves participate in the vote. A product manager agent, a designer agent, an engineer agent, and a QA agent each get a credit budget and vote based on their role's priorities. The QV mechanism aggregates their preferences the same way it would for humans — intensity of preference still matters, and the quadratic cost prevents any single perspective from dominating.
- **Headless QV** — a pure API / SDK mode with no UI at all. QV becomes a decision primitive that any agent orchestration system can plug into. The math doesn't care if the voter is a human or a model — it just needs a budget and a set of allocations.

This is not a gimmick. Agent decision-making today is either autocratic (one model picks) or naive (majority vote across models). QV gives multi-agent systems the same benefit it gives human groups: a way to express _how much_ each perspective matters, not just _which_ option wins. The mechanism is interface-agnostic — and the MVP's clean API-first architecture deliberately leaves this door open.

## Key Flows

### Creator Flow

```
Landing Page → "Create a Poll" button
    ↓
Create Page (/create)
    → Enter title
    → Add options (2-20)
    → Set credits per voter (default 100)
    → Submit
    ↓
Success Modal
    → Shows voter link (copy to clipboard)
    → Shows admin link (copy to clipboard)
    → Warning: "Save your admin link — it's the only way to manage this poll"
    ↓
Creator shares voter link via Slack / WhatsApp / email
```

### Voter Flow

```
Tap link on phone → Voting Page (/poll/[id])
    ↓
First visit: tooltip walkthrough (3 steps, dismissible)
    → "You have 100 credits to spend"
    → "Votes cost more the more you concentrate them"
    → "1 vote = 1 credit, 2 votes = 4, 3 votes = 9..."
    ↓
Allocate credits across options
    → +/- buttons per option
    → Budget bar updates in real-time
    → Each card shows: votes, cost, next-vote cost
    → Leftover credits message when applicable
    ↓
Submit → Confirmation dialog → POST /api/polls/[id]/vote
    ↓
Redirect to Results Page (/poll/[id]/results)
    → See how their votes compare to the group
```

### Admin Flow

```
Visit admin link (/poll/[id]/admin/[token])
    ↓
See results + admin controls
    → Close/reopen poll
    → Copy voter link
    → See voter count and poll status
```

## Key Logic

### QV Math Rules

- Cost of N votes on a single option = N² credits
- Negative votes cost the same: (-3 votes)² = 9 credits
- Total credits spent across all options must be ≤ credits_per_voter
- Budget validation happens both client-side (instant feedback) and server-side (authoritative)
- Existing math in `src/lib/quadratic.ts` — `calculateCost()`, `calculateMaxVotes()`, `validateBudget()`

### Vote Submission Rules

- One submission per voter per poll (identified by cookie `voter_id`)
- All votes for all options submitted atomically in a single POST
- Server validates: poll exists, poll is open, voter hasn't already voted, total credits ≤ budget
- Votes stored per-option (one row per option per voter in the `votes` table)
- If a voter doesn't vote on an option, no row is created (0 votes = no row)

### Edge Cases

- **Poll not found** → 404 page with "This poll doesn't exist or has been removed"
- **Poll closed** → Show results with "This poll is closed" banner. No voting controls.
- **Already voted** → Show their allocation summary + link to results. No re-voting in MVP.
- **Budget exceeded (client)** → Disable + button, show "Not enough credits" on the option card
- **Budget exceeded (server)** → 400 error with clear message, don't save partial votes
- **Zero votes submitted** → Allow it. A blank ballot is a valid expression (abstention).
- **All credits on one option** → Allow it. This is a legitimate use of QV (strong preference signal).
- **Cookies disabled** → Show a message: "Cookies are required to track your vote. Please enable cookies and refresh."
- **Admin link leaked** → Risk accepted for MVP. Admin link is a secret URL token (CUID2, ~24 chars). Future: add admin PIN.

### Non-functional Requirements

- **Performance:** Voting page loads in < 2s on 3G. No heavy JS bundles. Server Components where possible.
- **Accessibility:** Keyboard navigable, screen reader compatible, WCAG 2.1 AA contrast. +/- buttons have aria-labels.
- **Mobile:** All flows work on 375px viewport. Touch targets ≥ 44px. Budget bar is thumb-reachable.
- **Security:** Zod validation on all inputs. No SQL injection (Drizzle ORM). Rate limiting on vote submission (future, not MVP). Admin token is CUID2 (unguessable).
- **SEO:** Poll pages have proper meta tags (title, description) for link previews in Slack/WhatsApp.

---

# Development and Launch Planning

## Key Milestones

| Milestone                   | Description                                                                | Dependencies     |
| --------------------------- | -------------------------------------------------------------------------- | ---------------- |
| **M1: API Routes**          | CRUD for polls, vote submission, results aggregation                       | DB schema (done) |
| **M2: Poll Creation UI**    | Create page with form, success modal with links                            | M1               |
| **M3: Voting UI**           | Mobile-first voting page with budget bar, cost display, tooltips           | M1               |
| **M4: Results UI**          | Results page with bar chart, voter count, small-group note                 | M1               |
| **M5: Admin UI**            | Admin page with close/reopen, status display                               | M1, M4           |
| **M6: Polish & Edge Cases** | Error states, loading states, already-voted, closed-poll, cookies-disabled | M2-M5            |
| **M7: Testing & Ship**      | E2E tests (Playwright), manual QA pass, deploy to Vercel                   | M6               |

## Checklist

- [ ] API routes implemented and tested (Vitest)
- [ ] Poll creation form with validation
- [ ] Voting UI with real-time budget bar
- [ ] Per-option cost display (current + next vote cost)
- [ ] First-time QV tooltip walkthrough
- [ ] Leftover credits messaging
- [ ] Results page with bar chart
- [ ] Small-group informational note (< 10 voters)
- [ ] Admin page with close/reopen
- [ ] Cookie-based voter identity
- [ ] Already-voted detection and messaging
- [ ] Closed-poll state
- [ ] Mobile responsive (375px+)
- [ ] Accessible (keyboard nav, screen reader, WCAG 2.1 AA)
- [ ] TypeScript strict — no `any`
- [ ] Zod validation on all API inputs
- [ ] Error states handled (404, closed, double-vote, budget exceeded, cookies disabled)
- [ ] Loading states for async operations
- [ ] Meta tags for link previews (Slack, WhatsApp, iMessage)
- [ ] Unit tests for API routes (Vitest)
- [ ] E2E tests for full flows (Playwright)
- [ ] Deployed to Vercel and working on production Supabase

---

## Risks

| Risk                                                                     | Likelihood | Impact | Mitigation                                                                                                                                                                                        |
| ------------------------------------------------------------------------ | ---------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cookie-based identity is trivially bypassable (incognito, clear cookies) | High       | Medium | Accepted for MVP. Future: email verification option. Low stakes for most use cases (team polls, classroom).                                                                                       |
| Admin link gets shared accidentally                                      | Medium     | Medium | Clear warning on creation. CUID2 tokens are unguessable. Future: admin PIN.                                                                                                                       |
| QV is confusing despite inline education                                 | Medium     | High   | Tooltip walkthrough + visual cost curve + budget bar. Test with real users. Iterate on copy. Learn from what's worked in other QV tools (Civicbase's budget bar, Vote Squared's dollar metaphor). |
| Small-group results feel unfair                                          | Medium     | Low    | Informational note. QV is still better than 1-person-1-vote for preference intensity.                                                                                                             |
| Scope creep into landing page / demo / auth                              | High       | Medium | This PRD explicitly lists non-goals. Refer back to it. Ship the loop first.                                                                                                                       |

---

## Appendix

### Research References

- **Key findings:** `docs/pm/research/key-findings.md` — 7 findings that directly inform this PRD
- **Competitive analysis:** `docs/pm/research/competitive-analysis.md` — 10 tools analyzed
- **Academic foundations:** `docs/pm/research/qv-implementations-and-theory.md` — Colorado, Gitcoin, Taiwan, Optimism case studies
- **Sources:** `docs/pm/research/sources.md` — all research URLs

### Existing Implementation

- **DB schema:** `src/db/schema.ts` — polls, options, votes tables (migrated)
- **QV math:** `src/lib/quadratic.ts` — `calculateCost()`, `calculateMaxVotes()`, `validateBudget()` with 12 passing unit tests
- **UI primitives:** shadcn/ui components installed (Button, Card, Input, Label, Slider, Dialog, Tooltip, etc.)
