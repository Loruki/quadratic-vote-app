# Quadratic Vote

A quadratic-voting web app for everyone — not just the QV crowd. Create a poll, share a
link, vote on your phone in 90 seconds. No signup. No wallet.

## Why quadratic voting?

Traditional voting captures *which* options people prefer, but not *how much* they care.
Quadratic Vote gives every voter a credit budget — and the more votes you put on one
option, the more it costs (N votes = N² credits). Caring deeply means paying real
budget to express it; spreading thin is cheap. The math:

- 1 vote → 1 credit
- 2 votes → 4 credits
- 3 votes → 9 credits
- 10 votes → 100 credits (your whole default budget on one option)

The whole UI teaches this by letting you feel the cost curve as you allocate.

## What ships in this version

- **Create a poll** with 2–20 options and a credit budget (25 / 50 / 100 / 150 / 200).
- **Two voter models**:
  - *Anyone with the link* (cookie-based identity — one vote per browser).
  - *Specific people* (pre-issued per-voter tokens — true one-vote-per-person).
- **Two visibility modes**:
  - *Unlisted* — only people with the link can find it.
  - *Public* — listed on `/explore`.
- **Live results** that auto-refresh every 3s while the poll is open.
- **/explore** page seeded with realistic public polls so the experience isn't empty
  on day one.
- **Admin controls** to close / reopen the poll via a secret URL token (sent as
  `Authorization: Bearer` to keep it out of access logs and Referers).
- **Dynamic OG images** per poll for clean previews in Slack / iMessage / Twitter.

## Stack

- Next.js 16 (App Router, Server Components by default)
- TypeScript strict
- Tailwind v4 + shadcn/ui + Radix
- Drizzle ORM + Postgres
- Zod for shared client/server validation
- React Hook Form
- SWR for live polling
- framer-motion micro-animations
- Sonner toasts
- Vitest (unit) + Playwright (e2e)

## Data model

```
polls
  id, title, description, credits_per_voter, admin_token,
  visibility ('public' | 'unlisted'),
  voter_mode ('open' | 'tokenized'),
  is_closed, created_at, closes_at

options             — N labels per poll
voter_tokens        — pre-issued per-voter URL tokens (tokenized polls only).
                      consumed_at + ballot_id form the audit trail.
ballots             — one row per ballot submission. UNIQUE(poll_id, voter_id)
                      is the atomic single-vote gate (covers abstention too).
votes               — one row per (ballot × option) with non-zero allocation.
                      UNIQUE(ballot_id, option_id).
```

For **open** polls `voter_id` is the cookie. For **tokenized** polls `voter_id` is the
`voter_tokens.id`, and submitting a vote burns the token in the same transaction.

## Routes

| Route | What |
|---|---|
| `/` | Landing page with interactive cost-curve demo |
| `/explore` | Grid of public polls |
| `/create` | Poll creation form |
| `/poll/[id]` | Voting page (open polls); friendly redirect for tokenized polls |
| `/poll/[id]/v/[token]` | Personal voter link (tokenized polls) |
| `/poll/[id]/results` | Live results — auto-refreshes via SWR |
| `/poll/[id]/admin/[token]` | Admin: close/reopen + voter-link copy |

## API

| Method + Path | Body / Notes |
|---|---|
| `POST /api/polls` | `{ title, description?, options[], creditsPerVoter, visibility, voterMode, voters? }` → `{ id, adminToken, voterUrl, adminUrl, voterTokens[] }` |
| `GET /api/polls/[id]` | Poll + options + current voter's allocations (if any). Strips `adminToken`. |
| `POST /api/polls/[id]/vote` | `{ allocations[], voterToken? }`. Resolves identity from token (tokenized) or cookie (open). Atomic. |
| `GET /api/polls/[id]/results` | Aggregate results. `force-dynamic`, polled by SWR every 3s. |
| `PATCH /api/polls/[id]` | Admin only. Token in `Authorization: Bearer`. `{ isClosed: boolean }`. |
| `GET /api/og/site` | Site-wide social card. |
| `GET /api/og/poll/[id]` | Per-poll social card with title + voter count. |

