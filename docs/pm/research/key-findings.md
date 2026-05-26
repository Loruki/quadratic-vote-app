# Key Research Findings

These findings are distilled from our competitive analysis (10 tools), academic research, and real-world case studies (Colorado, Gitcoin, Taiwan, Optimism). Each finding directly informs a product decision.

---

## Finding 1: No QV tool is mobile-first

**Evidence:**

- Every tool we analyzed (RxC QV, Snapshot, Gitcoin, Civicbase, Anish QV Dashboard, QV Lite) has poor or nonexistent mobile support
- RxC QV — the most widely used civic QV tool — was flagged by its own community in a 2022 poll as having major UI/UX gaps, including mobile
- Snapshot has "moderate" mobile support but requires a crypto wallet, making the mobile flow clunky

**Why this matters:**

- Most poll links will be shared via Slack, WhatsApp, iMessage, or email — all primarily consumed on phones
- A voter receives a link on their phone, taps it, and needs to vote immediately. If the UI doesn't work on mobile, they bounce
- This is the single biggest gap in the market. Zero competitors serve this use case well

**Product decision:** Design mobile-first. Every component (credit allocation, budget bar, results) must work on a 375px viewport before we optimize for desktop. Touch targets must be thumb-friendly. The voting flow should be completable one-handed.

---

## Finding 2: No tool teaches QV inline — everyone assumes prior knowledge

**Evidence:**

