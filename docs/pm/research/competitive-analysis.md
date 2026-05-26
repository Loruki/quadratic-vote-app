# Competitive Analysis: Quadratic Voting Tools

**Research Date:** 2026-03-01
**Purpose:** Inform product strategy and UX design for our quadratic voting application

---

## Table of Contents

1. [Existing QV Tools Overview](#1-existing-qv-tools-overview)
2. [Tool-by-Tool Analysis](#2-tool-by-tool-analysis)
3. [UX Best Practices for Voting Interfaces](#3-ux-best-practices-for-voting-interfaces)
4. [Gap Analysis](#4-gap-analysis)
5. [Sources](#5-sources)

---

## 1. Existing QV Tools Overview

| Tool                      | Type                       | Open Source    | Target Audience                       | Primary Use Case                  |
| ------------------------- | -------------------------- | -------------- | ------------------------------------- | --------------------------------- |
| RxC QV                    | Standalone web app         | Yes (GitHub)   | Event organizers, civic groups        | Event-based QV polls              |
| RxC Voice                 | Full governance platform   | Yes (GitHub)   | Communities, DAOs                     | Multi-stage democratic governance |
| Snapshot                  | Web3 governance platform   | Yes            | DAOs, DeFi protocols, NFT communities | Gasless on-chain governance       |
| Gitcoin Grants            | Quadratic funding platform | Yes (partial)  | Web3 ecosystem, public goods funders  | Quadratic funding allocation      |
| Pol.is                    | Opinion aggregation        | Yes            | Governments, researchers, communities | Large-scale deliberation          |
| Civicbase                 | Survey research platform   | Yes (GitHub)   | Researchers, policy makers            | QVSR academic/civic surveys       |
| Mirror $WRITE Race        | Creative community         | No             | Writers, Web3 creators                | Community curation                |
| Anish Agnihotri QV        | Dashboard / demo app       | Yes (AGPL-3.0) | Developers, communities               | Lightweight QV events             |
| Nathan Braun Vote Squared | Simple personal tool       | Unknown        | Small groups, friends                 | Informal group decisions          |
| QV Lite (g0v)             | Lightweight tool           | Yes            | Event organizers                      | Simple QV polls                   |

---

## 2. Tool-by-Tool Analysis

### 2.1 RxC QV (quadraticvote.radicalxchange.org)

**What it looks like (UI/UX)**

- Clean, minimalist aesthetic with dark header and light cream background
- RadicalxChange branding with yellow accent colors (#edff38)
- Two primary entry points: "Set up an event" and "Place your votes" via secret code
- Vote intensity expressed with interactive animated square blocks that can be grouped and spent
- Table of contents navigation for polls with many ballot items
- Positions itself as "the mathematically optimal way to vote in a democratic community"

**Key Features**

- Event creation with email/link-based invite distribution
- Secret-code-based voter access (no account required)
- Real-time vote tallying
- Public API for building custom interfaces on top of the platform
- Admin dashboard for result analysis
- Supports many ballot items with scroll navigation

**Strengths**

- Extremely low friction for voters (no account, just a link+code)
- Well-documented, backed by credible academic/civic organization
- API-first design allows custom integrations
- Proven in real-world civic deployments (Colorado legislature, NYC)
- Fully open source

**Weaknesses**

- UI is dated and not mobile-first
- Limited onboarding/explanation of QV mechanics for new voters
- No identity verification or Sybil resistance for open elections
- Community noted in 2022 that UI/UX needs significant improvement for self-service event setup
- Last significant release (RxC Voice v2.0-beta) was March 2022 — appears under-maintained

**Target Audience**
Civic organizations, democratic experimenters, conference organizers, academic researchers

**Open Source:** Yes — [RadicalxChange/rxc-voice](https://github.com/RadicalxChange/rxc-voice), AGPL licensed

---

### 2.2 RxC Voice (voice.radicalxchange.org)

**What it looks like (UI/UX)**

- Multi-stage pipeline: Delegation → Deliberation (Pol.is) → Election (QV)
- TypeScript/SCSS frontend with Django backend, PostgreSQL database
- Admin-driven workflow; not designed for self-service by general public
- Integrates Pol.is conversation embeds for the deliberation stage

**Key Features**

- **Delegation Stage:** Each participant starts with 99 voice credits and can delegate credits to others, with a quadratic matching fund amplifying the delegations
- **Deliberation Stage:** Embedded Pol.is conversations for proposal generation and discussion
- **Election Stage:** Full quadratic vote on a ballot derived from the deliberation
- Voice credits visualized as animated square block graphics
- Admin panel for managing the full process

**Strengths**

- Only tool that integrates the full democratic pipeline (delegate → deliberate → vote)
- Theoretically grounded in plurality/quadratic mechanisms
- Strong academic credibility

**Weaknesses**

- Extremely complex to set up; not self-service
- Requires admin expertise
- Last tagged release: March 2022 (v2.0-beta); development activity unclear
- UI/UX explicitly identified by the RxC community itself as a major gap
- Three-stage process creates high drop-off risk

**Target Audience**
Organizations with technical/organizational capacity to run structured governance processes; primarily RadicalxChange's own community experiments

**Open Source:** Yes — TypeScript + Python/Django, Docker-based

---

### 2.3 Snapshot (snapshot.org)

**What it looks like (UI/UX)**

- Clean, professional web3-native interface
- Proposal list view per DAO "space," with individual proposal pages
- For QV proposals: voters distribute their token-weighted voting power across multiple choices using numeric inputs or sliders
- Results shown as a bar chart per choice, with vote percentages
- No gas fees (off-chain signatures only)
- Wallet-connect authentication (MetaMask, WalletConnect, etc.)

**Key Features**

- Multiple voting types: single choice, approval, ranked choice, quadratic, weighted, basic
- QV formula: square root of each voter's contribution per choice, summed per option, then squared — emphasizes number of unique voters over whale dominance
- Space customization: voting power strategies (token holdings, NFT ownership, etc.)
- Proposal and vote validation (allowlists, Gitcoin Passport integration for Sybil resistance)
- Delegation of voting power
- Gasless (off-chain signatures stored on IPFS/Arweave)
- Open API and extensive ecosystem integrations

**Strengths**

- Best-in-class production-quality UI for Web3 governance
- Largest network effect in DAO governance
- Sybil resistance via Gitcoin Passport (now Human Passport) integration
- Highly configurable voting power calculation
- No gas costs removes major UX friction
- Active development and large engineering team

**Weaknesses**

- Fundamentally crypto-native: requires a Web3 wallet, excluding non-crypto audiences
- Voting power tied to token holdings — even QV cannot fully escape plutocratic dynamics if tokens are concentrated
- QV implementation still susceptible to wallet-splitting Sybil attacks without Passport
- No interactive education about how QV credits work
- Results display is straightforward bar chart — no nuanced preference visualization
- Not mobile-optimized for the voting workflow

**Target Audience**
DAOs, DeFi protocols, NFT communities, crypto-native organizations

**Open Source:** Yes — [snapshot-labs/snapshot](https://github.com/snapshot-labs/snapshot)

---

### 2.4 Gitcoin Grants Stack (grants.gitcoin.co)

**What it looks like (UI/UX)**

- E-commerce-style interface: browse projects, add to cart, checkout
- Grant round pages with project listings, search, and category filters
- Individual project pages with descriptions, team info, and funding progress
- Cart with multi-round, multi-chain donation checkout (introduced GG18)
- Donation amount inputs per project with real-time matching estimate
- BulkCheckout: single blockchain transaction for all grants in cart
- Gitcoin Passport integration for identity verification before donations count toward matching

**Key Features**

- Quadratic Funding (not pure QV): matching pool distribution uses QF algorithm — number of unique donors matters more than donation size
- Multi-round checkout: donate to projects across different rounds and chains in one cart/transaction
- Human Passport (formerly Gitcoin Passport): stamp-based identity verification to qualify for QF matching weight
- Grants Stack: open-source infrastructure for running your own QF rounds
- Analytics: real-time matching estimates as donors contribute
- Integration with Giveth and other platforms for round execution

**Strengths**

- Most battle-tested QF platform with hundreds of millions distributed
- Excellent "shopping cart" metaphor that maps naturally to donation behavior
- Real-time matching estimate is a compelling UX feature that shows donors their impact
- Grants Stack enables third-party round operators
- Strong Sybil-resistance via Human Passport

**Weaknesses**

- Quadratic Funding ≠ Quadratic Voting — donors don't allocate a fixed credit budget; they donate real money
- Significant friction: requires crypto wallet + Human Passport verification + understanding of gas/chains
- Human Passport UX is complex (aggregating stamps from many services)
- Donor friction explicitly identified as a top problem in their 2024 strategy
- Crypto-only; excludes non-Web3 audiences entirely
- The "matching estimate" is an approximation, final amounts differ at round close

**Target Audience**
Web3 ecosystem funders, public goods supporters, open-source developers seeking funding

**Open Source:** Grants Stack is open source — [gitcoinco/grants-stack](https://github.com/gitcoinco/grants-stack)

---

### 2.5 Pol.is (pol.is / compdemocracy.org)

**What it looks like (UI/UX)**

- Participants see one statement at a time (<140 characters) and click Agree / Disagree / Pass
- Real-time bee-swarm visualization: opinion groups visible as clusters on a 2D plane, consensus pools to one side, divisiveness to another
- Participants can submit new statements
- No threading or direct replies — prevents flame wars
- Anonymous participation by default
- Clean, minimal interface optimized for statement-by-statement evaluation

**Key Features**

- Real-time clustering algorithm groups participants into "opinion tribes" as votes accumulate
- Surfaces "consensus statements" — things most groups agree on — which is useful for finding common ground
- Scales to very large groups (thousands of participants)
- Embedded in other platforms (used by RxC Voice for its deliberation stage)
- API available
- Open source

**Strengths**

- Uniquely powerful for large-scale opinion aggregation and surfacing consensus
- No toxic reply threads; anonymous voting reduces social pressure
- Real-time visualization is genuinely insightful and compelling
- Proven in high-stakes civic contexts (Taiwan Uber regulation, vTaiwan, EU citizens' assemblies)
- 10x more people vote on statements than submit them — very high engagement ratio

**Weaknesses**

- Not a QV tool per se — it's an opinion clustering tool, not a resource allocation/preference intensity tool
- Binary agree/disagree/pass lacks nuance of QV
- UI is dated and not polished by consumer standards
- Statement creation quality depends entirely on participants
- No built-in credit allocation or preference intensity measurement
- Can produce paradoxical results if clusters are artificially created

**Target Audience**
Governments, civic tech organizations, researchers, large communities needing structured deliberation

**Open Source:** Yes — [compdemocracy/polis](https://github.com/compdemocracy/polis)

---

### 2.6 Civicbase (civicbase.io)

**What it looks like (UI/UX)**

- Survey-style interface: voters see one item at a time or a list
- Credit bar at top of page moves dynamically as credits are allocated
- Each item has a scale of 0–7 for agree/disagree votes (bi-directional)
- Radial/circle design to graphically communicate intensity of preference
- Green (agreement) and red (disagreement) color coding reinforces allocation direction
- Results table visible to researchers in real-time

**Key Features**

- Supports QVSR (Quadratic Voting for Survey Research), Conjoint, and Likert survey methods
- Configurable: questions can be randomized, survey can allow multiple responses, participants can self-identify
- Optional audio recorder embedded in survey page for qualitative feedback
- Researcher analytics dashboard with real-time aggregated results
- Export capabilities for research analysis
- Open source React component library (civicbase/quadratic-vote on GitHub)

**Strengths**

- Best-designed credit visualization among all tools (dynamic bar)
- Bi-directional voting (agree/disagree) is unique and expressive
- Designed for research rigor: randomization, controls, multi-methodology
- Embedded audio for mixed-method research is genuinely novel
- Academic backing: paper in AI Magazine (2023) confirming QVSR outperforms Likert in predictive power

**Weaknesses**

- Designed primarily for survey/research contexts, not general governance
- Limited self-service for non-researchers
- No identity verification or Sybil resistance
- Small community, limited ecosystem

**Target Audience**
Academic researchers, policy analysts, municipalities doing citizen engagement surveys

**Open Source:** Yes — [civicbase/quadratic-vote](https://github.com/civicbase/quadratic-vote) (React component library)

---

### 2.7 Mirror $WRITE Race (mirror.xyz/race) — Archived / Historical

**What it looks like (UI/UX)**

- Twitter-authenticated leaderboard showing candidates competing for votes
- Voters allocate token-based votes to writers they want on Mirror
- Scoring tag indicates whether round uses quadratic or cumulative scoring
- Rounds run every 2 hours; top 10 receive $WRITE tokens airdropped automatically

**Key Features**

- Web3-native: token-based voting with quadratic weighting to balance whale influence
- Short rounds (2 hours) create urgency
- Social integration: prompts ask "What will you write about?" to help voters evaluate candidates
- Leaderboard with live rank updates

**Strengths**

- Creative and engaging use of QV for community curation
- Leaderboard with scoring-type label is a clear UX win
- Quadratic weighting successfully reduced whale dominance vs. prior linear system

**Weaknesses**

- Crypto-gated (requires ETH wallet and tokens)
- No longer actively deployed as of 2023-2024
- Not self-service; built for Mirror's specific use case

**Target Audience**
Web3 writers and content creators

**Open Source:** Partial — [m1guelpf/write-race](https://github.com/m1guelpf/write-race)

---

### 2.8 Anish Agnihotri QV Dashboard (github.com/Anish-Agnihotri/quadratic-voting)

**What it looks like (UI/UX)**

- NextJS web application with clean dashboard layout
- Real-time results display showing votes per option and percentage of credits allocated
- Event management via secret UUID links (no accounts required)
- Supported by Gitcoin, positioned as developer reference implementation

**Key Features**

- Event creation with unique voter URLs (event_uuid + voter_id)
- Real-time vote tallying via API
- Shows vote counts AND percentage of total credits allocated per choice
- PostgreSQL + Prisma backend, serverless Vercel deployment
- AGPL-3.0 licensed

**Strengths**

- Simple, developer-friendly codebase (100% JavaScript)
- No-account voter flow reduces friction
- Shows both votes and credit percentages (useful for transparency)
- Easy to self-host

**Weaknesses**

- Very minimal UI; not production-polished
- No built-in explanation of QV mechanics for voters
- No identity verification or Sybil resistance
- Displays votes but showing absolute credit counts would improve reproducibility (noted gap)
- Not mobile-optimized

**Target Audience**
Developers building QV features; small communities needing a quick QV tool

**Open Source:** Yes — AGPL-3.0

---

### 2.9 Nathan Braun Vote Squared (nathanbraun.com/voting)

**What it looks like (UI/UX)**

- Built with Elm frontend and GraphQL API
- Voters given a $25 budget to distribute across options using a dollar-metaphor
- First vote for any option costs $1, next costs $3 — quadratic cost made tangible via currency
- Designed for small group decisions (friends, colleagues)

**Key Features**

- Dollar-budget metaphor instead of abstract "credits" — more intuitive for general audiences
- Small-scale event management
- Hosted on a $5/month DigitalOcean droplet (signal: built for personal/small use)
- Transactional emails via Mailjet

**Strengths**

- Dollar metaphor is cognitively accessible — people understand spending money
- Very low-friction for informal group decisions
- Shows that the credit-as-currency framing significantly helps comprehension

**Weaknesses**

- Not designed to scale beyond small groups
- No Sybil resistance
- Minimal features; effectively a personal project

**Target Audience**
Small groups, friends, informal community decisions

**Open Source:** Unknown

---

## 3. UX Best Practices for Voting Interfaces

### 3.1 Explaining the Quadratic Cost

**The core challenge:** The quadratic cost formula is mathematically counter-intuitive. Users must unlearn the assumption that "more money = more votes linearly." The cost structure `credits = votes²` is backward from typical budget allocation.

**What exists today:**

| Approach                                         | Tool                       | Effectiveness                                   |
| ------------------------------------------------ | -------------------------- | ----------------------------------------------- |
| Static cost table (1→1, 2→4, 3→9...)             | Most tools                 | Low — abstract numbers don't build intuition    |
| Dollar-currency metaphor ($25 budget)            | Nathan Braun Vote Squared  | Medium — familiar framing helps                 |
| Animated square blocks (credits as visual units) | RxC Voice                  | Medium — visual but still requires explanation  |
| Interactive "try it" calculator                  | wtfisqf.com (QF explainer) | High — hands-on discovery beats passive reading |
| Radial/circle design showing intensity           | Civicbase                  | Medium — elegant but still requires orientation |
| No explanation whatsoever                        | Most GitHub demo tools     | Very low — high voter confusion                 |

**Best practice identified:** The most effective education pattern is experiential — let users manipulate a small example and observe the cost change before entering the real vote. wtfisqf.com's step-by-step interactive explainer demonstrates this principle well for QF; an analogous pattern for QV is almost entirely absent from existing tools.

**Key insight from research (CHI 2025):** Users with no QV explanation default to "satisficing" — settling for adequate vote distributions rather than optimal ones. 80% of users in text-only interfaces focused narrowly on comparing fewer options. Proper onboarding significantly changes behavior.

### 3.2 Credit Allocation UI Patterns

**Identified patterns across tools:**

| Pattern                                  | Tools Using It                         | Pros                                     | Cons                                                                   |
| ---------------------------------------- | -------------------------------------- | ---------------------------------------- | ---------------------------------------------------------------------- |
| +/- stepper buttons per option           | RxC QV, most demos                     | Precise, no motor skill required         | Slow for large vote counts; hides cost until you look                  |
| Numeric input field                      | Snapshot (token weight entry)          | Familiar, precise                        | No visual feedback on budget consumption                               |
| Dynamic budget bar                       | Civicbase                              | Excellent real-time feedback             | Requires screen real estate; not obvious what it represents            |
| Dollar metaphor inputs                   | Vote Squared                           | Intuitive for most users                 | Currency framing may be inappropriate in civic contexts                |
| Drag-and-drop (categorize then allocate) | Organize-Then-Vote (CHI 2025 research) | Reduces cognitive load for short surveys | Increases load for long surveys; novel interaction model               |
| Sliders                                  | Rarely used in QV tools                | Fast interaction                         | Imprecise; sliders degrade UX when exact values matter (NN/G guidance) |

**Research finding (CHI 2025 — "Organize, Then Vote"):** A two-phase interface where users first categorize options (Positive / Neutral / Negative) via drag-and-drop, then allocate votes within categories, reduced cognitive load (median 29.85 vs. 39.00) for short surveys. For long surveys the benefit reversed due to behavioral changes — users in the two-phase interface engaged more deeply with each option while text-interface users satisficed. No single interface pattern dominates all contexts.

**Key UX problems with credit allocation (identified by Tim Daub, 2022):**

1. Whole-number vote requirement means voters cannot always spend all their credits (7 leftover credits when 9+9 spent, since √7 ≈ 2.65). This strands credits and feels like a bug.
2. The formula `credits = votes²` is backward from how humans budget. People want to say "I have 25 credits, how many votes does that buy?" but the math runs the other direction.
3. Distinguishing "credits" from "votes" is cognitively demanding — most users conflate them.

### 3.3 Results Display Patterns

| Pattern                                          | Tools                      | Notes                                                        |
| ------------------------------------------------ | -------------------------- | ------------------------------------------------------------ |
| Sorted bar chart (votes per option)              | Snapshot, most tools       | Standard, immediately comprehensible                         |
| Real-time leaderboard with rank                  | RxC QV, Mirror $WRITE Race | Adds competitive urgency; can distort late voting behavior   |
| Credit-percentage breakdown alongside vote count | Anish Agnihotri QV         | More transparent than votes alone                            |
| Bee-swarm cluster visualization                  | Pol.is                     | Powerful for opinion clusters but hard to read quickly       |
| Per-option histogram + violin plots              | SeeQS (academic tool)      | Research-grade; not suitable for general audiences           |
| Radial intensity display                         | Civicbase                  | Elegant for survey results; may confuse governance audiences |

**Best practice:** Show both the final vote tally AND a secondary signal (credit allocation %, voter count) so the result is interpretable without doing math. Live results during voting can bias behavior — consider whether to show live results or reveal only at the end.

### 3.4 Mobile Experience

**Current state:** Almost universally poor across QV tools.

- RxC QV: Not mobile-first; scrolling many ballot items on mobile is cumbersome
- Snapshot: Responsive but wallet-connect flows are difficult on mobile browsers
- Gitcoin: Mobile experience identified as a friction point in their own retros
- Civicbase: Survey-style works better on mobile than governance tools
- Demo/personal tools (Anish, Nathan Braun, QV Lite): No stated mobile optimization

**Gap:** No existing QV tool has been designed mobile-first. Yet most civic and community voting will happen on phones. This is a significant unaddressed gap.

### 3.5 Sybil Resistance and Identity

| Tool           | Approach                                   | UX Cost                                           |
| -------------- | ------------------------------------------ | ------------------------------------------------- |
| Snapshot       | Gitcoin/Human Passport (stamp aggregation) | Medium — requires completing stamps before voting |
| Gitcoin Grants | Human Passport (stamps + onchain scores)   | High — many steps to qualify                      |
| RxC QV         | Secret code per voter (admin-distributed)  | Low — but easily shared/abused                    |
| Civicbase      | No mechanism                               | None (research controlled contexts)               |
| All others     | No mechanism                               | None                                              |

**Key finding:** No tool has solved the tension between low-friction access and Sybil resistance gracefully. Human Passport is the most sophisticated but creates significant UX friction. Secret-code systems work for controlled audiences (e.g., legislators) but break down for open internet voting.

---

## 4. Gap Analysis

### 4.1 What No Tool Does Well

**1. Contextual QV Education Embedded in the Flow**
Every tool either assumes voters understand QV or provides a static text explanation. No tool integrates an interactive, contextual micro-tutorial ("You have 25 credits. Let's see what that means before you start voting."). The wtfisqf.com interactive explainer exists for QF but nothing analogous exists as a built-in onboarding step in a QV voting interface.

**2. Mobile-First Design**
Zero existing QV tools are designed for mobile-first. This excludes the majority of real-world voters from a comfortable experience. Community-level and civic-level QV adoption requires mobile access.

**3. Non-Crypto, Non-Technical Audiences**
The tools that work well (Snapshot, Gitcoin) are crypto-gated. The tools accessible to general audiences (RxC QV, Nathan Braun) are minimal and unpolished. There is no well-designed, production-quality QV tool for non-crypto organizations (NGOs, companies, schools, community groups, co-housing, etc.).

**4. Transparent Credit Visualization During Voting**
Most tools show remaining credits but don't show what the marginal cost of the next vote will be before you click. "Your 4th vote on this item will cost 7 more credits (total: 16)" is missing from every tool. Civicbase's dynamic credit bar is the closest, but it doesn't show the lookahead.

**5. Graceful Handling of Leftover Credits**
The "stranded credits" problem (can't spend the last few credits because √remainder is not a whole number) is a known UX bug that no tool addresses gracefully. Options include: showing a "best allocation" suggestion, allowing fractional votes, or clearly explaining why credits remain.

**6. Results That Explain What Happened**
Current results screens show "who won" but not "why." A results view that shows "Option A won with 847 votes from 34 voters, using 29% of total credits allocated" gives far more insight into the election's character than a simple bar chart.

**7. Accessible, Embeddable QV**
No tool provides a polished embeddable widget (like a Typeform or Google Form equivalent) that any website/app can drop in. Civicbase has a React component library but it requires developer integration. The market for "just give me a QV poll link to share" with a quality UI remains underserved.

**8. Bi-directional Voting (Support/Oppose)**
Almost all QV tools only allow positive vote allocation. Civicbase is the exception with its 0–7 agree/disagree scale. Real community decisions often require expressing opposition, not just support ranking.

**9. Longitudinal / Recurring Voting**
No tool supports recurring QV polls (e.g., monthly community priority-setting) with history, trend lines, or comparison across rounds. Each vote is a one-off event.

**10. Post-Vote Deliberation Integration**
Only RxC Voice attempts to integrate deliberation (via Pol.is) with voting. But it requires significant organizational overhead. A lighter-weight version of "deliberate → vote → see results → discuss" in a single flow doesn't exist.

### 4.2 Opportunity Summary Table

| Gap                                    | Difficulty | Impact    | Priority |
| -------------------------------------- | ---------- | --------- | -------- |
| Mobile-first design                    | Medium     | Very High | P0       |
| Non-crypto / non-technical audience    | Low        | Very High | P0       |
| Embedded QV onboarding/education       | Medium     | High      | P1       |
| Transparent marginal cost display      | Low        | High      | P1       |
| Graceful leftover-credit handling      | Low        | Medium    | P1       |
| Embeddable / shareable poll widget     | Medium     | High      | P1       |
| Bi-directional (support/oppose) voting | Medium     | Medium    | P2       |
| Results with contextual explanations   | Low        | Medium    | P2       |
| Longitudinal / recurring polls         | High       | Medium    | P2       |
| Lightweight deliberation + vote flow   | High       | Medium    | P3       |

### 4.3 Where We Should Position

The clearest opening is **production-quality, mobile-first QV for non-crypto organizations and communities**. This means:

- No wallet required; email or OAuth login
- Plain-language credit budget framing (consider the "dollar" metaphor or clear visual representation)
- Interactive onboarding embedded before vote starts
- Real-time credit visualization with marginal cost preview
- Clean, shareable poll links with no-account voter access
- Results that tell a story, not just show a bar chart
- Sybil resistance appropriate to context (not zero, not crypto-passport complexity — consider email verification, rate limiting, admin-managed voter lists)

The secondary opportunity is **becoming the best open-source reference implementation** — a quality that draws developer adoption and civic-tech credibility that existing demos (Anish Agnihotri, QV Lite) currently hold by default despite poor polish.

---

## 5. Sources

- [RxC QV App](https://quadraticvote.radicalxchange.org/) — RadicalxChange quadratic voting tool
- [RadicalxChange QV Wiki](https://www.radicalxchange.org/wiki/quadratic-voting/) — conceptual overview
- [RxC Voice GitHub](https://github.com/RadicalxChange/rxc-voice) — open source governance platform
- [Introducing RxC Voice](https://www.radicalxchange.org/updates/blog/introducing-rxc-voice/) — feature description
- [Community Poll Results 2022](https://www.radicalxchange.org/updates/announcements/community-poll-results-2022/) — RxC community feedback on UI/UX gaps
- [Snapshot Voting Types Docs](https://docs.snapshot.box/proposals/voting-types) — how QV works on Snapshot
- [Snapshot on Moonbeam](https://moonbeam.network/blog/voting-snapshot/) — Snapshot overview and UX
- [WTF is Quadratic Funding?](https://www.wtfisqf.com/) — interactive QF explainer (UX reference)
- [Gitcoin QV How-To Guide](https://www.gitcoin.co/blog/quadratic-voting-a-how-to-guide) — Gitcoin's QV explanation
- [Gitcoin Grants Stack](https://www.gitcoin.co/grants-stack) — QF platform overview
- [Gitcoin Grants 2024 Strategy](https://www.gitcoin.co/blog/gitcoin-grants-2024-strategy) — identified friction points
- [Pol.is Wikipedia](https://en.wikipedia.org/wiki/Pol.is) — platform overview
- [Computational Democracy Project (Pol.is)](https://compdemocracy.org/polis/) — technical documentation
- [Polis on Participedia](https://participedia.net/method/polis) — civic use cases
- [Civicbase (AI Magazine 2023)](https://onlinelibrary.wiley.com/doi/full/10.1002/aaai.12103) — academic paper on QVSR platform
- [Civicbase GitHub](https://github.com/civicbase/quadratic-vote) — React component library
- [Organize, Then Vote — CHI 2025](https://arxiv.org/abs/2503.04114) — cognitive load research on QV interfaces
- [The User Experience Problems Of Quadratic Voting — Tim Daub (2022)](https://timdaub.github.io/2022/03/27/the-user-experience-problems-of-quadratic-voting/) — practitioner UX critique
- [Quadratic Governance: What's Working and What's Not — DoraHacks Research](https://research.dorahacks.io/2022/07/11/quadratic-governance/) — deployment challenges
- [Anish Agnihotri QV Dashboard GitHub](https://github.com/Anish-Agnihotri/quadratic-voting) — open source reference implementation
- [Nathan Braun Vote Squared](https://nathanbraun.com/voting/) — dollar-budget QV tool
- [Mirror $WRITE Race Blog](https://dev.mirror.xyz/Js_GJfNUTPnuqLxlGN7YnX0Ynd0aspkhPWTskubBdzQ) — creative QV use case
- [Quadratic Voting in Colorado](https://www.radicalxchange.org/wiki/colorado-qv/) — legislature deployment
- [Gitcoin Passport / Human Passport](https://passport.human.tech/) — Sybil resistance tool
- [Vitalik: Moving Beyond Coin Voting](https://vitalik.eth.limo/general/2021/08/16/voting3.html) — critique of token governance
- [QV Lite (g0v GitHub)](https://github.com/g0v/quadratic-voting-lite) — lightweight QV tool
- [NN/G Slider Design Rules](https://www.nngroup.com/articles/gui-slider-controls/) — UX guidance on sliders
- [Sliders Degrade UX — Adam Silver](https://adamsilver.io/blog/sliders-degrade-ux-so-do-this-instead/) — alternative patterns
- [I can show what I really like — ACM CSCW 2021](https://dl.acm.org/doi/10.1145/3449281) — HCI research on QV preferences
- [QuadraticVote.co](https://quadraticvote.co/create) — additional QV tool reference
