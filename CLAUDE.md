# Quadratic Vote

A quadratic-voting web app for everyone (not just the QV crowd). Create a poll, share a
link, vote on your phone in 90 seconds. No signup. No wallet.

For visitor-facing context, see `README.md`. For PM artifacts, see `docs/pm/` (in the
sibling `quadratic-vote/` repo).

---

## Gates — run before claiming "done"

```bash
npm run check       # lint + tsc + vitest
npm run test:e2e    # Playwright (boots its own dev server on :3211)
npm run build       # surfaces production-only failures
```

For UI changes, also boot the running dev server and actually look at the page — or run
`tests/e2e/visual-snapshot.spec.ts` for fullPage screenshots.

---

## Next.js 16 — read this before touching app code

<!-- BEGIN:nextjs-agent-rules -->
**This is NOT the Next.js you know.** This version has breaking changes — APIs,
conventions, and file structure may all differ from your training data. Read the
relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed
deprecation notices.
<!-- END:nextjs-agent-rules -->

Specific gotchas hit in this codebase:

- `cookies()` is **async** — `const store = await cookies()`.
- Route params are async — `ctx: { params: Promise<{ id: string }> }`, then `await ctx.params`.
- `next/og` `ImageResponse` has a Node-runtime bug in dev. Routes use `runtime = 'edge'` — they work on Vercel; expect "Empty reply from server" locally.
- Default route caching for GET handlers is **dynamic**, not static — but for live polling routes, set `export const dynamic = 'force-dynamic'` + `Cache-Control: no-store` explicitly.

---

## Stack

