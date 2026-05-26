---
name: check
description: Run the full quality gate for this repo (lint + typecheck + vitest, plus build / e2e when the diff calls for them). Use after any meaningful edit before claiming "done", and proactively whenever many files have changed since the last gate run.
---

# /check — the gate

The single command to verify the codebase before claiming a change is done.
Run after meaningful edits. Run again before reporting completion.

## When to run

- After any code change that could break something (most of them).
- Before saying "done", "shipped", "ready", "green", or claiming a feature works.
- When many files (≥5) have been touched since the last gate run.
- After resolving a bug — to confirm the fix doesn't regress something else.

## How to run

### Always (the baseline gate, ~5–10s)

```bash
npm run check
```

This runs `lint && typecheck && test`. If it fails, **stop and fix before
anything else**. Surface the failures with file:line.

### Also, if the diff touches UI or server components

```bash
npm run build
```

Catches production-only failures the dev server hides:
- RSC serialization errors (passing non-serializable props across the boundary)
- Missing `'use client'` on hooks/state
- Missing env vars used at build time
- Static-generation problems on dynamic routes

### Also, if a dev server is running on `:3030`

```bash
# Playwright tests against the live :3030 server, no auto-boot
npx playwright test --config=playwright.against-dev.config.ts --workers=1
```

Don't run the default `npm run test:e2e` if the dev server is already up — it
will try to boot a second one on `:3211` and conflict.

### Also, for UI-only changes

Run the visual-snapshot spec to verify nothing looks broken:

```bash
npx playwright test tests/e2e/visual-snapshot.spec.ts --config=playwright.against-dev.config.ts --workers=1
```

Then `Read` the screenshots in `screenshots/` to actually look at them. Don't
trust that the JSX compiles — trust that the page renders.

## How to report

One line per gate, in this order, with ✓ or ✗. Example green:

> ✓ lint · ✓ tsc · ✓ 33 vitest · ✓ build · ✓ 4 playwright

Example failure:

> ✗ tsc: `src/components/poll/create-poll-form.tsx:97 — Property 'pollId' does not exist on type '{ id: string }'`

If any gate fails, **do not declare done.** Fix the failure, re-run the failed
gate (not the whole suite — faster), then re-run the full suite once green.

## What "meaningful edit" means

- Changing a `.ts` / `.tsx` file: meaningful.
- Renaming an import or refactoring: meaningful.
- Adding a Drizzle column or running a migration: very meaningful — also verify the migration applied.
- Editing CSS only: lint + tsc is enough; skip vitest.
- Editing README / CLAUDE.md / docs: skip entirely.
