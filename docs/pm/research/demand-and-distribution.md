# Demand & Distribution: Does Anyone Need QV?

Community research (Reddit + Hacker News), September 2026. Three questions: do people need
quadratic voting, is it actually useful, and how do we get it in front of people?

**TL;DR:** Nobody is asking for "quadratic voting". People do need _group prioritization
where intensity counts_ — a real, low-urgency job currently served by dot voting and
100-point allocation. QV is genuinely useful in a narrow slot (small trusted group, 3–10
options, scarce shared resource). It only spreads if we sell the job, not the mechanism.

---

## Method

- **Reddit:** direct search is blocked for crawlers, so we queried the PullPush archive
  (`api.pullpush.io`). Corpus: ~140 posts + ~210 comments mentioning "quadratic voting",
  all-time, plus targeted pulls from r/EndFPTP, r/PoliticalScience, r/ethereum,
  r/ProductManagement, r/agile, r/scrum, r/Teachers, r/boardgames, r/slatestarcodex.
- **Hacker News:** Algolia API — every QV story, full comment threads on the three
  biggest (UX problems, The Economist explainer, Tally guide).
- **Web:** existing QV tools, Colorado legislature outcome.

**Limits:** PullPush coverage is incomplete and its full-text search is fuzzy. Adjacent-need
queries ("dot voting", "100 points", "weighted poll") returned noise, so we have **no
Reddit evidence on the adjacent-need side** — only on QV-by-name. "Zero hits" means "the
archive didn't find it", not proof of absence. Treat everything here as directional.

---

## Q1 — Do people need it?

### Near-zero demand for QV by name

Reddit mentions fall into three buckets:

| Bucket | Where | What it looks like |
| --- | --- | --- |
| Political reform daydreams | r/neoliberal, r/EndFPTP, r/slatestarcodex, AskReddit | "If I were president: futarchy + quadratic voting" |
| Crypto / DAO governance | r/ethereum, r/ethtrader, r/CryptoCurrency, r/dao | Whale capture, Sybil attacks; "QV" usually means √token weighting, not a poll |
| Noise | r/Synthsara and similar | AI-generated manifestos using QV as a buzzword |

**Missing entirely:** "we used QV to decide X with our team / class / family" stories, and
anyone asking "is there a tool for this?". The archive returned **zero** QV comments in
r/ProductManagement, r/agile, r/scrum, r/Teachers, r/boardgames.

### Skeptics are loud and specific

- **Comprehension:** "In theory, I like things like Quadratic voting for its mathematical
  properties… I have zero faith that people would understand it." (r/slatestarcodex, 2026)
- **Credibility:** "Quadratic Voting is snake oil." (r/EndFPTP, 2019) · "It has no desirable
  properties and just seems to be invented by grifters to bamboozle people with math
  words." (r/EndFPTP, 2023)
- **Money confusion:** many assume votes are bought with real money — "poll taxes 2.0,
  now with extra feudalism" (HN). Every popular article mixes the two ideas.
- **Collusion:** two voters who split credits across each other's picks both gain
  (4 credits each: 2+2 votes solo vs ≈2.8+2.8 pooled). Raised in several HN threads.
- **Ballot poisoning:** adding a decoy option can drain an opposing bloc's credits (HN).

---

## Q2 — Is it really useful?

### Yes — in one narrow slot

**Small group · trusted members · 3–10 options · a scarce shared resource to divide**
(budget, roadmap, retro topics, offsite agenda, event programme).

