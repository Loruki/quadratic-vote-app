# PM Workflows

This folder contains product management templates, research, and reference material for Quadratic Vote. Use these with Claude Code by @-mentioning the relevant files.

## Structure

```
docs/pm/
├── prd/
│   ├── templates/                              # Reusable PRD templates
│   │   ├── detailed-prd-template.md            # Full template (Problem + Solution alignment)
│   │   ├── lightweight-prd-template.md         # Quick 7-question template
│   │   └── socratic-questioning.md             # Framework for sharpening feature thinking
│   └── [your PRDs go here]                     # e.g., mvp-prd.md
├── research/
│   ├── key-findings.md                         # 7 findings → product decisions (start here)
│   ├── qv-implementations-and-theory.md        # Academic foundations, real-world case studies
│   ├── competitive-analysis.md                 # 10 existing tools analyzed, UX patterns, gap analysis
│   └── sources.md                              # All research URLs bookmarked by category
└── data/
    └── quadratic-voting-context.md             # Project context, audiences, competitors, use cases
```

## Agents (PRD Challengers)

Custom agents in `.claude/agents/` review your work from different perspectives:

| Agent         | Emoji  | Focus                                                       |
| ------------- | ------ | ----------------------------------------------------------- |
| `engineer`    | (@\_@) | Technical feasibility, architecture, security, performance  |
| `designer`    | (~‿~)  | UX flows, accessibility, mobile, interaction design         |
| `stakeholder` | (ಠ_ಠ)  | Scope discipline, success metrics, prioritization, strategy |
| `qa-engineer` | (¬_¬)  | Testability, edge cases, abuse vectors, error scenarios     |

## Common Workflows

### Writing a PRD

```
@docs/pm/prd/templates/detailed-prd-template.md
@docs/pm/prd/templates/socratic-questioning.md
@docs/pm/data/quadratic-voting-context.md
"Help me write a PRD for [feature]. Guide me through the process."
```

### Getting multi-perspective feedback on a PRD

Use the custom agents in `.claude/agents/`:

- `engineer` — Technical feasibility (Next.js, Supabase, Vercel serverless)
- `designer` — UX and accessibility (first-time voter experience, mobile)
- `stakeholder` — Scope and strategy (MVP discipline, audience fit, competitive positioning)
- `qa-engineer` — Testability and edge cases (budget validation, double-voting, abuse)

### Quick PRD for small features

```
@docs/pm/prd/templates/lightweight-prd-template.md
"Help me write a quick PRD for adding poll expiration dates."
```

### Referencing research

```
@docs/pm/research/competitive-analysis.md
@docs/pm/research/qv-implementations-and-theory.md
"What UX patterns work best for credit allocation? What can we learn from Colorado and Gitcoin?"
```
