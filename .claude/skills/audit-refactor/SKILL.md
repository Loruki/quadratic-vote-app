---
name: audit-refactor
description: For cross-cutting cleanup work (DRY refactors, dead-code removal, consistency passes, "is there duplication" reviews), follow the audit-then-execute discipline — catalog first, propose a ranked plan, wait for approval, execute one item at a time with /check between each.
---

# /audit-refactor — disciplined cleanup

Use whenever the user asks for cross-cutting cleanup. Triggers include:
"refactor", "DRY", "clean up", "audit", "tidy", "consolidate", "review for
duplication", "is there duplication", "review the code", "simplify".

**Never dive in.** Cross-cutting changes that mix concerns produce bugs that
are hard to localize. The four phases below are non-negotiable.

---

## Phase 1 — Catalog

Run grep / find searches to enumerate the pattern across the codebase.
Don't guess; measure. Use multiple greps in one bash call.

Examples of what to look for:

```bash
# Inlined clipboard logic
grep -rn "navigator.clipboard.writeText" src --include='*.tsx'

# Duplicated download patterns
grep -rn "createObjectURL\|new Blob" src --include='*.tsx' --include='*.ts'

# Duplicated Tailwind class strings (eyebrow pills, gradient buttons, etc.)
grep -rn 'rounded-full bg-grad-brand-soft.*uppercase tracking-' src --include='*.tsx'

# Stale state setters in effects (React Compiler antipatterns)
grep -rn 'useEffect.*setState\|setState.*useEffect' src --include='*.tsx'

# Dead exports (find files that are exported but never imported)
# Then check imports of suspected dead files:
grep -rn "from.*'./suspected-dead-file'" src
```

For each pattern found, count occurrences and note the affected files.

---

## Phase 2 — Propose

Present a ranked table to the user. Columns:

| # | Duplication / smell | Affected files | LOC saved | Risk | Recommended action |
|---|---|---|---|---|---|
| 1 | Dead code: file X (no imports) | 1 | -300 | None | Delete |
| 2 | Inlined clipboard logic (8 copies) | 5 | -60 | Low | Extract `useCopyToClipboard()` hook |
| 3 | Eyebrow pill Tailwind string (9 copies) | 7 | -50 | Low | Extract `<Eyebrow>` component |
| 4 | API try/catch JSON parse boilerplate (3 routes) | 3 | -25 | Low | Extract `parseJson()` helper |
| 5 | Type-spread + barrel exports | 4 | -10 | Medium | Skip — minor churn, high risk |

**Rank by leverage (LOC saved × consistency × low risk)**, not by alphabetical
order. Put dead-code deletions at the top — they're zero-risk and biggest.

**Always include a "skip" recommendation for low-leverage items.** Refactor
discipline is also knowing when to leave things alone.

End the Phase 2 message with: "Want me to execute 1–N? Pick a number or say all."

Wait for the user's pick before starting Phase 3.

---

## Phase 3 — Execute

**One item at a time. Gate between each.**

For each item the user approved:

1. Make the extraction / deletion / consolidation.
2. Run `/check` (the project gate skill).
3. If green, mark the item done.
4. If red, fix the failure before moving on. Don't accumulate broken state.
5. Move to the next item.

**Anti-patterns to avoid here:**

- ❌ Combining two items in one pass ("while I'm in there, let me also rename
  X") — defer it, separate commit.
- ❌ Adding new functionality during cleanup. Refactor preserves behavior.
- ❌ "Clever" abstractions (IIFEs, generic wrappers, HOCs). If a wrapper has
  one call site, inline it.
- ❌ Skipping the gate "to save time." The gate IS the time-saver — it catches
  the bug in 5s instead of 30min of bisecting later.

**One-line update after each item:**

> ✓ Item 2 done — extracted `useCopyToClipboard`, 5 call sites updated, gate green (33 tests).

---

## Phase 4 — Quantify

When all approved items are done, report the delta with numbers:

```
| Metric | Before | After |
|---|---|---|
| Total LOC | 5 207 | 5 000 (−207) |
| `navigator.clipboard.writeText` call sites | 8 | 1 |
| Inline admin-backup generators | 3 | 0 |
| Inline eyebrow pills | 9 | 0 |
| Unit tests | 31 | 33 |
```

Numbers make the refactor visible and prove the work happened. End with a
**"What got extracted"** list naming the new files and what each one
replaces — future-me reading the diff will want to know why.

---

## When NOT to use this skill

- Single-file edits (just edit the file).
- New features (use the regular dev flow).
- Bug fixes touching ≤2 files (just fix, gate, done).
- Renames / typo fixes (just do them).

The skill is for **cross-cutting changes touching ≥3 files** where mixing
concerns would make regressions hard to diagnose. Below that threshold, the
discipline costs more than it saves.