## Setup

Requires Node 20+ and Docker.

```bash
# Install
npm install

# Start Postgres (port 5433, isolated from any system pg)
npm run db:up

# Apply migrations
npm run db:migrate

# Seed with example public polls (optional but recommended)
npm run db:seed

# Start the dev server
npm run dev
```

Visit http://localhost:3030.

## Scripts

| Script | What |
|---|---|
| `npm run dev` | Next.js dev server on :3030 |
| `npm run build` | Production build |
| `npm run start` | Run production build on :3030 |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest unit tests |
| `npm run test:e2e` | Playwright e2e (boots its own dev server on :3211) |
| `npm run db:up` / `db:down` / `db:reset` | Manage the Postgres container |
| `npm run db:generate` / `db:migrate` | Drizzle migrations |
| `npm run db:seed` | Populate `/explore` with example polls |
| `npm run format` | Prettier |

## Architecture notes

- **Race-safe vote submission** — all invariants (poll open, budget, valid options,
  single ballot per voter, token unconsumed) are enforced inside one Drizzle
  transaction. The `UNIQUE(poll_id, voter_id)` index on `ballots` is the atomic gate.
- **Admin token hygiene** — never sent in URLs (avoids logs / Referer leaks), compared
  with `crypto.timingSafeEqual`, and stripped from the public poll API.
- **Numeric bounds** — `numVotes` is clamped to `[0, 50]` in Zod and `allocations` are
  deduped server-side. Negative / oversized inputs return 400, not 500.
- **Anonymous identity** — cookie tokens are CUID2, `HttpOnly`, `SameSite=Lax`. The
  cookie ID is what `ballots.voter_id` stores for open polls.

## Layout

```
src/
├── app/
│   ├── api/
│   │   ├── polls/...           # CRUD + vote + results
│   │   └── og/                 # Dynamic OG images (Edge runtime)
│   ├── create/                 # Poll creation page
│   ├── explore/                # Public poll directory
│   ├── poll/[id]/
│   │   ├── page.tsx            # Voting page (open polls)
│   │   ├── v/[token]/page.tsx  # Personal voter link (tokenized)
│   │   ├── results/            # Live results
│   │   └── admin/[token]/      # Admin
│   ├── layout.tsx
│   └── page.tsx                # Landing
├── components/
│   ├── poll/                   # Create form + share dialog
│   ├── vote/                   # Voting UX (budget bar, option cards, walkthrough)
│   ├── results/                # Live results + chart
│   ├── admin/                  # Admin controls
│   ├── landing/                # Cost-curve demo
│   ├── shared/                 # Site header + wordmark
│   └── ui/                     # shadcn primitives
├── db/
│   ├── index.ts                # Drizzle client
│   ├── schema.ts               # polls / options / voter_tokens / ballots / votes
│   ├── seed.ts                 # Example public polls
│   └── migrations/
├── lib/
│   ├── quadratic.ts            # creditCost, validateBudget, canAffordAnyMoreVote…
│   ├── validators/poll.ts      # Zod schemas (single source of truth)
│   ├── voter-cookie.ts         # getOrCreateVoterId
│   ├── polls.ts                # DB helpers
│   ├── api.ts                  # JSON error helpers
│   └── constants.ts
└── lib/__tests__/              # Vitest
tests/e2e/                      # Playwright
```

## Known follow-ups before launch

- Deploy to Vercel + a managed Postgres (Neon / Supabase). Set `DATABASE_URL`
  and `NEXT_PUBLIC_SITE_URL` env vars in the platform.
- Add rate limiting on `POST /api/polls` and `POST /api/polls/[id]/vote`.
- Real-device testing on iOS Safari + Android Chrome.
- Privacy notice (GDPR — even anonymous cookies need disclosure in the EU).
- Templates: "Pick a name", "Prioritize features", "Allocate budget."

## License

MIT.
