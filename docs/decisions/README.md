# Decision log

Every non-obvious call made building Quadratic Vote — from kickoff to the first
dogfooding pass — with the trade-off I accepted on purpose, and what changed my mind
when real use rewrote an assumption.

Lightweight ADRs: _context → decision → trade-off_. This is the fuller record behind
the "Product decisions & trade-offs" table in the [README](../../README.md). It only
logs actual forks-in-the-road, not implementation detail. Covers late May – September
2026 (#35–#40 are the V2 rework driven by community research).

---

## Scope & kickoff

### 1. Start fresh in a sibling repo, keep the PRD and research

A scaffold already existed. I started a clean `quadratic-vote-app/` instead of building
on it, but imported the existing PRD, competitive analysis, and research into `docs/pm/`.
**Trade-off:** re-did some setup; gained a clean, narratable history and a free choice of
stack — while keeping the product thinking that preceded the code.

### 2. Investigated the referenced "ECC" repo, then skipped it

A repo was suggested as a possible dependency. I read it, found it was an agent-harness
optimization system (not relevant to QV), and **chose not to adopt it** rather than bolt
on something that didn't fit. Useful for _how_ I worked, not as a dependency.

### 3. Ship the full MVP loop, not a thin slice

Create → vote → results → admin, end-to-end, over a thinner "core loop only" cut. The
loop only teaches QV if it's complete, so a half-loop wasn't worth shipping.

---

## Product & UX

### 4. No accounts — anonymous cookie + secret admin link

Signup is the single biggest drop-off for a "share a link, vote now" tool; the whole
positioning is _the link IS the product_. Voters are an `HttpOnly` CUID2 cookie; creators
get a secret admin URL instead of a login. **Trade-off:** on open polls a determined voter
can clear cookies and re-vote (Sybil-bypassable) — documented, not hidden. The answer for
higher stakes is #5.

### 5. Two voter models — open vs tokenized

_Open_ = cookie identity, one shared link. _Tokenized_ = one unguessable URL per named
voter; the token IS the identity and burns on submit. **Trade-off:** more schema + UI —
worth it; it's the feature no free QV tool offers and the honest fix for #4's Sybil limit.

### 6. Two visibility modes — public vs unlisted

_Unlisted_ (link-only) is the default; _public_ lists the poll on `/explore`. Tokenized
polls force unlisted (mixing public discovery with per-person links makes no sense).
**Trade-off:** an extra concept on the create form, gated so it doesn't crowd the default.

### 7. Cut negative votes from the MVP

QV's math supports "vote against," and the PRD listed it — but first-timers found it
confusing more than useful. The teaching moment lives entirely on the _positive_ cost
curve. Removed from the UI; kept the squaring primitive in `quadratic.ts` so a future
toggle can re-enable opposition with no rewrite. **Trade-off:** lost the opposition signal,
reversibly.

### 8. Visual direction — playful/energetic, not editorial or minimal

Offered three brand directions; chose **playful/energetic** (violet→pink→coral gradient,
soft shadows, spring motion) over editorial-serif or minimal-mono. It's the most shareable
register for a tool whose growth loop is "a link in a group chat." **Trade-off:** less
"serious institutional," but this isn't an institutional tool.

### 9. Live results by polling, not websockets

Results auto-refresh via SWR every 3s while a poll is open. The PRD listed real-time
websockets as a non-goal; polling is far simpler and indistinguishable for async voting.
**Trade-off:** a few seconds of lag and some idle requests — both irrelevant here.

### 10. Seed `/explore` so it's never empty on day one

Public discovery dies if the first visitor sees a blank page. Seeded curated polls with
realistic, quadratic-cost-aware vote distributions. **Trade-off:** a separate
`seed-public.ts`, hardened to require an explicit `DATABASE_URL` after it once wrote to the
wrong database.

### 11. Hard-block submission below 30% of budget

Started as a soft nudge ("Submit anyway"). A colleague still one-click-submitted a 1-credit
ballot — the mechanic failed _silently_. Made it a **hard gate**: a non-blank ballot under
30% can't submit; only "Keep voting". Abstention (blank) stays exempt. **→ Changed by:**
dogfooding. The escape hatch _was_ the bug.

### 12. Inline hint banner instead of a modal walkthrough

First version taught QV with a 3-step first-visit modal. **→ Changed by:** watching people
reflex-dismiss it without reading, then misuse the mechanic. A modal you must clear is a
modal people clear. The inline banner can't be swatted in one tap, and stays until they
vote.

### 13. Navigate to the admin page after creation, not a dismissable modal

Creation used to pop a share dialog over the form. Two problems: you could dismiss it and
lose the admin link, or re-submit the form. Now creation routes to the admin page itself
(its URL _is_ the admin link), with a one-time celebratory banner. **→ Changed by:** a user
reporting the modal was too easy to dismiss / re-trigger.

### 14. Deliberate ~1.5s creation overlay

Creation was _too_ fast — users couldn't tell anything happened or feared a double-submit.
Added a confirmation dialog (it's irreversible) → an animated progress overlay with a ~1.5s
minimum. **Trade-off:** slower on purpose. For an irreversible action, reassurance beats raw
speed. (Banks do this for the same reason.)

### 15. Admin-link safety net — localStorage + `/my` + backup file

No accounts means the secret admin link is the _only_ way back in. Three recovery layers:
the URL is bookmarkable; every created poll mirrors to `localStorage` and lists on `/my`; a
one-click `.txt` backup covers device switches. **Trade-off:** localStorage is per-browser
(hence the file); a lost token can't be reset without an account model — intentional.

### 16. Sticky budget + submit bars — mobile pattern, brought to desktop

Mobile pinned the budget bar to the top and the submit bar to the bottom (translucent,
blurred); desktop dropped them to static and ended up _worse_. Made both sticky on desktop
too. **→ Changed by:** a user noticing mobile was the better experience.

### 17. Admin can reset a tokenized voter's ballot

Voted rows in the admin voter list get a "Reset" that deletes the ballot (votes cascade)
and frees the token so the person can re-vote. **Scope decision:** tokenized polls only —
open polls have no per-person identity to reset, so the endpoint returns 400 there.

### 30. Votes render as literal squares — the gnomon grid

The vote page is the first-contact surface, yet it taught QV through muted caption numbers
and a _linear_ budget bar that hides the curve. After running ~21 redesign ideas through
the four perspective agents, each option card now renders N votes as an N×N block square,
with the affordable next vote as a dashed L-shell of exactly 2N+1 ghost cells — the
pricing rule made visible — and the price moved onto the + button itself.
**Killed on review:** the idea I started from (background color shifting as the budget
drains — color-only signal, urgency theater), flying budget blocks (meaning dies under
reduced motion), sliders, sound/haptics, and a first-tap celebration that would have
rewarded the exact one-tap behavior #11 hard-blocks. **Trade-off:** cells shrink past 5×5
so cross-card area comparison breaks at high counts (the budget bar owns that job), and I
shipped without a baseline ballot-shape measurement — prod is near-empty, so this is a bet
on embodiment to be validated by the next dogfood, not a measured comprehension fix.
**→ Refined by dogfooding (day one):** the "− refunds 7" caption sat directly under the
9-cell ghost shell and read as a contradiction — the numbers describe opposite directions
(next costs 2N+1, stepping back refunds 2N−1), and no first-timer should have to parse
that asymmetry. Deleted the refund line: tapping − is free and reversible, so it teaches
itself. The refund moved into the − button's accessible name.

### 32. Split the teaching: orientation in the banner, the lesson at the tap

With the gnomon grid drawing the cost, the first-visit banner's "2 votes = 4, 3 = 9, 4 = 16"
arithmetic became redundant — the cards now _show_ it. Divided the teaching by job: the
banner slims to the two things the cards can't say (your budget, and "you may tap one option
many times" — the anti-pattern fix from #12), and a new just-in-time annotation (the
reviews' "F19") teaches _why_ it's quadratic in two beats — beat 1 on the first vote
("that cost 1 credit"), beat 2 the first time an option hits 2 ("that one cost 3, not 1").
Beat 2 is deliberately the lesson; beat 1 is just the hook, because 1 credit is the one step
that doesn't feel quadratic. **Trade-off:** a second first-visit teaching layer alongside the
banner — accepted because they're now complementary, not duplicative (orientation vs.
cost-at-the-moment), gated by a separate `qv_cost_taught` flag, and the annotation is
transient. **Continues #12's lesson:** that ADR said "explanations get dismissed; the
interaction must teach" — F19 is that taken literally, teaching at the moment of the tap
rather than in a banner read before any tapping.

### 35. Lead with the job, not the mechanism

The first landing page sold quadratic voting itself ("Vote with _how much_ you care", "the
math that won Colorado, Gitcoin, Taiwan, Optimism"). **→ Changed by:** a Reddit/HN
demand study ([write-up](../pm/research/demand-and-distribution.md)). Nobody searches for
"quadratic voting"; outside crypto and voting-theory circles the term draws "zero faith
people would understand it" and "snake oil". But everyone runs retros and ranks roadmaps,
usually with dot voting. V2 leads with the job ("find out what your group cares about
most"), adds five templates, and explains QV lower down as _how_ it works. The old proof
line was also wrong: Colorado's use was stopped by a judge, and Optimism dropped QV, so
the Colorado story is now told in full. **Trade-off:** the brand (#26) still says
"Quadratic Vote" while the pitch barely does; a name/pitch mismatch accepted rather than
a rebrand before there's any signal.

### 36. Named ballots, opt-in and tokenized-only

Colorado's QV use was ended by a court because the ballots were _secret_, not because the
method failed. That made transparency a feature rather than a risk. Organizers of
tokenized polls can now choose **named ballots**: results list each person's allocation.
Only tokenized polls can have named ballots, because open polls have no names, and the
schema rejects the mix. Voters see "your ballot will be public" before voting. **Trade-off:**
a third concept on the create form (after voter mode and visibility) and a schema
migration. It's gated so it only appears after "Specific people" is picked, and anonymous
stays the default.

### 37. Show how results add up, instead of warning about small groups

Results used to say "QV works best with larger groups, interpret with care", which
undercut the very use case we now lead with (teams, families). In real-world QV tests,
the top complaint was not being able to tell whether results were plausible. Every option
now shows _backed by N of M voters_ and an expandable histogram (e.g. "3 voters × 1 vote")
that anyone can re-add by hand. It separates broad support from one enthusiast without
revealing who voted what. **Trade-off:** denser result cards, with the detail kept behind
a `<details>` so the ranking stays scannable.

### 38. Budget follows the option count; 25 credits retired

One real-world QV test gave voters 25 credits for 3 proposals, and many were left with
credits they couldn't spend (whole votes cost 1, 4, 9…). The create form now marks a
"best fit" budget (100 up to 6 options, 150 up to 12, 200 above) and keeps it in sync
as options are added, until the creator picks one by hand. 25 is no longer offered for
new polls; existing 25-credit polls still work. **Trade-off:** less creator control over
tiny budgets, which nobody seemed to want and which caused the most leftover credits.

---

## Engineering

### 18. Race-safe voting — one transaction, one atomic gate

Every invariant (poll open, budget, valid options, single ballot per voter, token
unconsumed) runs in one Drizzle transaction. The `UNIQUE(poll_id, voter_id)` index on
`ballots` is the atomic single-vote gate — it covers abstention and turns a double-submit
race into a clean 409 instead of two ballots.

### 19. Admin token in `Authorization: Bearer`, never the URL

URL tokens leak into server logs, browser history, and `Referer` headers. The admin token
rides in the header, compared with `crypto.timingSafeEqual`, and is stripped from the public
poll API response.

### 20. Hydration-safe client reads — `useIsClient` + server-resolved origin

Two production hydration mismatches: building absolute URLs from `window.location` client-side,
and reading `localStorage` during render. Fixed by resolving the origin from request headers
server-side, and gating browser-only reads behind a `useSyncExternalStore`-based `useIsClient`.
**Lesson:** server and first client render must emit byte-identical HTML.

### 21. Static OG card instead of dynamic `next/og`

Per-poll OG images via `next/og` on the Edge runtime timed out in production (0 bytes — Satori
couldn't resolve a font). Render the brand card once (headless Chromium → `public/og.png`) and
point all metadata at the static file. **Then:** shrank it to 1200×630 / ~360 KB after WhatsApp
rejected the 1.2 MB retina version and showed a fallback icon. **Trade-off:** generic card, not
per-poll. Reliable preview > clever broken one. Diagnosed live against prod.

### 22. `getPublicPolls` — `count()` + `groupBy`, not a correlated subquery

`/explore` showed "0 voters · 0 options" on polls with real data. Drizzle's raw-sql `${table}`
interpolation inside a correlated `SELECT` subquery didn't bind the outer row, so `COUNT(*)`
ran against an uncorrelated scope → 0 (and as a string, which broke pluralization too). Replaced
with two `count()` + `groupBy` queries joined in JS. **Lesson:** a suspiciously uniform value
from a raw subquery means a correlation bug before a data bug.

### 23. DRY refactor by audit-then-execute

After the build, ran a cataloged refactor pass: extracted `useCopyToClipboard` (was inlined 8×),
`lib/backup.ts` (3×), an `<Eyebrow>` component (9×), a `parseJson` API helper (3×), and deleted a
331-line dead share dialog. **Process decision:** catalog → ranked plan → one item at a time with
gates between — not an ad-hoc cleanup. −207 LOC, zero behaviour change.

### 31. Honor `prefers-reduced-motion` globally before adding more motion

The gnomon redesign multiplies decorative animation — and review found the app had _zero_
reduced-motion support. Treated as a prerequisite, not polish: a global
`MotionConfig reducedMotion="user"` now gates every framer-motion spring, and Playwright
emulates `reducedMotion: reduce` so e2e assertions never race an animation. **Trade-off:**
reduced-motion users get fades instead of spring choreography — acceptable because the
gnomon's meaning lives in its end state, not its motion (the same constraint that killed
the flying-blocks idea).

---

## Infrastructure & deployment

### 24. Neon Postgres (PG 17, no Neon Auth)

Chose Neon over Supabase for the managed Postgres — instant provisioning, generous free tier,
clean Drizzle fit. Declined Neon Auth: there are no accounts to authenticate, and adding one
would contradict #4.

### 25. One DNS zone — web on Vercel, email on OVH

The domain serves the app from Vercel (`A` + `CNAME`) while OVH keeps the email infra (MX, SPF,
DKIM) for a future `contact@`. Web and email are independent record types, so both coexist.
**Also:** deleted the IPv6 `AAAA` parking records — the sneaky ones that would have routed
IPv6 visitors to the OVH parking instead of Vercel.

### 26. Keep the brand "Quadratic Vote" despite the `quadratic-voting.com` domain

The exact-match `quadraticvote.com` was taken; the domain has a hyphen and "voting" vs "vote".
Decided **not** to rename (clunkier) and **not** to buy another domain yet — people click shared
links, they don't type the domain. Revisit `quadratic.vote` (which literally spells the brand)
only _after_ the product shows signal. A rich person's problem; solve it when it's earned.

### 33. Analytics via a shared growth-kit — proxied client + server-side conversions

Instrumented the funnel (`landing_view` → `signup_start` → `signup_complete` → `activated` → `shared`)
with a reusable drop-in kit (`src/growth-kit`, PostHog) shared across the side projects, not a
bespoke setup per app. Two deliberate choices for **blocker resilience**: client events route
through a same-origin `/ingest` reverse proxy (defeats domain-based ad blockers — most users), and
the events that matter — `signup_complete` (poll created) and `activated` (vote cast) — fire
**server-side** in the API routes, where no blocker exists. Server events are stitched to the
anonymous visitor via the PostHog cookie's `distinct_id` so the funnel stays one person.
**Trade-off:** top-of-funnel (`landing_view`, `signup_start`) stays client-side and best-effort —
a small slice of hyper-blocked visitors is lost, accepted because no browser analytics is 100%
blocker-proof. `shared` fires on copying the open voter link only (tokenized per-voter links not
instrumented yet).

---

## Strategy & process

### 27. Defer the public API and harden it first

The write API is open — no accounts, no rate limiting. Documenting it as "agent-ready" would
advertise an unprotected `POST /api/polls` (mass-create → fills the free-tier DB). Held the API
docs page until rate limiting lands; tracked in
[issue #1](https://github.com/Loruki/quadratic-vote-app/issues/1). **→ Surfaced by:** a user
asking "with which API keys, and isn't there a spam risk?" — the right question before exposing it.

### 28. Treat it as a vitamin — don't force a launch

Honest framing: this is a nice-to-have, not a painkiller, with ~0 users. So the go-to-market is a
cheap _test of appetite_, not an investment. **Rejected:** paid ads (no business model → negative
ROAS), a TikTok/blog treadmill (wrong founder fit), heavy SEO (low search volume). **Kept cheap:**
dogfood real decisions (team, family); let public discovery and the open-source repo work
passively. No pressure to grow something unvalidated.

### 29. Ship, then let real use rewrite the assumptions

The meta-decision. Most product changes above (#11, #12, #13, #16) came not from planning but from
shipping and watching ~12 colleagues actually vote. Thirty minutes of real use surfaced problems no
test caught. The build was the cheap part; the dogfooding was the product work.

### 34. Stop advertising the repo — a contact address instead of a GitHub link

The site pointed visitors at the GitHub repo ("Open source" in the landing tagline, a GitHub
link and "MIT" in the footer). I no longer want the code to be the public face of the product.
I removed all three and put `contact@quadratic-voting.com` in the footer as the one channel for
visitors. **Trade-off:** a voting tool gives up the trust signal of "read the code yourself",
and this partly reverses #28, which counted on the open-source repo to bring in visitors on its own.
A human inbox is a weaker transparency story, but it's a better way to hear from real users.

### 39. One comparison page: a narrow reversal of "no SEO"

#28 rejected heavy SEO as low-volume. The demand study sharpened that: there's almost no
search for "quadratic voting", but there is for "dot voting" and team prioritization. So
V2 adds exactly one evergreen page, [`/vs/dot-voting`](../../src/app/vs/dot-voting/page.tsx),
plus a sitemap and robots.txt. It says plainly when dot voting is the better choice.
**Trade-off:** partly reverses #28, kept to one page with no blog treadmill; more pages
only if this one earns traffic.

### 40. Voters are the channel: post-vote CTA + attribution

A 2021 "Show HN" of a QV polling app got 4 points and 0 comments; launches don't carry this
kind of product. What it does have for free: every poll reaches N voters, and the results
page is the last thing they see. That page (and the "you already voted" page) now offers
"Got a decision of your own?" with templates, linking to `/create?template=…&from=…`.
`signup_start` records `from` and `template`; `signup_complete` records `wasVoter` (this
browser's voter cookie has a ballot somewhere). Copying and exporting tokenized links now
fires `shared`, closing the gap noted in #33. **Trade-off:** `wasVoter` undercounts, because
tokenized voters never get the cookie, so the `from` parameter is the primary signal and
`wasVoter` a lower bound.