- **Next.js 16** (App Router, Server Components by default, Turbopack)
- **TypeScript strict**
- **Tailwind v4** + **shadcn/ui** + Radix primitives (under `src/components/ui/`, don't hand-edit)
- **Drizzle ORM** + **Postgres** (local on `:5433` via Docker)
- **Zod 4** for shared client/server validation
- **React Hook Form**
- **SWR** for live polling on `/results`
- **framer-motion** for spring micro-animations
- **Sonner** for toasts
- **Vitest** (unit) + **Playwright** (e2e)

---

## Conventions

- **Zod schemas are the single source of truth.** `src/lib/validators/poll.ts` is imported by both API routes and forms. If you change a validation rule, change it there — never duplicate in two places.
- **API error shape.** Use `parseJson(request, schema)` from `src/lib/api.ts` — returns `{ ok, data | response }`. Don't re-implement the try/catch + ZodError branch.
- **Origin in URLs.** Resolve from request headers in server components (`x-forwarded-host` → `host`) and pass down as a prop. Avoid `window.location.origin` in components that render server-side — causes hydration mismatches.
- **Clipboard + downloads.** Use `useCopyToClipboard()` (`src/hooks/use-copy-to-clipboard.ts`) and `downloadAdminBackup` / `downloadVoterTokensCsv` (`src/lib/backup.ts`). Don't reach for `navigator.clipboard.writeText` or `new Blob(...)` inline.
- **Eyebrow pills.** Use `<Eyebrow icon={…}>LABEL</Eyebrow>` (`src/components/shared/eyebrow.tsx`). Not the 9 raw Tailwind incantations.
- **Brand tokens.** `bg-grad-brand` / `bg-grad-brand-soft` / `text-grad-brand` / `shadow-soft` / `shadow-brand` are defined in `src/app/globals.css`. Use them. Don't reinvent the gradient with inline colors.

---

## Voter identity model

Two modes per poll, set at creation, never changed after:

| Mode | Identity | Use case |
|---|---|---|
| `open` | `qv_voter_id` cookie | Public / casual sharing — one vote per browser, easy to bypass |
| `tokenized` | Pre-issued per-voter URL token | True one-vote-per-person — single-use links, audit trail in `voter_tokens` |

For tokenized polls, visiting bare `/poll/[id]` shows a friendly "you need your personal voter link" page. The actual voting URL is `/poll/[id]/v/[token]`.

Admin access is a separate URL token (`adminToken`, CUID2). Sent as `Authorization: Bearer` in PATCH — **never** in the URL (logs / Referer leaks).

---

## Database

- Local Postgres on `:5433` via `npm run db:up` (idempotent — uses Docker container `qv-postgres`).
- Migrations: `npm run db:generate` (after schema edits) then `npm run db:migrate`.
- `npm run db:seed` populates `/explore` with 8 example public polls + ~300 fake ballots so the page isn't empty.
- `npm run db:reset` nukes the container, starts fresh, and migrates — useful when iterating on schema.

Vote submission is wrapped in a Drizzle `transaction` for race-safety. The `ballots` table has `UNIQUE(poll_id, voter_id)` — that's the atomic single-vote gate, even for empty (abstention) ballots.

---

## Where to find things

```
src/
├── app/
│   ├── api/                    # Route handlers
│   │   ├── polls/              # CRUD + vote + results
│   │   └── og/                 # Dynamic OG images (Edge runtime)
│   ├── create/                 # Poll creation form
│   ├── explore/                # Public poll directory
│   ├── my/                     # Browser-local list of created polls
│   ├── poll/[id]/              # Voting + results + admin
│   │   └── v/[token]/          # Personalized voter link
│   ├── layout.tsx
│   └── page.tsx                # Landing
├── components/
│   ├── poll/                   # Create form + confirm dialog + progress overlay
│   ├── vote/                   # Voting UX (budget bar, option cards, walkthrough)
│   ├── results/                # Live results + chart
│   ├── admin/                  # Admin controls + post-create banner
│   ├── landing/                # Cost-curve demo
│   ├── my/                     # /my polls list
│   ├── shared/                 # Header + wordmark + Eyebrow
│   └── ui/                     # shadcn primitives (don't hand-edit)
├── db/
│   ├── index.ts                # Drizzle client (singleton in dev)
│   ├── schema.ts               # polls / options / voter_tokens / ballots / votes
│   ├── seed.ts
│   └── migrations/
├── hooks/                      # useIsClient, useCopyToClipboard
├── lib/
│   ├── quadratic.ts            # creditCost, validateBudget, canAffordAnyMoreVote
│   ├── validators/poll.ts      # Zod schemas (single source of truth)
│   ├── voter-cookie.ts         # getOrCreateVoterId
│   ├── my-polls.ts             # localStorage poll history
│   ├── backup.ts               # downloadAdminBackup / downloadVoterTokensCsv / csvCell
│   ├── polls.ts                # DB query helpers
│   ├── api.ts                  # parseJson, jsonError, zodErrorResponse
│   └── constants.ts
└── lib/__tests__/              # Vitest
tests/e2e/                      # Playwright (boots its own server on :3211)
```

---

## Dev quirks worth knowing

- **Port 3030**, not 3000 — `npm run dev` binds there (`next dev -p 3030`).
- **Postgres on 5433**, not 5432 — to avoid clashing with system Postgres installs.
- **next/og locally** — Node-runtime bug in this dev build; routes use Edge, work on Vercel, return empty locally. Don't chase this.
- **React Hook Form `watch()`** triggers a React Compiler warning. It's a known incompatibility, accepted.
- **Hydration mismatches** have been a recurring source of bugs. Anything that reads `window`, `localStorage`, or `Date.now()` during render needs `useIsClient()` (`src/hooks/use-is-client.ts`) or `useSyncExternalStore`.

---

## Workflow expectations

Match the global `~/.claude/CLAUDE.md` working style. Specifically here:

- **Audit before refactor** — `grep`/`find` first, ranked plan, one concern at a time.
- **Run `npm run check` after meaningful edits.** It's <10s and catches 90% of regressions.
- **For UI changes, look at the page** — not just trust that JSX compiles.
- **Schema changes need a migration** — `npm run db:generate --name=<descriptive>` + commit both the SQL and the snapshot.
- **No `console.log` left behind.** No commented-out blocks. No `TODO` without an owner or date.

### Keep the decision log current — non-negotiable

When you make a **non-obvious decision** in this repo, append it to
[`docs/decisions/README.md`](docs/decisions/README.md) before calling the work done. This
is part of the deliverable, not optional cleanup — the log is a flagship PM portfolio
artifact and it only stays valuable if it stays current.

A decision belongs in the log when it's a real fork in the road:

- A trade-off accepted on purpose (you chose X over Y and gave something up).
- A reversal of a prior assumption — **especially one driven by real use / dogfooding**
  (these are the highest-signal entries; note _what changed your mind_).
- A scope or strategy call (what you deliberately did _not_ build, and why).

It does **not** belong there for implementation detail (renames, refactors with no
behaviour change, bug fixes with no judgment call). Signal over volume.

Match the existing ADR-lite format: a bold title, then _context → decision → trade-off_,
in the right section (Scope · Product & UX · Engineering · Infrastructure · Strategy).
The `/log-decision` skill does this for you if it exists.