- **Strongest real-world proof:** Colorado House Democrats used QV from 2019 to rank which
  bills deserved limited state funds, and kept using it until a Denver judge ordered them
  to stop in January 2024. The ruling was about **secrecy** (anonymous ballots = "serial
  meeting" under the Open Meetings Law), not about the method failing. The legislature
  then passed SB24-157 narrowing the law.

### Real users struggle — the known UX failure modes

StrikeDAO ran a live QV vote at Bundeskunsthalle (Germany, 2022). The author reported:

1. **Stranded credits** — with 25 credits over 3 proposals, voters often had leftovers they
   couldn't spend.
2. **Results felt unverifiable** — "Did the vote work out well? Are the results plausible
   or did someone hack it?"
3. **General confusion** — conclusion: "the world isn't ready for quadratic voting."

HN commenters added:

- Allocating takes **much longer** than a thumbs-up; people do a first pass, then a second
  weighted pass while tracking the remaining budget.
- **Bigger budgets feel better** — The Economist demo (100 credits / 10 issues) was praised;
  25 credits felt wasteful.
- **Show marginal cost as 1, 3, 5, 7…** rather than explaining squares. (Already shipped:
  F19, cost taught at the tap.)
- **Publish the credit histogram per option** so anyone can sanity-check totals.

### Bad fit

Binary yes/no questions, one-shot single-winner choices, large public or political votes.

---

## Q3 — How to distribute it

1. **Don't lead with "quadratic voting".** Lead with the job: _"Prioritize as a group in
   90 seconds — and let people show how much they care."_ QV is the _how_, not the
   headline. People search for "dot voting", "prioritize features with team",
   "100 point method", "retro voting".
2. **Real competitors are dot voting and 100-point allocation** (Miro, FigJam, Mentimeter,
   Slido) — not other QV tools. Dedicated QV tools (qv.geek.sg, RxC QV, Voqua) haven't
   broken out. A 2021 "Show HN: I made a polling app based on Quadratic Voting" got
   **4 points, 0 comments** — a launch post alone won't carry this.
3. **The growth loop is built in:** every poll is sent to N voters; the results page is
   the ad. **Voter → creator conversion** is the metric that matters more than any channel.
4. **Reddit:** answer "how do we decide X as a group?" threads in r/agile, r/scrum,
   r/ProductManagement, r/Teachers and facilitation communities — don't launch-post.
   QV-literate niches (r/EndFPTP, r/votingtheory, RadicalxChange, Gitcoin) are good for
   credibility and critique, but small and partly hostile.
5. **Content hooks:**
   - "The voting method Colorado lawmakers used for 5 years — until a judge banned it."
   - "Dot voting vs quadratic voting: why piling all your dots on one option stops working."

---

## Implications for the product

_Status: all shipped in V2 (September 2026). Decisions #35–#40 in the [decision log](../../decisions/README.md)._

| Finding | Implication |
| --- | --- |
| No one searches for QV | Landing copy, SEO and OG text lead with prioritization, not the mechanism name |
| Competitor is dot voting | Build a "dot voting alternative" page; offer retro / roadmap / offsite templates |
| Stranded credits frustrate | Keep default budgets generous relative to option count |
| Results feel unverifiable | Consider a per-option credit histogram on `/results` |
| "Paying for votes" confusion | Say explicitly: "everyone gets the same credits — nothing is bought" |
| Colorado was killed by secrecy | Transparency (named voters / audit trail in tokenized mode) is a selling point |
| Viral loop is intrinsic | Instrument and optimise voter → creator conversion first |

---

## Sources

- [HN — The user experience problems of quadratic voting (2022)](https://news.ycombinator.com/item?id=30822489) · [article](https://timdaub.github.io/2022/03/27/the-user-experience-problems-of-quadratic-voting/)
- [HN — The Economist QV article (2021)](https://news.ycombinator.com/item?id=29586658) · [Economist interactive](https://www.economist.com/interactive/2021/12/18/quadratic-voting)
- [HN — Show HN: polling app based on QV (2021)](https://news.ycombinator.com/item?id=29618875)
- [Colorado Sun — Judge orders halt to QV (2024)](https://coloradosun.com/2024/01/05/colorado-legisalture-quadratic-voting-lawsuit/) · [CPR](https://www.cpr.org/2024/01/05/democrats-secret-voting-system-colorado-legislature/) · [SB24-157](https://leg.colorado.gov/bills/sb24-157)
- Reddit: [r/slatestarcodex — "zero faith people would understand it"](https://reddit.com/r/slatestarcodex/comments/1r0nnc8/how_to_save_american_democracy/o4mp8c9/) · [r/EndFPTP — "snake oil"](https://reddit.com/r/EndFPTP/comments/bk9isd/a_new_way_of_voting_that_makes_zealotry_expensive/emhth2f/) · [r/EndFPTP — "grifters"](https://reddit.com/r/EndFPTP/comments/15sot9v/voting_methods_stanford_encyclopedia_of_philosophy/jwwijik/) · [r/EndFPTP — buying votes with money](https://reddit.com/r/EndFPTP/comments/bg1hw5/colorado_tried_a_new_way_to_vote_make_people/eljr6zu/)
- Tools: [qv.geek.sg](https://qv.geek.sg/) · [Voqua](https://voqua.io/) · [RadicalxChange QV](https://www.radicalxchange.org/wiki/quadratic-voting/) · [Miro dot voting](https://miro.com/templates/dot-voting/) · [Mentimeter](https://www.mentimeter.com/features/live-polling)
- Data: [PullPush Reddit archive API](https://pullpush.io/) · [HN Algolia API](https://hn.algolia.com/api)
