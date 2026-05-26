# PRD: [Feature Name]

# Problem Alignment

## Problem & Opportunity

Describe the problem we are trying to solve in 1-2 sentences. I should be able to read this alone and communicate the value to someone else.

- Why does this matter to our users and the project?
- What evidence or insights support this? (GitHub issues, user feedback, competitive analysis)
- Which users are affected? (Poll creators, voters, developers/contributors)
- Why is solving this problem urgent? Why now?
- How does this compare to existing QV tools? (RadicalxChange, Pol.is, Snapshot)

## High Level Approach

Describe the rough shape of how we might tackle the problem. I should be able to squint my eyes and see the same shape.

What alternatives did we consider? Why did we land with this?

### Narrative

**Optional**: Share stories to paint a picture of what life looks like for users today:

- **Poll creator story** — e.g., "Maria wants her team of 12 to prioritize the next quarter's roadmap. She's tired of everyone voting for everything equally..."
- **Voter story** — e.g., "Jake gets a link in Slack. He's never heard of quadratic voting. He needs to understand it, vote, and move on in under 2 minutes..."
- **Developer story** — e.g., "Priya finds the repo on GitHub. She wants to fork it for her DAO's governance tool..."

## Goals

1. _High-level goals in priority order_
2. _Include measurable goals and qualitative ones_
3. _Keep it short_

## Non-goals

1. _Explicit areas we do NOT plan to address_
2. _Explain why they are not goals_
3. _These are as important as the goals_

# Solution Alignment

## Key Features

Plan of record

1. _List features that shape the solution, in priority order_
2. _Which parts of the app are involved? (landing page, poll creation, voting UI, results, admin, API)_
3. _Draw the boundaries so the team can focus on how to fill it in_
4. _Challenge the size — can a smaller piece ship independently?_

Future considerations

1. _Features saved for later_
2. _These might inform how we build now_

### Key Flows

Show the end-to-end experience. This could be written prose, a flow diagram, or screen descriptions.

Consider both flows:

- **Creator flow:** Landing → Create → Get links → Share → Admin → View results
- **Voter flow:** Receive link → Understand QV → Allocate credits → Submit → See results

### Key Logic

1. _Rules to guide design and development_
2. _Common scenarios and edge cases_
3. _Non-functional requirements (performance, security, accessibility)_

# Development and Launch Planning

## Key Milestones

| Milestone            | Target Date | Owner |
| -------------------- | ----------- | ----- |
| Design / wireframes  |             |       |
| Core implementation  |             |       |
| Testing & polish     |             |       |
| Documentation        |             |       |
| Ship / merge to main |             |       |

## Checklist

- [ ] Core feature implemented and tested
- [ ] Unit tests written (Vitest)
- [ ] E2E tests written (Playwright)
- [ ] Mobile responsive
- [ ] Accessible (keyboard nav, screen reader, contrast)
- [ ] TypeScript strict — no `any`
- [ ] Zod validation on all API inputs
- [ ] Error states handled (network failure, invalid input, poll closed)
- [ ] Loading states for async operations
- [ ] README updated if new setup steps needed

---

## Other

- Appendix
- Changelog
- FAQ
- Risks
