# Quadratic Voting — Project Context

## What is Quadratic Voting?

Quadratic voting (QV) is a collective decision-making mechanism where participants receive a budget of "voice credits" and can allocate them across options. The cost of votes follows a quadratic function: **N votes on a single option costs N^2 credits.**

This means:

- 1 vote = 1 credit
- 2 votes = 4 credits
- 3 votes = 9 credits
- 10 votes = 100 credits

The key insight: QV lets people express **intensity of preference**, not just direction. You can put all your credits on one thing you care deeply about, or spread them across many things you mildly prefer.

## Why it matters

Traditional voting (1 person = 1 vote per option) has a fundamental flaw: it treats all preferences as equal. Someone who slightly prefers option A counts the same as someone whose livelihood depends on option A.

QV solves this by making concentrated votes expensive, naturally reflecting the economic concept of diminishing marginal returns.

## Use cases

| Use case            | Who                     | Example                                                                      |
| ------------------- | ----------------------- | ---------------------------------------------------------------------------- |
| Team prioritization | Product teams, startups | "We have 20 feature ideas. Everyone gets 100 credits. What should we build?" |
| Community decisions | HOAs, co-ops, clubs     | "How should we spend the community budget?"                                  |
| Classroom exercises | Professors, teachers    | "Teaching mechanism design — let students experience QV firsthand"           |
| DAO governance      | Crypto communities      | "Vote on treasury allocation proposals"                                      |
| Conference planning | Event organizers        | "Which talks should we include in the schedule?"                             |
| Retrospectives      | Agile teams             | "What should we improve? Vote with credits, not thumbs"                      |

## The QV ecosystem

We're part of a growing community of tools, researchers, and advocates working to make collective decisions fairer. These are our allies — each serves a different audience and pushes QV forward in different ways.

| Tool                              | What they do well                                              | Who they serve                                        |
| --------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------- |
| RadicalxChange QV tool            | Academic credibility, open-source, proven in civic experiments | Researchers, civic institutions, QV-aware communities |
| Pol.is                            | Opinion mapping, consensus finding at scale                    | Governments, large-scale deliberation                 |
| Snapshot                          | Crypto-native governance, multiple voting strategies           | DAOs, token-holder communities                        |
| Civicbase                         | Best-in-class budget visualization                             | Academic researchers, survey designers                |
| Google Forms / Slido / Mentimeter | Universal reach, simple UX                                     | Everyone — but without QV's signal                    |

## Our contribution

**The QV tool for people who've never heard of quadratic voting.**

Every tool above serves people who already understand QV or are in a context where it's explained to them. We serve the person who taps a link on their phone with zero context and needs to _get it_ in 90 seconds.

- No sign-up, no login, no wallet — just share a link
- The interface teaches QV by letting you do it — no docs needed
- Mobile-first, designed for how poll links actually travel (Slack, WhatsApp, iMessage)
- Clean, open-source codebase that developers can fork for their own QV experiments
- We expand the pie: more people experiencing QV means more demand for every tool in the ecosystem

## Target audiences

### 1. Poll creators

- **Who:** Team leads, professors, community organizers, DAO members
- **Need:** Run a QV poll quickly without explaining the math
- **Key flow:** Create poll → Get shareable link → Share → View results
- **Success:** "I set up a quadratic vote for my team in under 2 minutes"

### 2. Voters

- **Who:** Anyone who receives a poll link
- **Need:** Understand QV, vote, and move on — ideally under 2 minutes
- **Key flow:** Open link → Understand credits → Allocate → Submit → See results
- **Success:** "I got it immediately — the cost visualization made it click"

### 3. Developers

- **Who:** Engineers who find the repo on GitHub
- **Need:** Learn from clean code, fork for their own use, contribute
- **Key flow:** Find repo → Read README → Clone → Run locally → Understand architecture
- **Success:** "I had it running locally in 5 minutes and the code is easy to follow"