- RxC QV shows a brief text explanation but no interactive tutorial
- Snapshot assumes users already understand QV (it's one of many voting "strategies" in a dropdown)
- Gitcoin has great documentation but it lives on a separate blog post, not in the voting flow
- The best interactive explainer found (wtfisqf.com) is for Quadratic Funding, not QV, and exists as a standalone site — not embedded in any tool
- Tim Daub's 2022 UX critique specifically calls out that "the formula runs backward from how humans budget" — users think in credits spent, not votes purchased

**Why this matters:**

- 100% of voters encountering our tool will be first-timers. Unlike Snapshot (crypto-native audience who self-selects into governance), our audience is anyone who receives a link
- The 2017 "QV in the Wild" study found that QV respondents spent 30% more time engaging — partly because the mechanism itself requires explanation
- If voters don't understand the cost curve, they allocate suboptimally and feel frustrated, undermining the entire point of QV

**Product decision:** Build an interactive "Budget a City" demo on the landing page that teaches QV in 30 seconds through hands-on experience. On the voting page itself, show a first-time tooltip walkthrough explaining credits and cost. Always display the cost curve visually, not just numerically.

---

## Finding 3: Real-time marginal cost feedback is critical

**Evidence:**

- Civicbase has the best credit visualization: a dynamic budget bar that reacts in real-time as users allocate. This is the most effective feedback mechanism found across all tools
- Most tools only show the total cost after the fact, not the marginal cost of the next vote
- Tim Daub's UX critique identifies that "the formula runs backward" — users don't naturally think "I want 3 votes costing 9 credits." They think "I have 20 credits left, what can I do with them?"
- The CHI 2025 research paper on QV interfaces found that cognitive load is a primary barrier

**Why this matters:**

- The quadratic cost curve is counterintuitive. 3 votes costs 9 credits, but 4 votes costs 16 — that jump from 9 to 16 surprises people
- Without real-time feedback, users overshoot their budget and have to backtrack, creating frustration
- The "aha moment" of QV — understanding that concentrating votes is expensive — only lands if the cost is visible and visceral

**Product decision:** Every vote option card must show: (1) current votes, (2) current cost, and (3) what the NEXT vote would cost. The budget bar must animate in real-time. When approaching the budget limit, the UI should make the acceleration of cost visually obvious (color change, bar speed, pulse).

---

## Finding 4: Leftover credits is a known UX bug with no good solution yet

**Evidence:**

- Tim Daub explicitly documents this: "whole-number vote math means some credits can never be spent." Example: 7 credits remaining, but √7 ≈ 2.65, so you can't buy another vote on any option that already has 2+ votes
- No tool we analyzed handles this gracefully — most just leave credits unspent with no explanation
- The 2017 "QV in the Wild" study noted that revision behavior was high (15 voting actions per person vs 11 expected), partly because users were trying to "use up" remaining credits

**Why this matters:**

- Leftover credits feel like wasted potential. Users who care enough to vote will be bothered by "3 credits remaining" with no way to spend them
- It creates a false sense of suboptimality — "did I do this wrong?"
- It's a source of cognitive friction in an already cognitively demanding interface

**Product decision:** Show remaining credits prominently with a clear message when they can't be spent further (e.g., "3 credits remaining — not enough for another vote on any option"). Consider showing a "You used 97 of 100 credits" completion indicator. Optionally, show which options could still receive a vote with the remaining budget.

---

## Finding 5: The dollar/currency metaphor is the most intuitive framing

**Evidence:**

- Nathan Braun's "Vote Squared" tool uses a $25 budget where "first vote costs $1, second costs $3 more" — this is the most cognitively accessible QV explanation found across all 10 tools we analyzed
- Abstract "voice credits" (used by RxC, Snapshot, academic papers) consistently confuse users — the word "credit" has no intuitive unit
- The 2017 empirical study found that "highly positive" comments about QV outrated "highly negative" 3:1, but the negative comments disproportionately cited confusion about the credit system
- Gitcoin's QF uses real dollars, which makes the quadratic effect immediately tangible ("my $1 is worth more when 99 others also give $1")

**Why this matters:**

- The mechanism is already hard to understand. The vocabulary shouldn't add another layer of abstraction
- "Credits" is meaningless without context. "Points" is slightly better. But a concrete metaphor (budget, coins, tokens with a visual) anchors understanding
- The framing choice propagates through every piece of UI copy, tooltip, and explanation

**Product decision:** Use "credits" as the term (it's the academic standard and most tools use it) but always pair it with visual metaphors — a budget bar that looks like a spending meter, cost displayed as "N votes = N² credits spent", and the landing page demo using a concrete scenario ("your city has 100 credits to spend on 5 projects"). Never show credits as just a number — always show them in context of total budget.

---

## Finding 6: Small groups amplify QV's weaknesses

**Evidence:**

- Optimism's RetroPGF started with QV in Round 1 but switched to mean (Round 2) then median (Round 3) aggregation specifically because small voter pools made results highly sensitive to individual outlier allocations
- The Lalley-Weyl efficiency proof formally requires large N. With fewer than ~20 voters, the theoretical guarantees weaken significantly
- Colorado worked well partly because the caucuses had 30-40+ members. The mechanism was never tested with very small groups (5-8 people)

**Why this matters:**

- Many of our target use cases involve small groups: a team of 8 prioritizing features, a class of 15 students, a co-op of 12 members
- If one person in a group of 8 dumps all their credits on one option, it can dominate results in a way that feels unfair to others
- We shouldn't overpromise QV's fairness properties for small groups

**Product decision:** Don't hide this limitation. For polls with fewer than ~10 voters, consider showing a note: "Quadratic voting works best with larger groups. With fewer voters, individual allocations have more impact on results." In the results view, show voter count prominently so results are interpreted in context. For the MVP, this is informational only — we don't need to change the mechanism.

---

## Finding 7: Anonymity improves honesty but creates accountability tension

**Evidence:**

- Colorado's QV experiment was halted by court order (January 2024) specifically because anonymous ballots violated the state's open meetings transparency law
- The mechanism design theory assumes anonymous voting — it prevents strategic gaming (voting based on what you think others will do) and social pressure
- However, in organizational contexts (teams, companies), some level of accountability is expected
- Snapshot offers both transparent and shielded voting options, letting the DAO creator choose

**Why this matters:**

- Our anonymous cookie-based voter identity is a feature, not a bug — it enables honest preference revelation
- But poll creators in organizational settings may want to know who voted (for accountability) or may want to prevent the same person from voting in multiple browsers
- The tension between anonymity and accountability is fundamental to the mechanism, not a bug to fix

**Product decision:** For MVP, votes are anonymous by default (cookie-based voter ID). The admin results page shows aggregate data, not per-voter breakdowns. This is the simplest and most honest approach. Future consideration: let poll creators optionally require email verification (increases accountability, reduces Sybil risk, but reduces anonymity). Document this trade-off clearly.

---

## Summary: Research → Product Decision Map

| Finding                          | Key Evidence                                   | Product Decision                            |
| -------------------------------- | ---------------------------------------------- | ------------------------------------------- |
| No mobile-first QV tool exists   | 0/10 tools are mobile-first                    | Design mobile-first, thumb-friendly         |
| No inline QV education           | 0/10 tools teach QV in the voting flow         | Interactive demo + first-time tooltips      |
| Marginal cost feedback missing   | Civicbase only tool with dynamic budget bar    | Real-time cost preview on every interaction |
| Leftover credits confuse users   | Documented UX bug, no tool handles it          | Clear messaging when credits can't be spent |
| Currency metaphor most intuitive | Vote Squared's $-framing rated most accessible | Visual budget metaphor, concrete scenarios  |
| Small groups amplify outliers    | Optimism abandoned QV for this reason          | Informational note for small polls          |
| Anonymity vs accountability      | Colorado halted by court                       | Anonymous by default, document trade-off    |
