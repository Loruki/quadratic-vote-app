# Decision log

The non-obvious calls made building Quadratic Vote, and the trade-offs I accepted
on purpose. Lightweight ADRs — each is _context → decision → trade-off_, plus what
changed my mind when real use rewrote an assumption.

This is the fuller record behind the "Product decisions & trade-offs" table in the
[README](../../README.md). Covers the initial build and the first dogfooding pass
(late May – early June 2026).

---

## Product

### 1. No accounts — anonymous cookie + secret admin link

**Context.** Signup is the single biggest drop-off for a "share a link, vote now" tool.
The whole positioning is _the link IS the product_.

**Decision.** No auth. Voters are an anonymous `HttpOnly` cookie (CUID2). Poll creators
get a secret admin URL token instead of a login.

**Trade-off (accepted).** On open polls a determined voter can clear cookies / use
incognito and vote again — Sybil-bypassable. Fine for team/classroom polls; documented,
not hidden. The mitigation for the higher-stakes case is decision #2.

### 2. Two voter models — open vs tokenized

**Context.** "Anyone with the link" is great for casual polls but useless when
one-vote-per-person actually matters (board votes, hiring panels).

**Decision.** Two modes. _Open_ = cookie identity, share one link. _Tokenized_ =
pre-issue one unguessable URL per named voter; the token IS the identity and burns on
submit (in the same transaction as the ballot).

**Trade-off.** More schema (`voter_tokens`) and more create/admin UI. Worth it — it's the
feature no free QV tool offers, and it's the honest answer to #1's Sybil limit.

### 3. Cut negative votes from the MVP

**Context.** QV's math supports "vote against" (negative votes cost the same N²). The PRD
listed it. But in testing, first-timers found it confusing more than useful — the teaching
moment lives entirely on the positive cost curve (tap +, watch the budget drain).

**Decision.** Remove negative votes from the UI. Keep the squaring primitive in
`quadratic.ts` so a future poll-creator toggle can re-enable opposition with no rewrite.

**Trade-off.** Lost the opposition signal. Reversible by design.

### 4. Hard-block submission below 30% of budget

**Context.** Started as a soft nudge ("you have credits left — keep going, Submit anyway").
Then a colleague, in real use, tapped + once and submitted a 1-credit ballot anyway. The
mechanic failed _silently_ — it looked like a normal pick-one poll.

**Decision.** Make it a **hard gate**: a non-blank ballot under 30% of budget can't be
submitted; the only action is "Keep voting". Blank ballots (abstention) stay exempt —
submitting zero votes is a legitimate choice.

**What changed my mind.** Dogfooding. The nudge wasn't enough; the escape hatch _was_ the
bug. (Open question logged: a hard 30% floor also blocks someone who legitimately wants to
vote small and concentrated — accepted for now, threshold is one constant to tune.)

### 5. Inline hint banner instead of a modal walkthrough

**Context.** First version taught QV with a 3-step modal on first visit.

**Decision.** Replace it with an inline banner above the options that stays until the voter
votes or dismisses it.

**What changed my mind.** Watching people reflex-dismiss the modal without reading a word,
then misuse the mechanic. A modal you have to clear is a modal people clear. Inline can't be
swatted away in one tap.

### 6. Deliberate ~1.5s creation overlay

**Context.** Poll creation is fast — _too_ fast. Users clicked "Create", the page changed
instantly, and they weren't sure anything happened or whether they'd double-submitted.

**Decision.** A confirmation dialog (it's irreversible) → an animated progress overlay with a
~1.5s minimum → navigate to the admin page. Added latency on purpose.

**Trade-off.** Slower than it needs to be. For an irreversible action, reassurance beats raw
speed. (Banks do this for the same reason.)

### 7. Admin-link safety net — localStorage + /my + backup file

**Context.** No accounts means the secret admin link is the _only_ way back into a poll.
Lose it and you've lost control.

**Decision.** Three recovery layers: the admin URL is the address bar (bookmarkable); every
created poll is mirrored to `localStorage` and listed on `/my`; and a one-click `.txt`
backup for switching devices. A post-creation banner pushes all three.

**Trade-off.** localStorage is per-browser — clearing data still loses it. That's why the
backup file exists. Can't reset a lost token without an account model (intentional).

### 8. Sticky budget + submit bars — mobile pattern, brought to desktop

**Context.** Mobile pinned the budget bar to the top and the submit bar to the bottom
(translucent, blurred), so on a long option list you always saw both. Desktop dropped them to
static — and ended up _worse_ than mobile.

**Decision.** Keep both bars sticky on desktop too (budget under the header, submit as a
floating centered bar). Surfaced by a user noticing mobile was the better experience.

---

## Engineering

### 9. Race-safe voting — one transaction, one atomic gate

**Decision.** Every vote invariant (poll open, budget, valid options, single ballot per
voter, token unconsumed) runs inside one Drizzle transaction. The `UNIQUE(poll_id, voter_id)`
index on `ballots` is the atomic single-vote gate — it covers abstention too, and turns a
double-submit race into a clean 409 instead of two ballots.

### 10. Admin token in `Authorization: Bearer`, never the URL

**Decision.** Admin actions read the token from the `Authorization` header, compared with
`crypto.timingSafeEqual`. The token never rides in a query string.

**Why.** URL tokens leak into server logs, browser history, and `Referer` headers. The header
keeps the only key out of all three. The public poll API also strips `adminToken` from its
response.

### 11. Static OG card instead of dynamic `next/og`

**Context.** Per-poll OG images via `next/og` on the Edge runtime timed out in production
(0 bytes / HTTP 000 — Satori couldn't resolve a font and the default-font fetch hung).

**Decision.** Render the brand card once (headless Chromium → `public/og.png`, 1200×630,
~360 KB so WhatsApp doesn't reject it) and point all metadata at the static file. Deleted the
dynamic routes; recoverable from git if the Edge issue is ever worth fighting.

**Trade-off.** Poll-specific cards became one generic brand card. A reliable share preview
beats a clever broken one. Diagnosed live against prod, not guessed.

### 12. `getPublicPolls` — `count()` + `groupBy`, not a correlated subquery

**Context.** `/explore` cards showed "0 voters · 0 options" on polls with real data. Root
cause: Drizzle's raw-sql `${table}` interpolation inside a correlated `SELECT` subquery didn't
bind the outer row, so `COUNT(*)` always evaluated against an uncorrelated scope → 0 (and as a
string, which also broke pluralization).

**Decision.** Replace with two `count()` + `groupBy` queries joined in JS. Counts are real
numbers. Lesson: when a raw-sql subquery returns a suspiciously uniform value, suspect the
correlation before the data.

---

## Process & scope

### 13. Defer the public API and harden it first

**Context.** The write API is open — no accounts, no rate limiting. Documenting it as an
"agent-ready API" would advertise an unprotected `POST /api/polls` (mass-create → fills the
free-tier DB).

**Decision.** Hold the API docs page until rate limiting lands. Tracked in
[issue #1](https://github.com/Loruki/quadratic-vote-app/issues/1). Surfaced by a user asking
"with which API keys, and isn't there a spam risk?" — the right question before exposing it.

### 14. Ship, then let real use rewrite the assumptions

**The meta-decision.** Most of the changes above (#3, #4, #5, #8) came not from planning but
from shipping and watching ~12 colleagues actually vote. Thirty minutes of real use surfaced
problems no test caught. The build was the cheap part; the dogfooding was the product work.
