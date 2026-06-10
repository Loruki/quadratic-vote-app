# Decision log

Every non-obvious call made building Quadratic Vote — from kickoff to the first
dogfooding pass — with the trade-off I accepted on purpose, and what changed my mind
when real use rewrote an assumption.

Lightweight ADRs: _context → decision → trade-off_. This is the fuller record behind
the "Product decisions & trade-offs" table in the [README](../../README.md). It only
logs actual forks-in-the-road, not implementation detail. Covers late May – early
June 2026.

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
