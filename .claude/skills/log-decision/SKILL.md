---
name: log-decision
description: >
  Append a non-obvious decision to docs/decisions/README.md in this repo's
  ADR-lite format. Use right after making a real fork-in-the-road call — a
  trade-off accepted on purpose, a reversal driven by dogfooding, or a scope /
  strategy decision. Invoke as /log-decision, or reach for it proactively when
  CLAUDE.md's "keep the decision log current" rule applies.
---

# /log-decision — keep the decision log current

The decision log (`docs/decisions/README.md`) is a flagship PM portfolio artifact.
It only stays valuable if it stays current. This skill appends one decision in the
right format and section.

## When a decision belongs in the log

Append it when it's a **real fork in the road**:

- A trade-off accepted on purpose (chose X over Y, gave something up).
- A reversal of a prior assumption — **especially one driven by real use / dogfooding**.
  These are the highest-signal entries; always note _what changed your mind_.
- A scope or strategy call (what you deliberately did _not_ build, and why).

**Do NOT log** implementation detail — renames, behaviour-preserving refactors, or bug
fixes with no judgment call. Signal over volume. If you're unsure, it probably doesn't
belong.

## How to append

1. **Read** `docs/decisions/README.md` to see the current sections and the last entry
   number.
2. **Pick the section:** `Scope & kickoff` · `Product & UX` · `Engineering` ·
   `Infrastructure & deployment` · `Strategy & process`.
3. **Write the entry** with the next running number, matching the existing format:

   ```markdown
   ### N. Short imperative title

   One or two sentences of **context** (the situation / problem). Then the
   **decision** (what you chose). Then the **trade-off** you accepted. For a
   dogfooding-driven reversal, add: **→ Changed by:** <what real use revealed>.
   ```

   Keep it tight — 2–5 sentences. The strongest entries name the trade-off explicitly
   and, when relevant, what changed your mind.

4. If the decision is one of the headline calls, also add or update a row in the
   README's "Product decisions & trade-offs" table so the summary stays in sync.

5. Confirm the markdown renders (no broken numbering, right section).

## Style

- First person ("I chose…"), honest, matching the surrounding entries.
- Name the trade-off — a decision with no downside isn't a decision worth logging.
- Link issues / files where useful (e.g. `[issue #1](...)`).
